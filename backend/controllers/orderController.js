import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { PromotionConfig } from '../models/GiftPromotion.js';
import { VipConfig, VipMember } from '../models/VipMember.js';
import crypto from 'crypto';

const generateTrackingNumber = () => {
  const prefix = 'AK';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const addOrderItems = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice, giftItem, vipDiscount } = req.body;

    if ((!orderItems || orderItems.length === 0) && !req.body.giftItem) {
      res.status(400).json({ message: 'No order items' });
      return;
    }

    const populatedItems = [];
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        populatedItems.push({
          name: item.name || product.name,
          quantity: item.quantity,
          image: item.image || product.images[0],
          price: item.price || product.price,
          size: item.size,
          product: product._id,
        });
      } else {
        populatedItems.push(item);
      }
    }

    const order = new Order({
      orderItems: populatedItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    if (giftItem) {
      const config = await PromotionConfig.findOne();
      if (!config || !config.isEnabled) {
        return res.status(400).json({ message: "La promotion du cadeau gratuit n'est pas active." });
      }

      const user = await User.findById(req.user._id);

      // Check if already redeemed (user flag OR legacy order check)
      let alreadyUsed = user.giftRedeemed;
      if (!alreadyUsed) {
        const userOrders = await Order.find({ user: user._id });
        alreadyUsed = userOrders.some(v => v.giftItem && v.giftItem.name);
      }

      if (alreadyUsed) {
        return res.status(400).json({ message: "Vous avez déjà réclamé votre cadeau gratuit !" });
      }

      // Check eligibility based on FULL order history (not just current order)
      // This matches the logic in getChallenges and checkGiftEligibility
      const allOrders = await Order.find({ user: user._id });
      const allProductIds = [];
      const qtyMap = {};
      for (const o of allOrders) {
        for (const i of o.orderItems) {
          const pid = i.product?.toString();
          if (pid) {
            allProductIds.push(pid);
            qtyMap[pid] = (qtyMap[pid] || 0) + i.quantity;
          }
        }
      }
      // Also include the current order's items
      for (const item of populatedItems) {
        const pid = item.product?.toString();
        if (pid) {
          allProductIds.push(pid);
          qtyMap[pid] = (qtyMap[pid] || 0) + item.quantity;
        }
      }

      let nationalQty = 0;
      if (allProductIds.length > 0) {
        const products = await Product.find({ _id: { $in: allProductIds } });
        for (const p of products) {
          if (!config.categoryFilter || p.category === config.categoryFilter) {
            nationalQty += qtyMap[p._id.toString()] || 0;
          }
        }
      }

      if (nationalQty < config.minQuantity) {
        return res.status(400).json({ message: `Condition non remplie : il faut ${config.minQuantity} produits nationaux (vous en avez ${nationalQty}).` });
      }

      order.giftItem = {
        name: giftItem.name,
        image: giftItem.image,
        price: 0,
        product: giftItem.product,
      };

      user.giftRedeemed = true;
      await user.save();
    }

    if (vipDiscount && vipDiscount.applied) {
      const config = await VipConfig.findOne();
      if (config && config.isActive) {
        const vipMember = await VipMember.findOne({ user: req.user._id, isActive: true, expiresAt: { $gt: new Date() } });
        if (vipMember) {
          order.vipDiscount = {
            applied: true,
            percent: vipDiscount.percent || config.discountPercent,
            discountAmount: vipDiscount.discountAmount || 0,
          };
        }
      }
    }

    order.trackingNumber = generateTrackingNumber();
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkGiftEligibility = async (req, res) => {
  try {
    const { orderItems, itemsPrice } = req.body;
    if (!orderItems || orderItems.length === 0) {
      return res.json({ eligible: false, reason: 'Cart is empty' });
    }

    const config = await PromotionConfig.findOne();
    if (!config || !config.isEnabled) {
      return res.json({ eligible: false, reason: 'Promotion not active' });
    }

    const productIds = orderItems.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = {};
    for (const p of products) productMap[p._id.toString()] = p;

    let nationalQty = 0;
    for (const item of orderItems) {
      const prod = productMap[item.product];
      if (prod && prod.category === config.categoryFilter) {
        nationalQty += item.quantity;
      }
    }

    const total = parseFloat(itemsPrice) || 0;

    const user = await User.findById(req.user._id);
    let alreadyRedeemed = user.giftRedeemed;
    if (!alreadyRedeemed) {
      const userOrders = await Order.find({ user: user._id });
      alreadyRedeemed = userOrders.some(v => v.giftItem && v.giftItem.name);
    }
    
    const eligible = nationalQty >= config.minQuantity && !alreadyRedeemed;

    res.json({
      eligible,
      alreadyRedeemed,
      requiredQty: config.minQuantity,
      currentQty: nationalQty,
      reason: alreadyRedeemed ? 'You have already claimed a free gift' : (eligible ? '' : `Need ${Math.max(0, config.minQuantity - nationalQty)} more national team item(s)`),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    const updated = await order.save();

    const config = await VipConfig.findOne();
    if (config && config.isActive && updated.user) {
      const existingVip = await VipMember.findOne({ user: updated.user });
      if (!existingVip) {
        const userOrders = await Order.find({ user: updated.user, isDelivered: true });
        const totalItems = userOrders.reduce((sum, o) => sum + o.orderItems.reduce((s, i) => s + i.quantity, 0), 0);
        const totalSpent = userOrders.reduce((sum, o) => sum + o.totalPrice, 0);
        const qualifies = totalItems >= config.minPurchaseCount || (config.minSpendingAmount > 0 && totalSpent >= config.minSpendingAmount);
        if (qualifies) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + config.durationDays);
          await VipMember.create({ user: updated.user, expiresAt });
        }
      }
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const trackOrder = async (req, res) => {
  try {
    const param = req.params.trackingNumber;
    const isNumber = /^\d+$/.test(param);
    const query = isNumber ? { orderNumber: parseInt(param) } : { trackingNumber: param };
    const order = await Order.findOne(query).populate('orderItems.product', 'name images');
    if (!order) {
      return res.status(404).json({ message: 'Aucune commande trouvée avec ce numéro de suivi.' });
    }
    const timeline = [
      { status: 'confirmed', label: 'Commande confirmée', date: order.createdAt, done: true },
      { status: 'processing', label: 'En cours de préparation', date: order.paidAt || order.createdAt, done: order.isPaid || order.status !== 'pending' },
      { status: 'shipped', label: 'Expédiée', date: null, done: order.status === 'shipped' || order.status === 'delivered' },
      { status: 'delivered', label: 'Livrée', date: order.deliveredAt, done: order.isDelivered || order.status === 'delivered' },
    ];
    res.json({
      trackingNumber: order.trackingNumber,
      status: order.status,
      timeline,
      delivery: order.delivery || null,
      items: order.orderItems.map(i => ({ name: i.name, quantity: i.quantity, image: i.image })),
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      estimatedDelivery: order.deliveredAt || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide.' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    if (status === 'shipped' && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
    }
    const updated = await order.save();

    if (status === 'delivered') {
      const config = await VipConfig.findOne();
      if (config && config.isActive && updated.user) {
        const existingVip = await VipMember.findOne({ user: updated.user });
        if (!existingVip) {
          const userOrders = await Order.find({ user: updated.user, isDelivered: true });
          const totalItems = userOrders.reduce((sum, o) => sum + o.orderItems.reduce((s, i) => s + i.quantity, 0), 0);
          const totalSpent = userOrders.reduce((sum, o) => sum + o.totalPrice, 0);
          const qualifies = totalItems >= config.minPurchaseCount || (config.minSpendingAmount > 0 && totalSpent >= config.minSpendingAmount);
          if (qualifies) {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + config.durationDays);
            await VipMember.create({ user: updated.user, expiresAt });
          }
        }
      }
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDeliveryLocation = async (req, res) => {
  try {
    const { driverName, driverPhone, lat, lng } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (driverName !== undefined) order.delivery.driverName = driverName;
    if (driverPhone !== undefined) order.delivery.driverPhone = driverPhone;
    if (lat !== undefined) order.delivery.lat = lat;
    if (lng !== undefined) order.delivery.lng = lng;
    if (lat !== undefined || lng !== undefined) order.delivery.locationUpdatedAt = new Date();
    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.user && req.user.isAdmin) {
      await Order.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Commande supprimée' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    if (!order.isPaid || !order.isDelivered) {
      return res.status(400).json({ message: 'Seules les commandes payées et livrées peuvent être supprimées.' });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Commande supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.isPaid = true;
    order.paidAt = Date.now();
    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
