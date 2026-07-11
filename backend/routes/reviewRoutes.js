import express from 'express';
import { createReview, getProductReviews, getAllReviews, updateReview, deleteReview } from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/all', protect, admin, getAllReviews);
router.put('/:id', protect, admin, updateReview);
router.delete('/:id', protect, admin, deleteReview);
router.post('/product/:productId', protect, createReview);
router.get('/product/:productId', getProductReviews);

export default router;
