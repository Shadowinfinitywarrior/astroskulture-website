
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Settings from '../models/Settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const debugSettings = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }

        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected');

        const allSettings = await Settings.find({});
        console.log(`📊 Found ${allSettings.length} settings document(s)`);

        allSettings.forEach((doc, index) => {
            console.log(`\nDocument #${index + 1}:`);
            console.log(`ID: ${doc._id}`);
            console.log(`GST Enabled: ${doc.gstEnabled}`);
            console.log(`GST Percentage: ${doc.gstPercentage}`);
            console.log(`Shipping Enabled: ${doc.shippingEnabled}`);
            console.log(`Shipping Fee: ${doc.shippingFee}`);
            console.log(`Free Shipping Above: ${doc.freeShippingAbove}`);
            console.log(`Created At: ${doc.createdAt}`);
            console.log(`Updated At: ${doc.updatedAt}`);
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

debugSettings();
