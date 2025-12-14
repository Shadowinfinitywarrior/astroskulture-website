import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Settings from '../models/Settings.js';
import Product from '../models/Product.js';

// Fix for ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
console.log('📁 Loading environment from:', envPath);
dotenv.config({ path: envPath });

const fixShippingSettings = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }

        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        console.log(`📊 Database: ${mongoose.connection.db?.databaseName}`);

        // Check all settings documents
        console.log('\n📋 Checking Settings documents...');
        const allSettings = await Settings.find({});
        console.log(`Found ${allSettings.length} settings documents`);

        allSettings.forEach((setting, index) => {
            console.log(`\nSettings Document #${index + 1}:`);
            console.log(`  ID: ${setting._id}`);
            console.log(`  Shipping Fee: ₹${setting.shippingFee}`);
            console.log(`  Shipping Enabled: ${setting.shippingEnabled}`);
            console.log(`  Free Shipping Above: ₹${setting.freeShippingAbove}`);
            console.log(`  GST Percentage: ${setting.gstPercentage}%`);
            console.log(`  GST Enabled: ${setting.gstEnabled}`);
        });

        // Keep only the FIRST settings document and delete the rest
        if (allSettings.length > 1) {
            console.log('\n⚠️  Multiple settings documents found. Keeping only the first one...');
            const idsToDelete = allSettings.slice(1).map(s => s._id);
            await Settings.deleteMany({ _id: { $in: idsToDelete } });
            console.log(`✅ Deleted ${idsToDelete.length} duplicate settings documents`);
        }

        // Ensure we have at least one settings document
        let mainSettings = await Settings.findOne({});
        if (!mainSettings) {
            console.log('\n⚠️  No settings document found. Creating default settings...');
            mainSettings = new Settings({
                gstPercentage: 18,
                gstEnabled: true,
                shippingFee: 1,  // Changed from 69 to 1
                shippingEnabled: true,
                freeShippingAbove: 999
            });
            await mainSettings.save();
            console.log('✅ Created default settings with shipping fee: ₹1');
        }

        console.log('\n📦 Main Settings Document:');
        console.log(`  ID: ${mainSettings._id}`);
        console.log(`  Shipping Fee: ₹${mainSettings.shippingFee}`);
        console.log(`  Shipping Enabled: ${mainSettings.shippingEnabled}`);
        console.log(`  Free Shipping Above: ₹${mainSettings.freeShippingAbove}`);
        console.log(`  GST Percentage: ${mainSettings.gstPercentage}%`);
        console.log(`  GST Enabled: ${mainSettings.gstEnabled}`);

        // Update products with hardcoded shipping fee of 69
        console.log('\n📦 Checking products with shipping fee of 69...');
        const productsWithHardcodedShipping = await Product.find({ shippingFee: 69 });
        console.log(`Found ${productsWithHardcodedShipping.length} products with hardcoded shipping fee`);

        if (productsWithHardcodedShipping.length > 0) {
            console.log('\n🔧 Updating products to use main settings...');
            for (const product of productsWithHardcodedShipping) {
                product.shippingFee = mainSettings.shippingFee;
                await product.save();
                console.log(`  ✅ Updated "${product.name}" - Shipping: ₹69 → ₹${mainSettings.shippingFee}`);
            }
        }

        console.log('\n✅ All done! Database is clean.');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing shipping settings:', error);
        process.exit(1);
    }
};

fixShippingSettings();
