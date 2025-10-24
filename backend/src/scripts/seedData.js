import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root backend directory (two levels up from src/scripts)
const envPath = path.resolve(__dirname, '../../.env');
console.log('📁 Loading environment from:', envPath);

dotenv.config({ path: envPath });

// Debug environment variables
console.log('🔧 Environment Variables Check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ Loaded' : '✗ MISSING');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Loaded' : '✗ MISSING');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Import models
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Admin from '../models/Admin.js';

const seedData = async () => {
  try {
    // Validate required environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables. Check your .env file.');
    }

    console.log('🔗 Connecting to MongoDB...');
    console.log('📦 Database:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');
    console.log(`📊 Database: ${mongoose.connection.db?.databaseName}`);

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Admin.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create test user
    console.log('👤 Creating test user...');
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      phone: '1234567890'
    });
    await user.save();
    console.log('✅ Test user created:', user.email);

    // Create admin users
    console.log('👑 Creating admin users...');
    
    const admin1 = new Admin({
      username: 'admin',
      password: 'admin123',
      email: 'admin@astroskulture.com',
      fullName: 'System Administrator',
      role: 'admin'
    });
    await admin1.save();
    console.log('✅ Admin user created:', admin1.username);

    const admin2 = new Admin({
      username: 'nithish',
      password: 'admin123',
      email: 'nithishkathiravan123@gmail.com',
      fullName: 'Nithish Kathiravan',
      role: 'admin'
    });
    await admin2.save();
    console.log('✅ Second admin user created:', admin2.username);

    // Create categories
    console.log('📂 Creating categories...');
    const categories = [
      {
        name: 'T-Shirts',
        slug: 't-shirts',
        description: 'Comfortable and stylish t-shirts for everyday wear',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
        displayOrder: 1,
        isActive: true
      },
      {
        name: 'Jackets',
        slug: 'jackets',
        description: 'Warm and fashionable jackets for all seasons',
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
        displayOrder: 2,
        isActive: true
      },
      {
        name: 'Hoodies',
        slug: 'hoodies',
        description: 'Cozy hoodies for comfortable casual wear',
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
        displayOrder: 3,
        isActive: true
      }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log('✅ Categories created:', createdCategories.length);

    // Create products
    console.log('🛍️ Creating products...');
    const products = [
      {
        name: 'Classic White T-Shirt',
        slug: 'classic-white-tshirt',
        description: 'Premium quality cotton t-shirt for everyday wear. Made from 100% organic cotton for maximum comfort and durability.',
        price: 2999, // in cents/paisa
        discountPrice: 1999,
        images: [
          { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', alt: 'White T-Shirt Front' }
        ],
        sizes: [
          { size: 'S', stock: 10 },
          { size: 'M', stock: 15 },
          { size: 'L', stock: 8 },
          { size: 'XL', stock: 5 }
        ],
        categoryId: createdCategories[0]._id,
        isFeatured: true,
        isActive: true,
        rating: 4.5,
        reviewCount: 24
      },
      {
        name: 'Vintage Denim Jacket',
        slug: 'vintage-denim-jacket',
        description: 'Classic denim jacket with a vintage wash. Perfect for layering in any season with multiple pockets and durable construction.',
        price: 4999,
        discountPrice: 3999,
        images: [
          { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', alt: 'Denim Jacket' }
        ],
        sizes: [
          { size: 'M', stock: 5 },
          { size: 'L', stock: 7 },
          { size: 'XL', stock: 3 }
        ],
        categoryId: createdCategories[1]._id,
        isFeatured: true,
        isActive: true,
        rating: 4.8,
        reviewCount: 18
      },
      {
        name: 'Premium Black Hoodie',
        slug: 'premium-black-hoodie',
        description: 'Comfortable and warm black hoodie with front pocket. Perfect for casual outings and cool weather.',
        price: 3599,
        discountPrice: 2999,
        images: [
          { url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', alt: 'Black Hoodie' }
        ],
        sizes: [
          { size: 'S', stock: 8 },
          { size: 'M', stock: 12 },
          { size: 'L', stock: 6 }
        ],
        categoryId: createdCategories[2]._id,
        isFeatured: false,
        isActive: true,
        rating: 4.3,
        reviewCount: 15
      }
    ];

    await Product.insertMany(products);
    console.log('✅ Products created:', products.length);

    console.log('\n🎉 SEED DATA CREATED SUCCESSFULLY!');
    console.log('══════════════════════════════════════════════════');
    console.log('📊 SUMMARY:');
    console.log('   👤 Users: 1');
    console.log('   👑 Admins: 2');
    console.log('   📂 Categories:', createdCategories.length);
    console.log('   🛍️ Products:', products.length);
    console.log('\n🔑 TEST CREDENTIALS:');
    console.log('   👤 Regular User:');
    console.log('      Email: test@example.com');
    console.log('      Password: password123');
    console.log('\n   👑 Admin Accounts:');
    console.log('      Admin 1:');
    console.log('        Username: admin');
    console.log('        Password: admin123');
    console.log('        Email: admin@astroskulture.com');
    console.log('\n      Admin 2:');
    console.log('        Username: nithish');
    console.log('        Password: admin123');
    console.log('        Email: nithishkathiravan123@gmail.com');
    console.log('══════════════════════════════════════════════════');
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔗 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR SEEDING DATA:');
    console.error('   Message:', error.message);
    
    if (error.name === 'MongoServerError') {
      console.error('   MongoDB Error Code:', error.code);
      if (error.code === 8000) {
        console.error('   💡 Authentication failed. Check your MongoDB credentials.');
      }
    }
    
    if (error.code === 'ENOTFOUND') {
      console.error('   💡 Cannot connect to MongoDB. Make sure MongoDB is running.');
      console.error('   💡 On Windows, run: net start MongoDB');
      console.error('   💡 On macOS/Linux, run: brew services start mongodb/brew/mongodb-community');
    }
    
    process.exit(1);
  }
};

// Run the seed function
seedData();