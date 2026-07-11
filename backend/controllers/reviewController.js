import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createReview = async (req, res) => {
  try {
    const { rating, comment, photos } = req.body;
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const order = await Order.findOne({
      user: req.user._id,
      'orderItems.product': req.params.productId,
      isDelivered: true,
    });
    if (!order) return res.status(400).json({ message: 'Only verified purchasers can review. You must purchase and receive the product first.' });

    const existing = await Review.findOne({ user: req.user._id, product: req.params.productId });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this product' });

    const uploadedPhotos = [];
    if (photos && Array.isArray(photos)) {
      for (const photo of photos.slice(0, 3)) {
        try {
          const result = await cloudinary.uploader.upload(photo, {
            folder: 'reviews',
            width: 800,
            crop: 'limit',
          });
          uploadedPhotos.push(result.secure_url);
        } catch (err) {
          console.error('Cloudinary upload error:', err.message);
        }
      }
    }

    const review = await Review.create({
      user: req.user._id,
      product: req.params.productId,
      order: order._id,
      rating,
      comment,
      photos: uploadedPhotos,
    });

    const reviews = await Review.find({ product: req.params.productId, isApproved: true, isHidden: false });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = reviews.length > 0 ? totalRating / reviews.length : 0;
    product.numReviews = reviews.length;
    await product.save();

    const populated = await Review.findById(review._id).populate('user', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { sort } = req.query;
    let sortOption = { createdAt: -1 };
    if (sort === 'highest') sortOption = { rating: -1 };
    else if (sort === 'lowest') sortOption = { rating: 1 };

    const reviews = await Review.find({
      product: req.params.productId,
      isApproved: true,
      isHidden: false,
    })
      .populate('user', 'name')
      .sort(sortOption);

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('user', 'name email')
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const { isApproved, isHidden } = req.body;
    if (typeof isApproved === 'boolean') review.isApproved = isApproved;
    if (typeof isHidden === 'boolean') review.isHidden = isHidden;
    await review.save();

    const product = await Product.findById(review.product);
    if (product) {
      const reviews = await Review.find({ product: review.product, isApproved: true, isHidden: false });
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      product.rating = reviews.length > 0 ? totalRating / reviews.length : 0;
      product.numReviews = reviews.length;
      await product.save();
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await Review.findByIdAndDelete(req.params.id);

    const product = await Product.findById(review.product);
    if (product) {
      const reviews = await Review.find({ product: review.product, isApproved: true, isHidden: false });
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      product.rating = reviews.length > 0 ? totalRating / reviews.length : 0;
      product.numReviews = reviews.length;
      await product.save();
    }

    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
