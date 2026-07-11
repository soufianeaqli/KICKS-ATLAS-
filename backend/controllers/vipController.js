import { VipConfig, VipMember } from '../models/VipMember.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

export const getVipConfig = async (req, res) => {
  try {
    let config = await VipConfig.findOne();
    if (!config) {
      config = await VipConfig.create({});
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateVipConfig = async (req, res) => {
  try {
    const { isActive, minPurchaseCount, minSpendingAmount, discountPercent, durationDays } = req.body;
    let config = await VipConfig.findOne();
    if (!config) {
      config = new VipConfig();
    }
    if (typeof isActive === 'boolean') config.isActive = isActive;
    if (minPurchaseCount !== undefined) config.minPurchaseCount = minPurchaseCount;
    if (minSpendingAmount !== undefined) config.minSpendingAmount = minSpendingAmount;
    if (discountPercent !== undefined) config.discountPercent = discountPercent;
    if (durationDays !== undefined) config.durationDays = durationDays;
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkVipStatus = async (req, res) => {
  try {
    const config = await VipConfig.findOne();
    if (!config || !config.isActive) {
      return res.json({ isVip: false, vip: null, config: config || null });
    }

    let vip = await VipMember.findOne({ user: req.user._id });
    if (vip) {
      if (vip.expiresAt < new Date() && vip.isActive) {
        vip.isActive = false;
        await vip.save();
      }
      return res.json({ isVip: vip.isActive, vip, config });
    }

    const orders = await Order.find({ user: req.user._id, isDelivered: true });
    const totalItems = orders.reduce((sum, o) => sum + o.orderItems.reduce((s, i) => s + i.quantity, 0), 0);
    const totalSpent = orders.reduce((sum, o) => sum + o.totalPrice, 0);

    const qualifies = totalItems >= config.minPurchaseCount || (config.minSpendingAmount > 0 && totalSpent >= config.minSpendingAmount);

    if (qualifies) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + config.durationDays);
      vip = await VipMember.create({
        user: req.user._id,
        expiresAt,
      });
      return res.json({ isVip: true, vip, config, justUpgraded: true });
    }

    return res.json({ isVip: false, vip: null, config });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyVipStatus = async (req, res) => {
  try {
    const config = await VipConfig.findOne();
    let vip = await VipMember.findOne({ user: req.user._id });

    if (vip && vip.expiresAt < new Date() && vip.isActive) {
      vip.isActive = false;
      await vip.save();
    }

    const isValid = vip && vip.isActive;
    const remainingDays = isValid ? Math.ceil((vip.expiresAt - new Date()) / (1000 * 60 * 60 * 24)) : 0;

    res.json({
      isVip: isValid,
      vip: isValid ? vip : null,
      config,
      remainingDays,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllVipMembers = async (req, res) => {
  try {
    const members = await VipMember.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const config = await VipConfig.findOne();

    const enriched = members.map(m => ({
      ...m.toObject(),
      remainingDays: m.isActive ? Math.max(0, Math.ceil((m.expiresAt - new Date()) / (1000 * 60 * 60 * 24))) : 0,
    }));

    res.json({ members: enriched, config });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
