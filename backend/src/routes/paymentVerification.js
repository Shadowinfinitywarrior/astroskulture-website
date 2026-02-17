import express from 'express';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';

const router = express.Router();

// Initialize Razorpay
const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET_KEY
    });
};

// GET /api/admin/verify-payments - Verify all paid orders against Razorpay
router.get('/verify-payments', async (req, res) => {
    try {
        console.log('🔍 Starting payment verification...');

        // Get all paid orders from database
        const paidOrders = await Order.find({ paymentStatus: 'paid' })
            .populate('userId', 'email fullName phone')
            .sort({ createdAt: -1 })
            .limit(100); // Limit to recent 100 orders

        console.log(`📊 Found ${paidOrders.length} paid orders in database`);

        const razorpay = getRazorpayInstance();
        const results = {
            totalOrders: paidOrders.length,
            matches: [],
            discrepancies: [],
            errors: []
        };

        for (const order of paidOrders) {
            const orderInfo = {
                orderNumber: order.orderNumber,
                orderId: order._id.toString(),
                customer: order.userId?.fullName || order.shippingAddress?.fullName || 'Guest',
                email: order.userId?.email || 'N/A',
                dbTotal: order.total,
                dbPaymentStatus: order.paymentStatus,
                paymentId: order.paymentId,
                razorpayOrderId: order.razorpayOrderId,
                createdAt: order.createdAt
            };

            // Check if we have payment ID
            if (!order.paymentId) {
                results.discrepancies.push({
                    ...orderInfo,
                    issue: 'Missing payment ID in database',
                    severity: 'high'
                });
                continue;
            }

            try {
                // Fetch payment details from Razorpay
                const razorpayPayment = await razorpay.payments.fetch(order.paymentId);

                const razorpayAmount = razorpayPayment.amount / 100; // Convert paise to rupees

                // Compare amounts (allow 1 paisa difference for rounding)
                const amountMatch = Math.abs(order.total - razorpayAmount) < 0.01;
                const statusMatch = (
                    (order.paymentStatus === 'paid' && razorpayPayment.status === 'captured') ||
                    (order.paymentStatus === 'paid' && razorpayPayment.status === 'authorized')
                );

                const verificationResult = {
                    ...orderInfo,
                    razorpayAmount,
                    razorpayStatus: razorpayPayment.status,
                    razorpayMethod: razorpayPayment.method,
                    razorpayEmail: razorpayPayment.email,
                    razorpayContact: razorpayPayment.contact,
                    razorpayCaptured: razorpayPayment.captured,
                    amountMatch,
                    statusMatch,
                    amountDifference: order.total - razorpayAmount
                };

                if (!amountMatch || !statusMatch) {
                    results.discrepancies.push({
                        ...verificationResult,
                        issue: !amountMatch ? 'Amount mismatch' : 'Status mismatch',
                        severity: !amountMatch ? 'high' : 'medium'
                    });
                } else {
                    results.matches.push(verificationResult);
                }

            } catch (error) {
                results.errors.push({
                    ...orderInfo,
                    error: error.message,
                    errorCode: error.error?.code || 'unknown'
                });
            }

            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`✅ Verification complete: ${results.matches.length} matches, ${results.discrepancies.length} discrepancies, ${results.errors.length} errors`);

        res.json({
            success: true,
            data: results,
            summary: {
                total: results.totalOrders,
                matches: results.matches.length,
                discrepancies: results.discrepancies.length,
                errors: results.errors.length,
                matchPercentage: results.totalOrders > 0
                    ? ((results.matches.length / results.totalOrders) * 100).toFixed(2)
                    : 0
            }
        });

    } catch (error) {
        console.error('❌ Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payments',
            error: error.message
        });
    }
});

// GET /api/admin/verify-payments/:orderId - Verify a specific order
router.get('/verify-payments/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
            .populate('userId', 'email fullName phone');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const result = {
            order: {
                orderNumber: order.orderNumber,
                orderId: order._id,
                customer: order.userId?.fullName || order.shippingAddress?.fullName,
                email: order.userId?.email,
                total: order.total,
                paymentStatus: order.paymentStatus,
                paymentId: order.paymentId,
                razorpayOrderId: order.razorpayOrderId,
                createdAt: order.createdAt
            },
            razorpay: null,
            verification: {
                amountMatch: false,
                statusMatch: false,
                issues: []
            }
        };

        if (!order.paymentId) {
            result.verification.issues.push('No payment ID in database');
            return res.json({ success: true, data: result });
        }

        try {
            const razorpay = getRazorpayInstance();
            const razorpayPayment = await razorpay.payments.fetch(order.paymentId);

            const razorpayAmount = razorpayPayment.amount / 100;

            result.razorpay = {
                paymentId: razorpayPayment.id,
                amount: razorpayAmount,
                status: razorpayPayment.status,
                method: razorpayPayment.method,
                email: razorpayPayment.email,
                contact: razorpayPayment.contact,
                captured: razorpayPayment.captured,
                createdAt: new Date(razorpayPayment.created_at * 1000)
            };

            result.verification.amountMatch = Math.abs(order.total - razorpayAmount) < 0.01;
            result.verification.statusMatch = (
                (order.paymentStatus === 'paid' && razorpayPayment.status === 'captured') ||
                (order.paymentStatus === 'paid' && razorpayPayment.status === 'authorized')
            );

            if (!result.verification.amountMatch) {
                result.verification.issues.push(`Amount mismatch: DB ₹${order.total} vs Razorpay ₹${razorpayAmount}`);
            }
            if (!result.verification.statusMatch) {
                result.verification.issues.push(`Status mismatch: DB ${order.paymentStatus} vs Razorpay ${razorpayPayment.status}`);
            }

        } catch (error) {
            result.verification.issues.push(`Razorpay API error: ${error.message}`);
        }

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('❌ Order verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify order',
            error: error.message
        });
    }
});

export default router;
