import Product from '../models/Product.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    // Pagination & Search
    const pageSize = req.query.all === 'true' ? 0 : 12;
    const page = Number(req.query.pageNumber) || 1;
    const team = req.query.team;
    
    let query = {};
    if (team) {
      query.category = team;
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .limit(pageSize || undefined)
      .skip(pageSize * (page - 1));

    res.json({ products, page, pages: pageSize > 0 ? Math.ceil(count / pageSize) : 1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, slug, images, description, brand, category, type, season, version, price, discountPrice, inStock, countInStock, sizes, colors, isLimitedEdition } = req.body;
    if (!name || !description || !brand || !category || !type || price === undefined || price === null) {
      return res.status(400).json({ message: 'Champs requis manquants: name, description, brand, category, type, price' });
    }
    let finalSlug = slug || name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const existing = await Product.findOne({ slug: finalSlug });
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }
    const finalImages = images && images.length > 0 ? images : ['https://via.placeholder.com/400x500?text=No+Image'];
    const finalPrice = Number(price) || 0;
    const finalDiscountPrice = discountPrice ? Number(discountPrice) : undefined;
    const finalCountInStock = countInStock !== undefined ? Number(countInStock) : 0;
    const product = await Product.create({ name, slug: finalSlug, images: finalImages, description, brand, category, type, season, version, price: finalPrice, discountPrice: finalDiscountPrice, inStock, countInStock: finalCountInStock, sizes, colors, isLimitedEdition });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
