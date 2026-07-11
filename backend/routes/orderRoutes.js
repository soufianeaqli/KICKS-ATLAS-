import express from 'express';
import { addOrderItems, checkGiftEligibility, getOrderById, getMyOrders, getOrders, updateOrderToDelivered, updateOrderToPaid, trackOrder, updateOrderStatus, updateDeliveryLocation, deleteOrder } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.post('/check-gift', protect, checkGiftEligibility);
router.route('/myorders').get(protect, getMyOrders);
router.get('/track/:trackingNumber', trackOrder);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/delivery-location').put(protect, admin, updateDeliveryLocation);
router.route('/:id').delete(protect, deleteOrder);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/pay').put(protect, admin, updateOrderToPaid);

export default router;
