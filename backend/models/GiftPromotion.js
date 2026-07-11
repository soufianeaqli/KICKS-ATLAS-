import mongoose from 'mongoose';

const giftProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const promotionConfigSchema = new mongoose.Schema({
  isEnabled: { type: Boolean, default: false },
  minQuantity: { type: Number, default: 5 },
  minAmount: { type: Number, default: 2000 },
  categoryFilter: { type: String, default: 'national' },
}, { timestamps: true });

const GiftProduct = mongoose.model('GiftProduct', giftProductSchema);
const PromotionConfig = mongoose.model('PromotionConfig', promotionConfigSchema);

export { GiftProduct, PromotionConfig };
