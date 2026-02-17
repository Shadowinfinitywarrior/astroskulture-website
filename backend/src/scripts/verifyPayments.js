import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from '../models/Order.js';

// Load environment variables
dotenv.config();

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY
});

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Verify payment data consistency
const verifyPayments = async () => {
    try {
        console.log('\n🔍 Starting Payment Verification...\n');
        console.log('='.repeat(80));

        // Get all paid orders from database
        const paidOrders = await Order.find({ paymentStatus: 'paid' })
            .populate('userId', 'email fullName phone')
            .sort({ createdAt: -1 });

        console.log(`\n📊 Found ${paidOrders.length} paid orders in database\n`);

        const discrepancies = [];
        const matches = [];
        const errors = [];

        for (let i = 0; i < paidOrders.length; i++) {
            const order = paidOrders[i];
            console.log(`\n[${i + 1}/${paidOrders.length}] Checking Order: ${order.orderNumber}`);
            console.log('-'.repeat(80));

            // Database information
            console.log('📦 Database Info:');
            console.log(`   Order ID: ${order._id}`);
            console.log(`   Order Number: ${order.orderNumber}`);
            console.log(`   Customer: ${order.userId?.fullName || order.shippingAddress?.fullName || 'Guest'}`);
            console.log(`   Email: ${order.userId?.email || 'N/A'}`);
            console.log(`   DB Total: ₹${order.total}`);
            console.log(`   DB Payment Status: ${order.paymentStatus}`);
            console.log(`   DB Payment ID: ${order.paymentId || 'N/A'}`);
            console.log(`   DB Razorpay Order ID: ${order.razorpayOrderId || 'N/A'}`);
            console.log(`   Created At: ${order.createdAt}`);

            // Check if we have Razorpay payment ID
            if (!order.paymentId) {
                console.log('⚠️  WARNING: No payment ID in database');
                discrepancies.push({
                    orderNumber: order.orderNumber,
                    orderId: order._id,
                    issue: 'Missing payment ID in database',
                    dbTotal: order.total,
                    dbPaymentStatus: order.paymentStatus
                });
                continue;
            }

            try {
                // Fetch payment details from Razorpay
                console.log('\n💳 Razorpay Info:');
                const razorpayPayment = await razorpay.payments.fetch(order.paymentId);

                const razorpayAmount = razorpayPayment.amount / 100; // Convert paise to rupees
                console.log(`   Payment ID: ${razorpayPayment.id}`);
                console.log(`   Razorpay Amount: ₹${razorpayAmount}`);
                console.log(`   Razorpay Status: ${razorpayPayment.status}`);
                console.log(`   Payment Method: ${razorpayPayment.method}`);
                console.log(`   Email: ${razorpayPayment.email || 'N/A'}`);
                console.log(`   Contact: ${razorpayPayment.contact || 'N/A'}`);
                console.log(`   Captured: ${razorpayPayment.captured}`);
                console.log(`   Created At: ${new Date(razorpayPayment.created_at * 1000).toISOString()}`);

                // Compare amounts
                const amountMatch = Math.abs(order.total - razorpayAmount) < 0.01; // Allow 1 paisa difference for rounding
                const statusMatch = (
                    (order.paymentStatus === 'paid' && razorpayPayment.status === 'captured') ||
                    (order.paymentStatus === 'paid' && razorpayPayment.status === 'authorized')
                );

                console.log('\n🔍 Comparison:');
                console.log(`   Amount Match: ${amountMatch ? '✅ YES' : '❌ NO'}`);
                console.log(`   Status Match: ${statusMatch ? '✅ YES' : '❌ NO'}`);

                if (!amountMatch || !statusMatch) {
                    console.log('   ⚠️  DISCREPANCY FOUND!');
                    discrepancies.push({
                        orderNumber: order.orderNumber,
                        orderId: order._id,
                        customer: order.userId?.fullName || order.shippingAddress?.fullName,
                        email: order.userId?.email,
                        dbTotal: order.total,
                        razorpayAmount: razorpayAmount,
                        amountDifference: order.total - razorpayAmount,
                        dbPaymentStatus: order.paymentStatus,
                        razorpayStatus: razorpayPayment.status,
                        paymentId: order.paymentId,
                        amountMatch,
                        statusMatch
                    });
                } else {
                    console.log('   ✅ All checks passed!');
                    matches.push({
                        orderNumber: order.orderNumber,
                        orderId: order._id,
                        customer: order.userId?.fullName || order.shippingAddress?.fullName,
                        amount: order.total,
                        paymentId: order.paymentId
                    });
                }

            } catch (error) {
                console.log(`\n❌ Error fetching Razorpay payment: ${error.message}`);
                errors.push({
                    orderNumber: order.orderNumber,
                    orderId: order._id,
                    paymentId: order.paymentId,
                    error: error.message
                });
            }
        }

        // Summary Report
        console.log('\n\n');
        console.log('='.repeat(80));
        console.log('📋 VERIFICATION SUMMARY');
        console.log('='.repeat(80));
        console.log(`\n✅ Matching Orders: ${matches.length}`);
        console.log(`⚠️  Discrepancies Found: ${discrepancies.length}`);
        console.log(`❌ Errors: ${errors.length}`);

        if (discrepancies.length > 0) {
            console.log('\n\n⚠️  DISCREPANCIES DETAILS:');
            console.log('='.repeat(80));
            discrepancies.forEach((disc, idx) => {
                console.log(`\n${idx + 1}. Order: ${disc.orderNumber}`);
                console.log(`   Customer: ${disc.customer || 'N/A'}`);
                console.log(`   Issue: ${disc.issue || 'Amount/Status mismatch'}`);
                if (disc.dbTotal !== undefined) {
                    console.log(`   DB Total: ₹${disc.dbTotal}`);
                }
                if (disc.razorpayAmount !== undefined) {
                    console.log(`   Razorpay Amount: ₹${disc.razorpayAmount}`);
                    console.log(`   Difference: ₹${disc.amountDifference?.toFixed(2)}`);
                }
                if (disc.dbPaymentStatus) {
                    console.log(`   DB Status: ${disc.dbPaymentStatus}`);
                }
                if (disc.razorpayStatus) {
                    console.log(`   Razorpay Status: ${disc.razorpayStatus}`);
                }
            });
        }

        if (errors.length > 0) {
            console.log('\n\n❌ ERRORS:');
            console.log('='.repeat(80));
            errors.forEach((err, idx) => {
                console.log(`\n${idx + 1}. Order: ${err.orderNumber}`);
                console.log(`   Payment ID: ${err.paymentId}`);
                console.log(`   Error: ${err.error}`);
            });
        }

        if (matches.length > 0) {
            console.log('\n\n✅ MATCHING ORDERS (Sample):');
            console.log('='.repeat(80));
            matches.slice(0, 5).forEach((match, idx) => {
                console.log(`${idx + 1}. ${match.orderNumber} - ${match.customer} - ₹${match.amount}`);
            });
            if (matches.length > 5) {
                console.log(`   ... and ${matches.length - 5} more`);
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log('✅ Verification Complete!\n');

    } catch (error) {
        console.error('\n❌ Verification failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
};

// Run the verification
connectDB().then(() => {
    verifyPayments();
});
