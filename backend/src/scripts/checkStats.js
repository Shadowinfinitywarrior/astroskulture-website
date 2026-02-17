import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

async function checkStats() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, { dbName: 'astromain' });
        console.log('✅ Connected to:', mongoose.connection.db.databaseName);

        const productCount = await Product.countDocuments();
        const activeProductCount = await Product.countDocuments({ isActive: true });
        const userCount = await User.countDocuments();
        const orderCount = await Order.countDocuments();
        const paidOrderCount = await Order.countDocuments({ paymentStatus: 'paid' });

        console.log('\n📊 DATABASE STATS:');
        console.log('-------------------');
        console.log('Total Products:', productCount);
        console.log('Active Products:', activeProductCount);
        console.log('Total Users:', userCount);
        console.log('Total Orders:', orderCount);
        console.log('Paid Orders:', paidOrderCount);

        if (productCount === 12) {
            console.log('\n⚠️  WARNING: Product count is exactly 12. This matches the described problem.');
        }

        const sampleProducts = await Product.find().limit(5).select('name isActive');
        console.log('\n📦 Sample Products:', sampleProducts);

        await mongoose.connection.close();
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

checkStats();
