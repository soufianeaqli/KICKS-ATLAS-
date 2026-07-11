import mongoose from 'mongoose';

const vipConfigSchema = new mongoose.Schema({
  isActive: { type: Boolean, default: true },
  minPurchaseCount: { type: Number, default: 10 },
  minSpendingAmount: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 15 },
  durationDays: { type: Number, default: 30 },
}, { timestamps: true });

const vipMemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  startedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const VipConfig = mongoose.model('VipConfig', vipConfigSchema);
const VipMember = mongoose.model('VipMember', vipMemberSchema);

export { VipConfig, VipMember };
