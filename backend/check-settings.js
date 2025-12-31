import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './src/models/Settings.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔗 Connecting to MongoDB...');

mongoose.connect(MONGODB_URI, {
    dbName: 'astromain'
})
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        console.log(`📊 Database: ${mongoose.connection.db?.databaseName}`);

        try {
            // Find all settings documents
            const allSettings = await Settings.find();

            console.log('\n═══════════════════════════════════════════════════════');
            console.log('📋 CURRENT DATABASE SETTINGS');
            console.log('═══════════════════════════════════════════════════════\n');

            if (allSettings.length === 0) {
                console.log('⚠️  No settings found in database!');
                console.log('💡 Default values from Settings model:');
                console.log('   - gstPercentage: 18');
                console.log('   - gstEnabled: true');
                console.log('   - shippingFee: 0');
                console.log('   - shippingEnabled: true');
                console.log('   - freeShippingAbove: 999');
            } else {
                console.log(`📊 Found ${allSettings.length} settings document(s):\n`);

                allSettings.forEach((setting, index) => {
                    console.log(`Settings Document #${index + 1}:`);
                    console.log(`   ID: ${setting._id}`);
                    console.log(`   GST Percentage: ${setting.gstPercentage}%`);
                    console.log(`   GST Enabled: ${setting.gstEnabled}`);
                    console.log(`   Shipping Fee: ₹${setting.shippingFee}`);
                    console.log(`   Shipping Enabled: ${setting.shippingEnabled}`);
                    console.log(`   Free Shipping Above: ₹${setting.freeShippingAbove}`);
                    console.log(`   Created At: ${setting.createdAt}`);
                    console.log(`   Updated At: ${setting.updatedAt}\n`);
                });

                if (allSettings.length > 1) {
                    console.log('⚠️  WARNING: Multiple settings documents found!');
                    console.log('💡 The application should only have ONE settings document.');
                    console.log('💡 The backend will use the most recent one.\n');
                }
            }

            console.log('═══════════════════════════════════════════════════════\n');

        } catch (err) {
            console.error('❌ Error querying settings:', err);
        } finally {
            await mongoose.disconnect();
            console.log('✅ Disconnected from MongoDB');
            process.exit(0);
        }
    })
    .catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    });
