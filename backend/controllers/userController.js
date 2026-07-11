import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { PromotionConfig } from '../models/GiftPromotion.js';
import { VipConfig, VipMember } from '../models/VipMember.js';

export const getChallenges = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const promConfig = await PromotionConfig.findOne();
    const vipConfig = await VipConfig.findOne();

    // -- Transparent Migration for Old VIP --
    let vip = await VipMember.findOne({ user: user._id });
    if (vip && vip.isActive && !user.vipActiveUntil) {
      user.vipActiveUntil = vip.expiresAt;
      await user.save();
    }
    // De-activate expired VIP
    if (user.vipActiveUntil && user.vipActiveUntil < new Date()) {
      user.vipActiveUntil = null;
      await user.save();
    }

    // -- Transparent Migration for Old Gift --
    if (!user.giftRedeemed) {
      const userOrdersForGift = await Order.find({ user: user._id });
      const oldGiftRedeemed = userOrdersForGift.some(o => o.giftItem && o.giftItem.name);
      if (oldGiftRedeemed) {
        user.giftRedeemed = true;
        await user.save();
      }
    }

    // Only compute progression for users who HAVEN'T redeemed the gift OR for VIP progression
    let totalItems = 0;
    let totalSpent = 0;
    let nationalQty = 0;

    const orders = await Order.find({ user: user._id });
    for (const o of orders) {
      if (o.isDelivered) {
        totalItems += o.orderItems.reduce((s, i) => s + i.quantity, 0);
      }
      totalSpent += o.totalPrice || 0;
    }

    // Compute nationalQty for Gift (based on ALL orders, not just delivered, per business logic)
    if (!user.giftRedeemed) {
      const allProductIds = [];
      const qtyMap = {};
      for (const o of orders) {
        for (const i of o.orderItems) {
          const pid = i.product?.toString();
          if (pid) {
            allProductIds.push(pid);
            qtyMap[pid] = (qtyMap[pid] || 0) + i.quantity;
          }
        }
      }
      if (allProductIds.length > 0) {
        const products = await Product.find({ _id: { $in: allProductIds } });
        for (const p of products) {
          if (p.category === (promConfig?.categoryFilter || 'national')) {
            nationalQty += qtyMap[p._id.toString()] || 0;
          }
        }
      }
    }

    const giftAlreadyRedeemed = user.giftRedeemed;
    const vipAlreadyUsed = !!user.vipActiveUntil; // For now, if active, it's used. Wait, VIP can be renewed! 

    const giftEligible = promConfig?.isEnabled && !giftAlreadyRedeemed && nationalQty >= (promConfig?.minQuantity || 5) && totalSpent >= (promConfig?.minAmount || 2000);
    const vipEligible = vipConfig?.isActive && !vipAlreadyUsed && totalItems >= (vipConfig?.minPurchaseCount || 10);
    const isVip = !!user.vipActiveUntil;

    res.json({
      totalItems,
      nationalQty,
      totalSpent,
      gift: {
        eligible: giftEligible,
        alreadyRedeemed: giftAlreadyRedeemed,
        progress: Math.min(100, (nationalQty / (promConfig?.minQuantity || 5)) * 100),
        current: nationalQty,
        target: promConfig?.minQuantity || 5,
        isActive: promConfig?.isEnabled || false,
      },
      vip: {
        eligible: vipEligible,
        alreadyUsed: vipAlreadyUsed,
        isActive: isVip,
        progress: Math.min(100, (totalItems / (vipConfig?.minPurchaseCount || 10)) * 100),
        current: totalItems,
        target: vipConfig?.minPurchaseCount || 10,
        programActive: vipConfig?.isActive || false,
        discount: vipConfig?.discountPercent || 15,
        remainingDays: isVip ? Math.max(0, Math.ceil((user.vipActiveUntil - new Date()) / (1000 * 60 * 60 * 24))) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Impossible de supprimer un admin' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    const updated = await user.save();
    res.json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    const { name, email, password, currentPassword } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      if (!currentPassword) return res.status(400).json({ message: 'Mot de passe actuel requis' });
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Le mot de passe actuel est incorrect' });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    const updated = await user.save();
    res.json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role, token: req.headers.authorization.split(' ')[1] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
