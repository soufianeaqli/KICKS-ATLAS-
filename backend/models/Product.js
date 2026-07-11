import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  images: [{ type: String, required: true }],
  description: { type: String, required: true },
  brand: { type: String, required: true }, // Nike, Puma, etc.
  category: { type: String, required: true }, // National Team, Raja, Wydad, etc.
  type: { type: String, required: true }, // Jersey, Tracksuit, Sneaker
  season: { type: String }, // e.g. 23/24
  version: { type: String, enum: ['player', 'fan', 'retro', 'none'], default: 'fan' },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  inStock: { type: Boolean, default: true },
  countInStock: { type: Number, required: true, default: 0 },
  sizes: [{
    size: { type: String }, // S, M, L, XL, etc.
    quantity: { type: Number, default: 0 }
  }],
  colors: [{ type: String }],
  isLimitedEdition: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
export default Product;
