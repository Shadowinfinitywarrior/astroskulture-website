import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/astroskulture';

async function migrateProductDetails() {
    try {
        console.log('📦 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('\n🔄 Starting product details migration...');

        // Get all products
        const products = await Product.find({});
        console.log(`📊 Found ${products.length} products to migrate`);

        let updatedCount = 0;
        let skippedCount = 0;

        for (const product of products) {
            let needsUpdate = false;
            const updates = {};

            // Add default values for new fields if they don't exist
            if (!product.materialComposition) {
                updates.materialComposition = '';
                needsUpdate = true;
            }
            if (!product.pattern) {
                updates.pattern = '';
                needsUpdate = true;
            }
            if (!product.fitType) {
                updates.fitType = '';
                needsUpdate = true;
            }
            if (!product.sleeveType) {
                updates.sleeveType = '';
                needsUpdate = true;
            }
            if (!product.collarStyle) {
                updates.collarStyle = '';
                needsUpdate = true;
            }
            if (!product.neckStyle) {
                updates.neckStyle = '';
                needsUpdate = true;
            }
            if (!product.countryOfOrigin) {
                updates.countryOfOrigin = 'India';
                needsUpdate = true;
            }
            if (!product.sizeChart) {
                updates.sizeChart = '';
                needsUpdate = true;
            }

            if (needsUpdate) {
                await Product.updateOne({ _id: product._id }, { $set: updates });
                updatedCount++;
                console.log(`✅ Updated product: ${product.name} (${product._id})`);
            } else {
                skippedCount++;
                console.log(`⏭️  Skipped product: ${product.name} (already has new fields)`);
            }
        }

        console.log('\n📊 Migration Summary:');
        console.log(`   Total products: ${products.length}`);
        console.log(`   Updated: ${updatedCount}`);
        console.log(`   Skipped: ${skippedCount}`);
        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run migration
migrateProductDetails()
    .then(() => {
        console.log('\n🎉 All done!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Migration error:', error);
        process.exit(1);
    });
