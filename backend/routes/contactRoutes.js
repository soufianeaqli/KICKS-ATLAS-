import express from 'express';
import { submitContact, getContacts, deleteContact, markReadContact, markAllReadContact } from '../controllers/contactController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(submitContact)
  .get(protect, admin, getContacts);

router.put('/mark-all-read', protect, admin, markAllReadContact);

router.route('/:id')
  .delete(protect, admin, deleteContact)
  .put(protect, admin, markReadContact);

export default router;
