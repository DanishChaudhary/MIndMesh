const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');

// Middleware to capture raw body for HMAC verification
router.use('/phonepe', express.json({
    verify: (req, res, buf) => { 
        req.rawBody = buf; 
    }
}));

const WEBHOOK_USERNAME = process.env.PP_WEBHOOK_USERNAME;
const WEBHOOK_PASSWORD = process.env.PP_WEBHOOK_PASSWORD;

if (!WEBHOOK_USERNAME || !WEBHOOK_PASSWORD) {
    console.error('⚠️  Missing PhonePe webhook credentials: PP_WEBHOOK_USERNAME, PP_WEBHOOK_PASSWORD');
}

function sha256Hex(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}

function normalizeAuthHeader(header) {
    if (!header) return '';
    header = header.trim();
    // Extract hex from "SHA256 <hex>" format or return as-is
    const match = header.match(/^(?:sha256\s+)?([0-9a-fA-F]{64})$/i);
    if (match) return match[1].toLowerCase();
    return header.toLowerCase();
}

function calculateDaysFromPrice(amount) {
    const priceMap = {
        1: 7,      // ₹1 = 7 days
        129: 90,   // ₹129 = 3 months
        219: 180,  // ₹219 = 6 months  
        349: 365   // ₹349 = 1 year
    };
    return priceMap[amount] || 7;
}

// Idempotency check using database
async function isEventProcessed(transactionId, eventType) {
    try {
        const order = await Order.findOne({ 
            merchantTransactionId: transactionId,
            webhookEvents: { $elemMatch: { eventType, processed: true } }
        });
        return !!order;
    } catch (error) {
        return false;
    }
}

async function markEventProcessed(transactionId, eventType, payload) {
    try {
        await Order.findOneAndUpdate(
            { merchantTransactionId: transactionId },
            { 
                $push: { 
                    webhookEvents: { 
                        eventType, 
                        processed: true, 
                        processedAt: new Date(),
                        payload: payload
                    } 
                } 
            },
            { upsert: false }
        );
    } catch (error) {
        // Silent error handling
    }
}

router.post('/phonepe', async (req, res) => {
    try {
        // Authentication check
        const incomingAuthRaw = req.get('Authorization') || req.get('authorization') || '';
        const incomingAuth = normalizeAuthHeader(incomingAuthRaw);
        const expectedAuth = sha256Hex(`${WEBHOOK_USERNAME}:${WEBHOOK_PASSWORD}`).toLowerCase();

        if (!incomingAuth || incomingAuth !== expectedAuth) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const payload = req.body;
        const eventType = payload.event || payload.type || payload.eventType || 'unknown';
        const transactionData = payload.data || {};
        const transactionId = transactionData.transactionId || transactionData.orderId || transactionData.merchantTransactionId || payload.id;

        if (!transactionId) {
            return res.status(400).json({ error: 'Missing transaction ID' });
        }

        // Idempotency check
        if (await isEventProcessed(transactionId, eventType)) {
            return res.status(200).json({ received: true, message: 'Already processed' });
        }

        // Find the order
        const order = await Order.findOne({ merchantTransactionId: transactionId });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Handle different event types
        switch (eventType) {
            case 'checkout.order.completed':
            case 'payment.success':
            case 'PAYMENT_SUCCESS':
                await handlePaymentSuccess(order, transactionData, payload);
                break;

            case 'checkout.order.failed':
            case 'payment.failed':
            case 'PAYMENT_FAILED':
                await handlePaymentFailure(order, transactionData, payload);
                break;

            case 'pg.refund.completed':
            case 'refund.success':
                await handleRefundSuccess(order, transactionData, payload);
                break;

            case 'pg.refund.failed':
            case 'refund.failed':
                await handleRefundFailure(order, transactionData, payload);
                break;

            default:
                break;
        }

        // Mark event as processed
        await markEventProcessed(transactionId, eventType, payload);

        return res.status(200).json({ received: true, processed: true });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

async function handlePaymentSuccess(order, transactionData, payload) {
    try {
        // Update order status
        order.status = 'SUCCESS';
        order.phonepeRaw = { ...order.phonepeRaw, success: payload };
        order.completedAt = new Date();
        await order.save();

        // Update user subscription
        const user = await User.findById(order.userId);
        if (!user) {
            return;
        }

        // Calculate subscription duration
        const daysToAdd = calculateDaysFromPrice(order.amount);
        
        // Calculate remaining days from current subscription
        let currentRemainingDays = 0;
        if (user.subscription?.expiresAt && user.subscription.status === 'active') {
            const now = new Date();
            const timeDiff = user.subscription.expiresAt.getTime() - now.getTime();
            currentRemainingDays = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
        }
        
        // Add new days to existing subscription
        const totalDays = currentRemainingDays + daysToAdd;
        const expiryDate = new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000);
        
        // Update subscription
        user.subscription = {
            ...user.subscription,
            currentPlan: order.plan || 'basic',
            planPrice: order.amount,
            status: 'active',
            expiresAt: expiryDate,
            remainingDays: totalDays,
            purchaseHistory: [
                ...(user.subscription?.purchaseHistory || []),
                {
                    plan: order.plan || 'basic',
                    amount: order.amount,
                    purchaseDate: new Date(),
                    transactionId: order.merchantTransactionId,
                    daysAdded: daysToAdd
                }
            ]
        };

        await user.save();

    } catch (error) {
        // Silent error handling
    }
}

async function handlePaymentFailure(order, transactionData, payload) {
    try {
        order.status = 'FAILED';
        order.phonepeRaw = { ...order.phonepeRaw, failure: payload };
        order.failureReason = transactionData.message || payload.message || 'Payment failed';
        order.completedAt = new Date();
        await order.save();

    } catch (error) {
        // Silent error handling
    }
}

async function handleRefundSuccess(order, transactionData, payload) {
    try {
        order.status = 'REFUNDED';
        order.phonepeRaw = { ...order.phonepeRaw, refund: payload };
        order.refundedAt = new Date();
        await order.save();

        // Optionally deactivate user subscription or adjust days
        const user = await User.findById(order.userId);
        if (user && user.subscription) {
            // You can implement refund logic here
            // For example, deduct days or deactivate subscription
        }

    } catch (error) {
        // Silent error handling
    }
}

async function handleRefundFailure(order, transactionData, payload) {
    try {
        order.phonepeRaw = { ...order.phonepeRaw, refundFailure: payload };
        await order.save();

    } catch (error) {
        // Silent error handling
    }
}

module.exports = router;
