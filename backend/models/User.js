import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // optional for Google Auth users
  googleId: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  giftRedeemed: { type: Boolean, default: false },
  vipActiveUntil: { type: Date },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
export default User;
