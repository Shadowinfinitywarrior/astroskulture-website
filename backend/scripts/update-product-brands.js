import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

async function updateProductBrands() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/astroskulture');
    console.log('Connected to MongoDB');

    // Update all products with brand 'ASTRO' to remove the brand or set it to empty
    const result = await Product.updateMany(
      { brand: { $regex: /^ASTRO/i } },
      { $unset: { brand: "" } }
    );

    console.log(`Updated ${result.modifiedCount} products - removed ASTRO brand`);

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error updating products:', error);
    process.exit(1);
  }
}

updateProductBrands();