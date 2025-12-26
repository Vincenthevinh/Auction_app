const Product = require('../models/Product');
const Category = require('../models/Category');

// Get all products with pagination, filtering, sorting
exports.getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, category, subcategory, search, sort } = req.query;
    const skip = (page - 1) * limit;

    let query = { status: 'active' };

    // Filter by category
    if (subcategory) {
      query.subcategory = subcategory;
    } else if (category) {
      query.category = category;
}

    // Full-text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    let sortObj = { createdAt: -1 };
    if (sort === 'price-asc') sortObj = { currentPrice: 1 };
    if (sort === 'price-desc') sortObj = { currentPrice: -1 };
    if (sort === 'views') sortObj = { viewCount: -1 };
    if (sort === 'bids') sortObj = { bidCount: -1 };
    if (sort === 'ending-soon') sortObj = { endTime: 1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('seller', 'name shopName sellerRating')
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sortObj);

    res.json({
      items: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single product
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('seller', '-password')
      .populate('winnerId', 'name email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// Create product
exports.createProduct = async (req, res, next) => {
  try {
    const { title, description, category, subcategory, startPrice, minIncrement, buyNowPrice, condition, startTime, endTime, location, shippingCost, shippingMethod } = req.body;

    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    if (images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const product = new Product({
      title,
      description,
      category,
      subcategory,
      seller: req.user.userId,
      images,
      thumbnail: images[0],
      startPrice: parseFloat(startPrice),
      currentPrice: parseFloat(startPrice),
      minIncrement: parseFloat(minIncrement),
      buyNowPrice: buyNowPrice ? parseFloat(buyNowPrice) : undefined,
      condition,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location,
      shippingCost: parseFloat(shippingCost) || 0,
      shippingMethod,
      status: 'active'
    });

    await product.save();
    await product.populate('category', 'name');
    await product.populate('subcategory', 'name');
    await product.populate('seller', 'name shopName');

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// Update product
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const allowedFields = ['title', 'description', 'location', 'shippingCost', 'shippingMethod'];
    allowedFields.forEach(field => {
      if (req.body[field]) {
        product[field] = req.body[field];
      }
    });

    await product.save();
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// Delete product
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get featured products (ending soon)
exports.getEndingSoon = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'active' })
      .populate('category', 'name')
      .populate('seller', 'name shopName')
      .sort({ endTime: 1 })
      .limit(5);

    res.json(products);
  } catch (error) {
    next(error);
  }
};

// Get trending products
exports.getTrending = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'active' })
      .populate('category', 'name')
      .populate('seller', 'name shopName')
      .sort({ bidCount: -1 })
      .limit(5);

    res.json(products);
  } catch (error) {
    next(error);
  }
};

// Get high price products
exports.getHighPrice = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'active' })
      .populate('category', 'name')
      .populate('seller', 'name shopName')
      .sort({ currentPrice: -1 })
      .limit(5);

    res.json(products);
  } catch (error) {
    next(error);
  }
};

// Get seller's products
exports.getSellerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.user.userId })
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    next(error);
  }
};