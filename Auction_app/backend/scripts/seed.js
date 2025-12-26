require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
};

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Create sample users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@auction.com',
        password: 'Admin123',
        role: 'admin',
        emailVerified: true,
        phone: '0901234567',
        city: 'Ho Chi Minh'
      },
      {
        name: 'John Seller',
        email: 'seller@auction.com',
        password: 'Seller123',
        role: 'seller',
        emailVerified: true,
        shopName: 'John Electronics',
        phone: '0912345678',
        sellerRating: 4.8,
        totalSold: 150,
        totalRevenue: 50000000
      },
      {
        name: 'Jane Bidder',
        email: 'buyer@auction.com',
        password: 'Buyer123',
        role: 'bidder',
        emailVerified: true,
        phone: '0923456789',
        totalBids: 50,
        totalWins: 15
      }
    ]);

    console.log('✅ Users created');

    // Create categories (phân cấp)
    const parentCategories = await Category.create([
      {
        name: 'Electronics',
        description: 'Electronic devices',
        level: 0,
        order: 1
      },
      {
        name: 'Fashion',
        description: 'Clothing & accessories',
        level: 0,
        order: 2
      },
      {
        name: 'Home & Garden',
        description: 'Home items',
        level: 0,
        order: 3
      }
    ]);
  
    // Create subcategories
    const subCategories = await Category.create([
      {
        name: 'Phones',
        parentId: parentCategories[0]._id,
        level: 1,
        order: 1
      },
      {
        name: 'Laptops',
        parentId: parentCategories[0]._id,
        level: 1,
        order: 2
      },
      {
        name: 'Men',
        parentId: parentCategories[1]._id,
        level: 1,
        order: 1
      },
      {
        name: 'Women',
        parentId: parentCategories[1]._id,
        level: 1,
        order: 2
      }
    ]);
    const phones = subCategories.find(c => c.name === 'Phones');
    const laptops = subCategories.find(c => c.name === 'Laptops');
    const men = subCategories.find(c => c.name === 'Men');
    const women = subCategories.find(c => c.name === 'Women');

    console.log('✅ Categories created');

    // Create sample products
    const now = new Date();
    const products = await Product.create([
      {
        title: 'iPhone 13 Pro Max - 256GB - Trắng',
        description: 'iPhone 13 Pro Max 256GB màu trắng, còn như mới, full box',
        category: parentCategories[0]._id,
        subcategory: phones._id,
        seller: users[1]._id,
        images: [
          'https://via.placeholder.com/500x500?text=iPhone+1',
          'https://via.placeholder.com/500x500?text=iPhone+2'
        ],
        thumbnail: 'https://via.placeholder.com/500x500?text=iPhone+1',
        startPrice: 20000000,
        currentPrice: 22500000,
        minIncrement: 500000,
        buyNowPrice: 25000000,
        condition: 'like-new',
        status: 'active',
        startTime: now,
        endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        autoExtendEnabled: true,
        viewCount: 1250,
        bidCount: 25,
        watchCount: 180,
        location: 'Ho Chi Minh City',
        shippingCost: 50000,
        shippingMethod: 'Express'
      },
      {
        title: 'MacBook Pro 14" M1 - 512GB',
        description: 'MacBook Pro 14" M1 Pro, 512GB, 16GB RAM, Space Gray',
        category: parentCategories[0]._id,
        subcategory: laptops._id,
        seller: users[1]._id,
        images: [
          'https://via.placeholder.com/500x500?text=MacBook+1'
        ],
        thumbnail: 'https://via.placeholder.com/500x500?text=MacBook+1',
        startPrice: 35000000,
        currentPrice: 38000000,
        minIncrement: 1000000,
        condition: 'like-new',
        status: 'active',
        startTime: now,
        endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        viewCount: 890,
        bidCount: 18,
        watchCount: 120,
        location: 'Hanoi',
        shippingCost: 100000
      },
      {
        title: 'Áo Sơ Mi Linen Nam Cao Cấp',
        description: 'Áo sơ mi linen 100% chính hãng, size M-L, màu xanh navy',
        category: parentCategories[1]._id,
        subcategory: men._id,
        seller: users[1]._id,
        images: [
          'https://via.placeholder.com/500x500?text=Shirt+1'
        ],
        thumbnail: 'https://via.placeholder.com/500x500?text=Shirt+1',
        startPrice: 300000,
        currentPrice: 450000,
        minIncrement: 50000,
        condition: 'new',
        status: 'active',
        startTime: now,
        endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        viewCount: 320,
        bidCount: 8,
        watchCount: 45,
        shippingCost: 20000
      },
      {
        title: 'Ghế Gaming AKRACING - Màu Đen Đỏ',
        description: 'Ghế gaming cao cấp AKRACING, da PU chất lượng cao',
        category: parentCategories[2]._id,
        seller: users[1]._id,
        images: [
          'https://via.placeholder.com/500x500?text=Chair+1'
        ],
        thumbnail: 'https://via.placeholder.com/500x500?text=Chair+1',
        startPrice: 8000000,
        currentPrice: 9500000,
        minIncrement: 500000,
        condition: 'good',
        status: 'active',
        startTime: now,
        endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        viewCount: 650,
        bidCount: 14,
        watchCount: 85,
        shippingCost: 200000
      },
      {
        title: 'iPad Air 5 - 64GB - Xanh Dương',
        description: 'iPad Air 5 64GB WiFi, màu xanh dương, còn bảo hành',
        category: parentCategories[0]._id,
        subcategory: phones._id,
        seller: users[1]._id,
        images: [
          'https://via.placeholder.com/500x500?text=iPad+1'
        ],
        thumbnail: 'https://via.placeholder.com/500x500?text=iPad+1',
        startPrice: 10000000,
        currentPrice: 11500000,
        minIncrement: 500000,
        buyNowPrice: 13000000,
        condition: 'like-new',
        status: 'active',
        startTime: now,
        endTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        viewCount: 1100,
        bidCount: 22,
        watchCount: 200,
        shippingCost: 50000
      }
    ]);

    console.log('✅ Products created');

    console.log('\n✨ Database seeded successfully!');
    console.log(`📊 Total users: ${users.length}`);
    console.log(`📂 Total categories: ${parentCategories.length + 4}`);
    console.log(`🏷️ Total products: ${products.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();