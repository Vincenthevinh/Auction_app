require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Brand = require('../models/Brand'); 

const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined in the .env file");
    }
    await mongoose.connect(process.env.MONGODB_URI);
};

const seedDatabase = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const now = new Date(); // Current time for auction start
        
        // Clear all existing data
        await User.deleteMany({});
        await Category.deleteMany({});
        await Brand.deleteMany({});
        await Product.deleteMany({});
        console.log('🗑️ Existing data cleared.');

        // ===========================================
        // 1. CREATE USERS
        // ===========================================
        const users = await User.create([
            {
                name: 'Admin User',
                email: 'admin@fashionhub.com', 
                password: 'Admin123',
                role: 'admin',
                emailVerified: true,
                phone: '0901234567',
                city: 'Hanoi'
            },
            {
                name: 'Main Seller',
                email: 'seller@fashionhub.com', 
                password: 'Seller123',
                role: 'seller',
                emailVerified: true,
                shopName: 'Fashion Auction Hub', 
                phone: '0912345678',
                sellerRating: 4.8,
                totalSold: 3000,
                totalRevenue: 1000000000
            },
            {
                name: 'John Bidder',
                email: 'bidder1@auction.com', 
                password: 'Bidder123',
                role: 'bidder',
                emailVerified: true,
                phone: '0923456789',
                totalBids: 150,
                totalWins: 30
            },
            {
                name: 'Alice Bidder',
                email: 'bidder2@auction.com', 
                password: 'Bidder123',
                role: 'bidder',
                emailVerified: true,
                phone: '0934567890',
                totalBids: 90,
                totalWins: 18
            }
        ]);
        console.log('✅ Users created');
        
        // ===========================================
        // 2. CREATE CATEGORIES (3 Main Categories, 6 Subcategories)
        // ===========================================
        // MAIN CATEGORIES (Level 0)
        const menFashion = await Category.create({ name: "Men's Fashion", description: "Apparel and accessories for men.", level: 0, parentId: null, order: 1, isActive: true });
        const womenFashion = await Category.create({ name: "Women's Fashion", description: "Dresses, clothing, and accessories for women.", level: 0, parentId: null, order: 2, isActive: true });
        const accessories = await Category.create({ name: "Accessories", description: "Footwear, bags, hats, and glasses.", level: 0, parentId: null, order: 3, isActive: true });

        // SUB-CATEGORIES (Level 1)
        // Men's Fashion Subcategories
        const menTops = await Category.create({ name: 'Men Tops', description: 'T-shirts, shirts, and jackets for men.', level: 1, parentId: menFashion._id, order: 10, isActive: true });
        const menBottoms = await Category.create({ name: 'Men Bottoms', description: 'Jeans, trousers, and shorts for men.', level: 1, parentId: menFashion._id, order: 11, isActive: true }); 
        
        // Women's Fashion Subcategories
        const dressesSkirts = await Category.create({ name: 'Dresses & Skirts', description: 'Various types of dresses and skirts for women.', level: 1, parentId: womenFashion._id, order: 20, isActive: true });
        const womenTops = await Category.create({ name: 'Women Tops', description: 'Blouses, shirts, and jackets for women.', level: 1, parentId: womenFashion._id, order: 21, isActive: true }); 
        
        // Accessories Subcategories
        const footwear = await Category.create({ name: 'Footwear', description: 'Sneakers, leather shoes, sandals, and heels.', level: 1, parentId: accessories._id, order: 30, isActive: true });
        const bags = await Category.create({ name: 'Bags & Wallets', description: 'Handbags, backpacks, and wallets.', level: 1, parentId: accessories._id, order: 31, isActive: true }); 

        console.log('✅ Categories created');
        
        // ===========================================
        // 3. CREATE BRANDS
        // ===========================================
        const urbanStyle = await Brand.create({ name: "Urban Style", slug: "urban-style", logo: "...", description: "Modern urban fashion brand", country: "Vietnam" });
        const sportPro = await Brand.create({ name: "Sport Pro", slug: "sport-pro", logo: "...", description: "Premium sports apparel", country: "USA" });
        const elegantFashion = await Brand.create({ name: "Elegant Fashion", slug: "elegant-fashion", logo: "...", description: "Elegant fashion for modern women", country: "France" });
        const classicWear = await Brand.create({ name: "Classic Wear", slug: "classic-wear", logo: "...", description: "Classic and sophisticated style", country: "Italy" });

        console.log('✅ Brands created');


        // ===========================================
        // 4. CREATE PRODUCTS (24 products: 6 subcategories * 4 products each)
        // ===========================================
        const sellerId = users[1]._id;
        const products = await Product.create([
            // --- A. MEN TOPS (4 PRODUCTS) ---
            {
                title: "Men's Premium Basic White T-Shirt", description: '100% combed cotton, reinforced collar, perfect fit. Essential wardrobe piece.',
                category: menFashion._id, subcategory: menTops._id, brand: urbanStyle._id, seller: sellerId,
                images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'], thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=250',
                startPrice: 200000, currentPrice: 320000, minIncrement: 20000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), bidCount: 6, watchCount: 150, shippingCost: 30000
            },
            {
                title: "Men's Long-Sleeve Slim Fit Denim Shirt", description: 'Soft wash denim, Western style pockets, ideal for smart-casual look.',
                category: menFashion._id, subcategory: menTops._id, brand: classicWear._id, seller: sellerId,
                images: ['https://images.unsplash.com/photo-1614495039368-525273956716?w=500'], thumbnail: 'https://images.unsplash.com/photo-1614495039368-525273956716?w=250',
                startPrice: 450000, currentPrice: 610000, minIncrement: 40000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), bidCount: 5, watchCount: 120, shippingCost: 35000
            },
            {
                title: "Men's Thermal Pullover Hoodie - Sport Pro", description: 'Fleece lining for extra warmth, front pouch pocket, adjustable hood.',
                category: menFashion._id, subcategory: menTops._id, brand: sportPro._id, seller: sellerId,
                images: ['https://images.unsplash.com/photo-1738486260587-e4f1027fcaa3?w=500'], thumbnail: 'https://images.unsplash.com/photo-1738486260587-e4f1027fcaa3?w=250',
                startPrice: 380000, currentPrice: 580000, minIncrement: 30000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), bidCount: 6, watchCount: 180, shippingCost: 40000
            },
            {
                title: "Men's Lightweight Windbreaker Jacket", description: 'Water-resistant nylon, packable design, perfect for running and cycling.',
                category: menFashion._id, subcategory: menTops._id, brand: sportPro._id, seller: sellerId,
                images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500'], thumbnail: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=250',
                startPrice: 550000, currentPrice: 850000, minIncrement: 50000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), bidCount: 6, watchCount: 220, shippingCost: 50000
            },

            // --- B. MEN BOTTOMS (4 PRODUCTS) ---
            {
                title: "Men's Slim Fit Chinos Trousers - Classic Khaki", description: 'Stretch cotton twill, modern slim-fit cut. Office appropriate and weekend ready.',
                category: menFashion._id, subcategory: menBottoms._id, brand: classicWear._id, seller: sellerId,
                images: ['https://images.unsplash.com/photo-1732384069262-8a5e3b1ecce0?w=500'], thumbnail: 'https://images.unsplash.com/photo-1732384069262-8a5e3b1ecce0?w=250',
                startPrice: 500000, currentPrice: 700000, minIncrement: 50000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000), bidCount: 7, watchCount: 90, shippingCost: 40000
            },
            {
                title: "Men's Dark Wash Straight Leg Jeans", description: '100% rigid cotton denim, classic straight fit, deep indigo color.',
                category: menFashion._id, subcategory: menBottoms._id, brand: urbanStyle._id, seller: sellerId,
                images: ['https://images.unsplash.com/photo-1666358083631-0f7140fcd2b5?w=500'], thumbnail: 'https://images.unsplash.com/photo-1666358083631-0f7140fcd2b5?w=250',
                startPrice: 320000, currentPrice: 520000, minIncrement: 40000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), bidCount: 5, watchCount: 130, shippingCost: 40000
            },
            {
                title: "Men's Tech-Fabric Running Shorts", description: 'Quick-dry fabric, built-in brief, zippered pocket for keys/phone. 7-inch inseam.',
                category: menFashion._id, subcategory: menBottoms._id, brand: sportPro._id, seller: sellerId,
                images: ['https://images.unsplash.com/photo-1695918428487-7934244c19ac?w=500'], thumbnail: 'https://images.unsplash.com/photo-1695918428487-7934244c19ac?w=250',
                startPrice: 280000, currentPrice: 420000, minIncrement: 30000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), bidCount: 6, watchCount: 100, shippingCost: 30000
            },
            {
                title: "Men's Linen Blend Summer Trousers", description: 'Lightweight linen blend, relaxed fit, perfect for hot weather and beach vacations.',
                category: menFashion._id, subcategory: menBottoms._id, brand: urbanStyle._id, seller: sellerId,
                images: ['https://plus.unsplash.com/premium_photo-1661718054520-f8f55025d0b2?w=500'], thumbnail: 'https://plus.unsplash.com/premium_photo-1661718054520-f8f55025d0b2?w=250',
                startPrice: 400000, currentPrice: 600000, minIncrement: 40000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), bidCount: 5, watchCount: 85, shippingCost: 35000
            },

            // --- C. DRESSES & SKIRTS (4 PRODUCTS) ---
            {
                title: "Women's Floral Pattern Chiffon Midi Dress", description: 'Soft chiffon material, elegant floral pattern, tie-waist detail for definition.',
                category: womenFashion._id, subcategory: dressesSkirts._id, brand: elegantFashion._id, seller: sellerId,
                images: ['https://images.unsplash.com/photo-1735553816867-88cd8496df58?w=500'], thumbnail: 'https://images.unsplash.com/photo-1735553816867-88cd8496df58?w=250',
                startPrice: 350000, currentPrice: 500000, minIncrement: 30000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), bidCount: 5, watchCount: 210, shippingCost: 0
            },
            {
                title: "Women's Little Black Dress (LBD) with Lace", description: 'Classic LBD, stretch ponte knit fabric with delicate lace sleeves. Knee-length.',
                category: womenFashion._id, subcategory: dressesSkirts._id, brand: classicWear._id, seller: sellerId,
                images: ['https://images.unsplash.com/photo-1741816219305-827580cab505?w=500'], thumbnail: 'https://images.unsplash.com/photo-1741816219305-827580cab505?w=250',
                startPrice: 600000, currentPrice: 850000, minIncrement: 50000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000), bidCount: 6, watchCount: 170, shippingCost: 35000
            },
            {
                title: "Women's Pleated A-Line Midi Skirt", description: 'Flowy, high-quality fabric, classic pleated design, below-the-knee length, side zipper.',
                category: womenFashion._id, subcategory: dressesSkirts._id, brand: elegantFashion._id, seller: sellerId,
                images: ['https://plus.unsplash.com/premium_photo-1727967194287-7887e311a72b?w=500'], thumbnail: 'https://plus.unsplash.com/premium_photo-1727967194287-7887e311a72b?w=250',
                startPrice: 300000, currentPrice: 470000, minIncrement: 30000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), bidCount: 6, watchCount: 105, shippingCost: 30000
            },
            {
                title: "Women's Lightweight Summer Sundress", description: 'Cotton blend, tiered skirt, adjustable spaghetti straps, perfect for beach or casual outings.',
                category: womenFashion._id, subcategory: dressesSkirts._id, brand: urbanStyle._id, seller: sellerId,
                images: ['https://images.unsplash.com/photo-1599309329365-0a9ed45a1da3?w=500'], thumbnail: 'https://images.unsplash.com/photo-1599309329365-0a9ed45a1da3?w=250',
                startPrice: 280000, currentPrice: 420000, minIncrement: 20000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), bidCount: 7, watchCount: 95, shippingCost: 25000
            },

            // --- D. WOMEN TOPS (4 PRODUCTS) ---
            {
                title: "Women's Silk Blend V-Neck Blouse", description: 'Smooth silk blend, elegant V-neck, subtle puffy sleeves. Professional and chic.',
                category: womenFashion._id, subcategory: womenTops._id, brand: elegantFashion._id, seller: sellerId,
                images: ['https://images.unsplash.com/photo-1675379086716-95bf8a4d22f2?w=500'], thumbnail: 'https://images.unsplash.com/photo-1675379086716-95bf8a4d22f2?w=250',
                startPrice: 250000, currentPrice: 400000, minIncrement: 20000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000), bidCount: 7, watchCount: 100, shippingCost: 25000
            },
            {
                title: "Women's Oversized Cable Knit Cardigan", description: 'Soft wool blend, chunky cable knit design, button closure. Cozy winter staple.',
                category: womenFashion._id, subcategory: womenTops._id, brand: classicWear._id, seller: sellerId,
                images: ['https://plus.unsplash.com/premium_photo-1671826911811-3d42cd0b28d0?w=500'], thumbnail: 'https://plus.unsplash.com/premium_photo-1671826911811-3d42cd0b28d0?w=250',
                startPrice: 500000, currentPrice: 750000, minIncrement: 50000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), bidCount: 5, watchCount: 150, shippingCost: 45000
            },
            {
                title: "Women's Cropped Athletic Hoodie", description: 'Breathable, moisture-wicking fabric. Cropped length, perfect for gym and casual wear.',
                category: womenFashion._id, subcategory: womenTops._id, brand: sportPro._id, seller: sellerId,
                images: ['https://images.unsplash.com/photo-1746186237160-671e8d6d2a3e?w=500'], thumbnail: 'https://images.unsplash.com/photo-1746186237160-671e8d6d2a3e?w=250',
                startPrice: 300000, currentPrice: 480000, minIncrement: 30000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), bidCount: 6, watchCount: 110, shippingCost: 30000
            },
            {
                title: "Women's Sleeveless Ribbed Knit Top", description: 'Soft, stretchy ribbed knit, high neck. Ideal for layering or wearing alone in summer.',
                category: womenFashion._id, subcategory: womenTops._id, brand: urbanStyle._id, seller: sellerId,
                images: ['https://images.unsplash.com/photo-1707548131912-f22d31579c40?w=500'], thumbnail: 'https://images.unsplash.com/photo-1707548131912-f22d31579c40?w=250',
                startPrice: 180000, currentPrice: 280000, minIncrement: 20000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), bidCount: 5, watchCount: 80, shippingCost: 20000
            },

            // --- E. FOOTWEAR (4 PRODUCTS) ---
            {
                title: "Unisex Classic Leather Sneakers", description: 'Full grain leather upper, cushioned insole, durable rubber outsole. Timeless design.',
                category: accessories._id, subcategory: footwear._id, brand: sportPro._id, seller: sellerId,
                images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500'], thumbnail: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=250',
                startPrice: 650000, currentPrice: 800000, minIncrement: 50000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), bidCount: 5, watchCount: 350, shippingCost: 50000
            },
            {
                title: "Women's Black Stiletto High Heels (7cm)", description: 'Synthetic leather finish, comfortable fit, stable 7cm heel. Essential for formal events.',
                category: accessories._id, subcategory: footwear._id, brand: elegantFashion._id, seller: sellerId,
                images: ['https://plus.unsplash.com/premium_photo-1747304657427-a13238a466e0?w=500'], thumbnail: 'https://plus.unsplash.com/premium_photo-1747304657427-a13238a466e0?w=250',
                startPrice: 300000, currentPrice: 500000, minIncrement: 25000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), bidCount: 8, watchCount: 80, shippingCost: 30000
            },
            {
                title: "Men's Brown Leather Loafers", description: 'Genuine leather, slip-on design, hand-stitched details. Perfect for business casual.',
                category: accessories._id, subcategory: footwear._id, brand: classicWear._id, seller: sellerId,
                images: ['https://images.unsplash.com/photo-1616406432452-07bc5938759d?w=500'], thumbnail: 'https://images.unsplash.com/photo-1616406432452-07bc5938759d?w=250',
                startPrice: 800000, currentPrice: 1100000, minIncrement: 50000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), bidCount: 6, watchCount: 130, shippingCost: 0
            },
            {
                title: "Women's Open-Toe Strappy Sandals", description: 'Vegan leather, adjustable ankle strap, comfortable block heel. Summer essential.',
                category: accessories._id, subcategory: footwear._id, brand: urbanStyle._id, seller: sellerId,
                images: ['https://plus.unsplash.com/premium_photo-1764257620260-4da05aadbca1?w=500'], thumbnail: 'https://plus.unsplash.com/premium_photo-1764257620260-4da05aadbca1?w=250',
                startPrice: 250000, currentPrice: 400000, minIncrement: 30000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), bidCount: 5, watchCount: 90, shippingCost: 30000
            },

            // --- F. BAGS & WALLETS (4 PRODUCTS) ---
            {
                title: 'Premium Vegan Leather Tote Bag (Black)', description: 'Spacious interior, fits a 15-inch laptop, sturdy handles. Minimalist design.',
                category: accessories._id, subcategory: bags._id, brand: classicWear._id, seller: sellerId,
                images: ['https://images.unsplash.com/photo-1654707634802-a8282d72950e?w=500'], thumbnail: 'https://images.unsplash.com/photo-1654707634802-a8282d72950e?w=250',
                startPrice: 400000, currentPrice: 650000, minIncrement: 50000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000), bidCount: 5, watchCount: 160, shippingCost: 35000
            },
            {
                title: 'Women\'s Quilted Crossbody Bag - Elegant', description: 'Small quilted design, gold-tone chain strap. Ideal for evening wear or light errands.',
                category: accessories._id, subcategory: bags._id, brand: elegantFashion._id, seller: sellerId,
                images: ['https://images.unsplash.com/photo-1587467512961-120760940315?w=500'], thumbnail: 'https://images.unsplash.com/photo-1587467512961-120760940315?w=250',
                startPrice: 350000, currentPrice: 550000, minIncrement: 40000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), bidCount: 6, watchCount: 110, shippingCost: 30000
            },
            {
                title: "Men's Slim Bi-Fold Leather Wallet", description: 'Genuine cowhide leather, six card slots, banknote compartment. Minimalist profile.',
                category: accessories._id, subcategory: bags._id, brand: classicWear._id, seller: sellerId,
                images: ['https://images.unsplash.com/photo-1752184791407-b59e505e5dca?w=500'], thumbnail: 'https://images.unsplash.com/photo-1752184791407-b59e505e5dca?w=250',
                startPrice: 200000, currentPrice: 350000, minIncrement: 20000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), bidCount: 7, watchCount: 80, shippingCost: 20000
            },
            {
                title: 'Waterproof Backpack for Hiking/Travel', description: 'Durable polyester, 40L capacity, multiple compression straps. Ergonomic design.',
                category: accessories._id, subcategory: bags._id, brand: sportPro._id, seller: sellerId,
                images: ['https://images.unsplash.com/photo-1592289924034-c423dd2f1c5d?w=500'], thumbnail: 'https://images.unsplash.com/photo-1592289924034-c423dd2f1c5d?w=250',
                startPrice: 600000, currentPrice: 900000, minIncrement: 50000, condition: 'new', status: 'active',
                startTime: now, endTime: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), bidCount: 5, watchCount: 200, shippingCost: 50000
            }
        ]);
        console.log('✅ Products created');


        console.log('\n✨ Database seeded successfully with 24 products across 3 Main and 6 Subcategories!');
        console.log(`📊 Total users (Admin, Seller, 2 Bidders): ${users.length}`);
        console.log(`📂 Total Categories: ${await Category.countDocuments({})}`);
        console.log(`🏭 Total Brands: ${await Brand.countDocuments({})}`);
        console.log(`🏷️ Total products: ${products.length}`); // Hiện tại là 24 sản phẩm
        console.log('\n🔐 Test accounts:');
        console.log('Admin: admin@fashionhub.com / Admin123');
        console.log('Seller: seller@fashionhub.com / Seller123');
        console.log('Bidder 1: bidder1@auction.com / Bidder123');
        console.log('Bidder 2: bidder2@auction.com / Bidder123');


        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();