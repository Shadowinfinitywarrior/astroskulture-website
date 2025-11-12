import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Import models
import Product from '../models/Product.js';

const removeAstrosFromProducts = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables. Check your .env file.');
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Find all products with "ASTROS" in the name
    const productsWithAstros = await Product.find({ 
      name: { $regex: 'ASTROS', $options: 'i' } 
    });

    console.log(`\n📊 Found ${productsWithAstros.length} products with "ASTROS" in name`);

    if (productsWithAstros.length === 0) {
      console.log('✅ No products with "ASTROS" found. Nothing to update.');
      await mongoose.connection.close();
      return;
    }

    // Update each product to remove "ASTROS"
    let updatedCount = 0;
    for (const product of productsWithAstros) {
      const newName = product.name.replace(/ASTROS\s*/gi, '').trim();
      
      if (newName !== product.name) {
        await Product.findByIdAndUpdate(
          product._id,
          { name: newName },
          { new: true }
        );
        console.log(`✏️  Updated: "${product.name}" → "${newName}"`);
        updatedCount++;
      }
    }

    console.log(`\n✅ Successfully updated ${updatedCount} products`);
    console.log('\n🎉 SCRIPT COMPLETED SUCCESSFULLY!');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

removeAstrosFromProducts();