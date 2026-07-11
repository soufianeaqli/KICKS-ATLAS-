import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getUsers, deleteUser, updateUser, updateProfile, getChallenges } from '../controllers/userController.js';

const router = express.Router();

router.get('/challenges', protect, getChallenges);

router.route('/')
  .get(protect, admin, getUsers);

router.route('/profile')
  .put(protect, updateProfile);

router.route('/:id')
  .delete(protect, admin, deleteUser)
  .put(protect, admin, updateUser);

export default router;
