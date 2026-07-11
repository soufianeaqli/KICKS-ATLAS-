import express from 'express';
import { getVipConfig, updateVipConfig, checkVipStatus, getMyVipStatus, getAllVipMembers } from '../controllers/vipController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/config', getVipConfig);
router.put('/config', protect, admin, updateVipConfig);
router.get('/check', protect, checkVipStatus);
router.get('/me', protect, getMyVipStatus);
router.get('/members', protect, admin, getAllVipMembers);

export default router;
