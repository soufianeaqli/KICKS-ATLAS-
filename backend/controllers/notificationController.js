import Contact from '../models/Contact.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

export const getAdminNotifications = async (req, res) => {
  try {
    const since = req.query.since ? new Date(req.query.since) : null;

    const unreadMessages = await Contact.countDocuments({ read: false });

    const orderQuery = { isPaid: false };
    if (since) {
      orderQuery.createdAt = { $gt: since };
    }
    const newOrders = await Order.countDocuments(orderQuery);

    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();

    const orderFilter = since ? { createdAt: { $gt: since } } : {};
    const recentOrders = await Order.find(orderFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .select('orderNumber totalPrice isPaid status createdAt');

    const recentMessages = await Contact.find({ read: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subject createdAt');

    const totalUnread = unreadMessages + newOrders;

    res.json({
      counts: {
        unreadMessages,
        newOrders,
        totalUnread,
        totalOrders,
        totalProducts,
      },
      recentOrders,
      recentMessages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
