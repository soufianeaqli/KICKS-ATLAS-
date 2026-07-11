import { GiftProduct, PromotionConfig } from '../models/GiftPromotion.js';

export const getGiftProducts = async (req, res) => {
  try {
    const gifts = await GiftProduct.find({ isActive: true });
    res.json(gifts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllGiftProducts = async (req, res) => {
  try {
    const gifts = await GiftProduct.find({}).sort({ createdAt: -1 });
    res.json(gifts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGiftProduct = async (req, res) => {
  try {
    const { name, image, description } = req.body;
    if (!name || !image) return res.status(400).json({ message: 'Name and image are required' });
    const gift = await GiftProduct.create({ name, image, description });
    res.status(201).json(gift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGiftProduct = async (req, res) => {
  try {
    const gift = await GiftProduct.findById(req.params.id);
    if (!gift) return res.status(404).json({ message: 'Gift not found' });
    const { name, image, description, isActive } = req.body;
    if (name) gift.name = name;
    if (image) gift.image = image;
    if (description !== undefined) gift.description = description;
    if (typeof isActive === 'boolean') gift.isActive = isActive;
    await gift.save();
    res.json(gift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGiftProduct = async (req, res) => {
  try {
    const gift = await GiftProduct.findById(req.params.id);
    if (!gift) return res.status(404).json({ message: 'Gift not found' });
    await GiftProduct.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gift removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPromotionConfig = async (req, res) => {
  try {
    let config = await PromotionConfig.findOne();
    if (!config) {
      config = await PromotionConfig.create({});
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePromotionConfig = async (req, res) => {
  try {
    const { isEnabled, minQuantity, minAmount, categoryFilter } = req.body;
    let config = await PromotionConfig.findOne();
    if (!config) {
      config = new PromotionConfig();
    }
    if (typeof isEnabled === 'boolean') config.isEnabled = isEnabled;
    if (minQuantity !== undefined) config.minQuantity = minQuantity;
    if (minAmount !== undefined) config.minAmount = minAmount;
    if (categoryFilter) config.categoryFilter = categoryFilter;
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
