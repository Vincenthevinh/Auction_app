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

    // ===== FIX CATEGORIES =====
    // Create parent categories (Level 0)
    const electronics = await Category.create({
      name: 'Electronics',
      description: 'Electronic devices and gadgets',
      level: 0,
      parentId: null,
      order: 1,
      isActive: true
    });

    const fashion = await Category.create({
      name: 'Fashion',
      description: 'Clothing and accessories',
      level: 0,
      parentId: null,
      order: 2,
      isActive: true
    });

    const homeGarden = await Category.create({
      name: 'Home & Garden',
      description: 'Home items and garden supplies',
      level: 0,
      parentId: null,
      order: 3,
      isActive: true
    });

    console.log('✅ Parent categories created');

    // Create subcategories (Level 1)
    const phones = await Category.create({
      name: 'Phones & Tablets',
      description: 'Smartphones and tablets',
      level: 1,
      parentId: electronics._id,
      order: 1,
      isActive: true
    });

    const laptops = await Category.create({
      name: 'Laptops & Computers',
      description: 'Laptops, desktops, and accessories',
      level: 1,
      parentId: electronics._id,
      order: 2,
      isActive: true
    });

    const cameras = await Category.create({
      name: 'Cameras & Photo',
      description: 'Cameras and photography equipment',
      level: 1,
      parentId: electronics._id,
      order: 3,
      isActive: true
    });

    const menFashion = await Category.create({
      name: 'Men Fashion',
      description: 'Clothing and accessories for men',
      level: 1,
      parentId: fashion._id,
      order: 1,
      isActive: true
    });

    const womenFashion = await Category.create({
      name: 'Women Fashion',
      description: 'Clothing and accessories for women',
      level: 1,
      parentId: fashion._id,
      order: 2,
      isActive: true
    });

    const furniture = await Category.create({
      name: 'Furniture',
      description: 'Home and office furniture',
      level: 1,
      parentId: homeGarden._id,
      order: 1,
      isActive: true
    });

    const kitchenware = await Category.create({
      name: 'Kitchenware',
      description: 'Kitchen tools and appliances',
      level: 1,
      parentId: homeGarden._id,
      order: 2,
      isActive: true
    });

    console.log('✅ Subcategories created');

    // Create sample products
    const now = new Date();
    const products = await Product.create([
      {
        title: 'iPhone 13 Pro Max - 256GB - White',
        description: 'iPhone 13 Pro Max 256GB in white, like new condition with full box',
        category: electronics._id,
        subcategory: phones._id,
        seller: users[1]._id,
        images: [
          'https://via.placeholder.com/500x500?text=iPhone+1',
          'https://via.placeholder.com/500x500?text=iPhone+2'
        ],
        thumbnail: 'https://via.placeholder.com/500x500?text=iPhone+1',
        startPrice: 20000000,
        currentPrice: 20000000,
        minIncrement: 500000,
        buyNowPrice: 25000000,
        condition: 'like-new',
        status: 'active',
        startTime: now,
        endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        autoExtendEnabled: true,
        viewCount: 1250,
        bidCount: 0,
        watchCount: 180,
        location: 'Ho Chi Minh City',
        shippingCost: 50000,
        shippingMethod: 'Express'
      },
      {
        title: 'MacBook Pro 14" M1 - 512GB',
        description: 'MacBook Pro 14" M1 Pro, 512GB, 16GB RAM, Space Gray',
        category: electronics._id,
        subcategory: laptops._id,
        seller: users[1]._id,
        images: [
          'https://via.placeholder.com/500x500?text=MacBook+1'
        ],
        thumbnail: 'https://via.placeholder.com/500x500?text=MacBook+1',
        startPrice: 35000000,
        currentPrice: 35000000,
        minIncrement: 1000000,
        condition: 'like-new',
        status: 'active',
        startTime: now,
        endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        viewCount: 890,
        bidCount: 0,
        watchCount: 120,
        location: 'Hanoi',
        shippingCost: 100000
      },
      {
        title: 'Men Premium Linen Shirt',
        description: '100% authentic linen shirt, size M-L, navy blue',
        category: fashion._id,
        subcategory: menFashion._id,
        seller: users[1]._id,
        images: [
          'https://via.placeholder.com/500x500?text=Shirt+1'
        ],
        thumbnail: 'https://via.placeholder.com/500x500?text=Shirt+1',
        startPrice: 300000,
        currentPrice: 300000,
        minIncrement: 50000,
        condition: 'new',
        status: 'active',
        startTime: now,
        endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        viewCount: 320,
        bidCount: 0,
        watchCount: 45,
        shippingCost: 20000
      },
      {
        title: 'AKRACING Gaming Chair - Black Red',
        description: 'Premium AKRACING gaming chair with high-quality PU leather',
        category: homeGarden._id,
        subcategory: furniture._id,
        seller: users[1]._id,
        images: [
          'https://via.placeholder.com/500x500?text=Chair+1'
        ],
        thumbnail: 'https://via.placeholder.com/500x500?text=Chair+1',
        startPrice: 8000000,
        currentPrice: 8000000,
        minIncrement: 500000,
        condition: 'good',
        status: 'active',
        startTime: now,
        endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        viewCount: 650,
        bidCount: 0,
        watchCount: 85,
        shippingCost: 200000
      },
      {
        title: 'Canon EOS R6 Body Only',
        description: 'Canon EOS R6 mirrorless camera body, like new with warranty',
        category: electronics._id,
        subcategory: cameras._id,
        seller: users[1]._id,
        images: [
          'https://via.placeholder.com/500x500?text=Camera+1'
        ],
        thumbnail: 'https://via.placeholder.com/500x500?text=Camera+1',
        startPrice: 45000000,
        currentPrice: 45000000,
        minIncrement: 1000000,
        condition: 'like-new',
        status: 'active',
        startTime: now,
        endTime: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        viewCount: 780,
        bidCount: 0,
        watchCount: 150,
        shippingCost: 80000
      }
    ]);

    console.log('✅ Products created');

    console.log('\n✨ Database seeded successfully!');
    console.log(`📊 Total users: ${users.length}`);
    console.log(`📂 Total parent categories: 3`);
    console.log(`📂 Total subcategories: 7`);
    console.log(`🏷️ Total products: ${products.length}`);
    console.log('\n🔐 Test accounts:');
    console.log('Admin: admin@auction.com / Admin123');
    console.log('Seller: seller@auction.com / Seller123');
    console.log('Buyer: buyer@auction.com / Buyer123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();