import express from 'express';
import { getGiftProducts, getAllGiftProducts, createGiftProduct, updateGiftProduct, deleteGiftProduct, getPromotionConfig, updatePromotionConfig } from '../controllers/giftController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/products', getGiftProducts);
router.get('/products/all', protect, admin, getAllGiftProducts);
router.post('/products', protect, admin, createGiftProduct);
router.put('/products/:id', protect, admin, updateGiftProduct);
router.delete('/products/:id', protect, admin, deleteGiftProduct);
router.get('/config', getPromotionConfig);
router.put('/config', protect, admin, updatePromotionConfig);

export default router;
