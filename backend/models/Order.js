import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      size: { type: String },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
    }
  ],
  giftItem: {
    name: { type: String },
    image: { type: String },
    price: { type: Number, default: 0 },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'GiftProduct' },
  },
  vipDiscount: {
    applied: { type: Boolean, default: false },
    percent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
  },
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  paymentMethod: { type: String, required: true },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String },
  },
  itemsPrice: { type: Number, required: true, default: 0.0 },
  taxPrice: { type: Number, required: true, default: 0.0 },
  shippingPrice: { type: Number, required: true, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 },
  isPaid: { type: Boolean, required: true, default: false },
  paidAt: { type: Date },
  isDelivered: { type: Boolean, required: true, default: false },
  deliveredAt: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered'],
    default: 'pending',
  },
  trackingNumber: { type: String, unique: true, sparse: true },
  orderNumber: { type: Number, unique: true },
  delivery: {
    driverName: { type: String },
    driverPhone: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    locationUpdatedAt: { type: Date },
  },
}, {
  timestamps: true,
});

orderSchema.pre('save', async function () {
  if (this.isNew && !this.orderNumber) {
    const last = await mongoose.model('Order').findOne().sort({ orderNumber: -1 }).select('orderNumber');
    this.orderNumber = (last?.orderNumber || 1000) + 1;
  }
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
