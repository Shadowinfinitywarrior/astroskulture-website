import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import Category from '../src/models/Category.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixMissingProducts() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/astroskulture');
    console.log('✅ Connected to MongoDB');

    // 1. Find all products without isActive flag
    console.log('\n📊 Checking products...');
    const productsWithoutActive = await Product.find({ isActive: { $exists: false } });
    console.log(`Found ${productsWithoutActive.length} products without isActive flag`);

    if (productsWithoutActive.length > 0) {
      await Product.updateMany(
        { isActive: { $exists: false } },
        { $set: { isActive: true } }
      );
      console.log(`✅ Updated ${productsWithoutActive.length} products to isActive: true`);
    }

    // 2. Find products with null/missing categories
    const productsWithoutCategory = await Product.find({ category: { $in: [null, undefined, ''] } });
    console.log(`\nFound ${productsWithoutCategory.length} products without category`);

    // 3. Get all categories
    const categories = await Category.find();
    console.log(`Found ${categories.length} categories`);

    if (productsWithoutCategory.length > 0 && categories.length > 0) {
      const defaultCategory = categories[0];
      await Product.updateMany(
        { category: { $in: [null, undefined, ''] } },
        { $set: { category: defaultCategory._id } }
      );
      console.log(`✅ Assigned ${productsWithoutCategory.length} products to default category: ${defaultCategory.name}`);
    }

    // 4. Count products by isActive status
    const activeCount = await Product.countDocuments({ isActive: true });
    const inactiveCount = await Product.countDocuments({ isActive: false });
    const totalCount = await Product.countDocuments();

    console.log(`\n📈 Product statistics:`);
    console.log(`  Total: ${totalCount}`);
    console.log(`  Active: ${activeCount}`);
    console.log(`  Inactive: ${inactiveCount}`);

    // 5. Show products by category
    console.log('\n📂 Products by category:');
    for (const category of categories) {
      const count = await Product.countDocuments({ category: category._id, isActive: true });
      console.log(`  ${category.name}: ${count}`);
    }

    console.log('\n✅ Fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixMissingProducts();
