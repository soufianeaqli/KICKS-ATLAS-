import express from 'express';
import { getAdminNotifications } from '../controllers/notificationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, admin, getAdminNotifications);

export default router;
