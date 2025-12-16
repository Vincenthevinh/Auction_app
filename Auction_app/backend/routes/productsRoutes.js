const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/uploadHandler');

const router = express.Router();

// Lấy danh sách sản phẩm với filter, sort, paginate
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 12, category, search, sort } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { status: 'active' };
    
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    let sortObj = { createdAt: -1 };
    if (sort === 'price-asc') sortObj = { currentPrice: 1 };
    if (sort === 'price-desc') sortObj = { currentPrice: -1 };
    if (sort === 'views') sortObj = { viewCount: -1 };
    if (sort === 'bids') sortObj = { bidCount: -1 };
    if (sort === 'ending-soon') sortObj = { endTime: 1 };
    
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category seller', '-password')
      .skip(skip)
      .limit(limit)
      .sort(sortObj);
    
    res.json({
      items: products,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
});

// Top 5 sản phẩm gần kết thúc
router.get('/featured/ending-soon', async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'active' })
      .populate('category seller', '-password')
      .sort({ endTime: 1 })
      .limit(5);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// Top 5 sản phẩm nhiều bid
router.get('/featured/trending', async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'active' })
      .populate('category seller', '-password')
      .sort({ bidCount: -1 })
      .limit(5);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// Top 5 sản phẩm giá cao
router.get('/featured/high-price', async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'active' })
      .populate('category seller', '-password')
      .sort({ currentPrice: -1 })
      .limit(5);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// Chi tiết sản phẩm
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('seller', '-password')
      .populate('winnerId', '-password');
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Tăng view count
    product.viewCount += 1;
    await product.save();
    
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// Tạo sản phẩm (Seller)
router.post('/', authMiddleware, upload.array('images', 10), async (req, res, next) => {
  try {
    const { title, description, category, startPrice, minIncrement, buyNowPrice, condition, startTime, endTime } = req.body;
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    
    const product = new Product({
      title,
      description,
      category,
      seller: req.user.userId,
      images,
      thumbnail: images[0],
      startPrice,
      currentPrice: startPrice,
      minIncrement,
      buyNowPrice,
      condition,
      startTime,
      endTime,
      status: 'pending'
    });
    
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

module.exports = router;