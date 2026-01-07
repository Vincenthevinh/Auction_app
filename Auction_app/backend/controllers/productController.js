const Product = require('../models/Product');
const Category = require('../models/Category');

// Get all products with pagination, filtering, sorting
exports.getProducts = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      sort 
    } = req.query;
    
    const skip = (page - 1) * limit;

    let query = { status: 'active' };

    // FIX 3: Enhanced category filtering with error handling
    if (category) {
      const cat = await Category.findById(category);
      
      // FIX 3a: Handle invalid category ID
      if (!cat) {
        return res.status(404).json({
          message: 'Category not found',
          items: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 0
          }
        });
      }

      if (cat.level === 0) {
        // Parent category - find all children
        const childCategories = await Category.find({ parentId: cat._id });
        const childIds = childCategories.map(c => c._id);
        
        // Match products in parent OR any child category
        query.$or = [
          { category: cat._id },
          { subcategory: { $in: childIds } }
        ];
      } else {
        // Child category (level 1) - match subcategory field
        query.subcategory = category;
      }
    }

    // Full-text search
    if (search) {
      const searchQuery = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
      
      // If category filter exists, combine with search using $and
      if (query.$or) {
        query = {
          $and: [
            { $or: query.$or }, // category filter
            searchQuery         // search filter
          ]
        };
      } else {
        query = { ...query, ...searchQuery };
      }
    }

    // Sorting
    let sortObj = { createdAt: -1 };
    if (sort === 'price-asc') sortObj = { currentPrice: 1 };
    if (sort === 'price-desc') sortObj = { currentPrice: -1 };
    if (sort === 'views') sortObj = { viewCount: -1 };
    if (sort === 'bids') sortObj = { bidCount: -1 };
    if (sort === 'ending-soon') sortObj = { endTime: 1 };

    // Count total matching documents
    const total = await Product.countDocuments(query);
    
    // Fetch products
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('subcategory', 'name')
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
    console.error('Get products error:', error);
    next(error);
  }
};

// Get single product
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('subcategory', 'name')
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
    const { 
      title, 
      description, 
      category, 
      subcategory, 
      startPrice, 
      minIncrement, 
      buyNowPrice, 
      condition, 
      startTime, 
      endTime, 
      location, 
      shippingCost, 
      shippingMethod 
    } = req.body;

    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    if (images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const product = new Product({
      title,
      description,
      category,
      subcategory: subcategory || null,
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
    if (product.subcategory) {
      await product.populate('subcategory', 'name');
    }
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
      .populate('subcategory', 'name')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    next(error);
  }
};