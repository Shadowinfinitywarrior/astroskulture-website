import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const validateRazorpayConfig = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET_KEY) {
        return false;
    }
    return true;
};

const getRazorpayInstance = () => {
    if (!validateRazorpayConfig()) {
        throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_SECRET_KEY in .env');
    }
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET_KEY
    });
};

async function syncPayments() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, { dbName: 'astromain' });
        console.log('✅ Connected to:', mongoose.connection.db.databaseName);

        console.log('🔄 Fetching pending orders...');
        const pendingOrders = await Order.find({
            paymentStatus: 'pending',
            status: 'pending',
            razorpayOrderId: { $exists: true, $ne: null }
        });

        console.log(`📊 Found ${pendingOrders.length} pending orders to check.`);

        if (pendingOrders.length === 0) {
            console.log('✨ No pending orders found that require synchronization.');
            process.exit(0);
        }

        const razorpay = getRazorpayInstance();
        let updatedCount = 0;
        let cancelledCount = 0;

        for (const order of pendingOrders) {
            try {
                console.log(`\n🔍 Checking Order: ${order.orderNumber} (Razorpay ID: ${order.razorpayOrderId})`);

                const payments = await razorpay.orders.fetchPayments(order.razorpayOrderId);
                const successfulPayment = payments.items.find(p =>
                    p.status === 'captured' || p.status === 'authorized'
                );

                if (successfulPayment) {
                    console.log(`  ✅ Found successful payment: ${successfulPayment.id}`);
                    await Order.findByIdAndUpdate(order._id, {
                        paymentStatus: 'paid',
                        paymentId: successfulPayment.id,
                        status: 'processing',
                        updatedAt: Date.now()
                    });
                    updatedCount++;
                } else {
                    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    if (order.createdAt < oneDayAgo) {
                        console.log(`  ⚠️  Order is older than 24h and no payment found. Cancelling.`);
                        await Order.findByIdAndUpdate(order._id, {
                            paymentStatus: 'failed',
                            status: 'cancelled',
                            updatedAt: Date.now()
                        });

                        // Restore stock
                        for (const item of order.items) {
                            const product = await Product.findById(item.productId);
                            if (product) {
                                const sizeIndex = product.sizes?.findIndex(s => s.size === item.size);
                                if (sizeIndex !== -1) {
                                    product.sizes[sizeIndex].stock += item.quantity;
                                    await product.save();
                                }
                            }
                        }
                        cancelledCount++;
                    } else {
                        console.log('  🕒 No payment found yet (order still within 24h grace period).');
                    }
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (err) {
                console.error(`  ❌ Error syncing order ${order.orderNumber}:`, err.message);
            }
        }

        console.log('\n-----------------------------------');
        console.log(`✅ Synchronization Complete!`);
        console.log(`   Updated to 'paid': ${updatedCount}`);
        console.log(`   Timed out / Cancelled: ${cancelledCount}`);
        console.log('-----------------------------------');

        await mongoose.connection.close();
    } catch (err) {
        console.error('❌ Global Error:', err);
        process.exit(1);
    }
}

syncPayments();
