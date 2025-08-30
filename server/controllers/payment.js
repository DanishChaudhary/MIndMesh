const phonepe = require('../utils/phonepe');
const Order = require('../models/Order');

function generateMerchantTxId(plan) {
    return `${plan || 'plan'}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function calculateDaysFromPrice(amount) {
    // Define price to days mapping
    const priceMap = {
        1: 7,     // 1rs = 7 days (trial)
        129: 90,  // 129rs = 90 days (3months)
        219: 180, // 219rs = 180 days (6months)
        349: 365  // 349rs = 1 year
    };
    
    // Return days based on amount, default to 7 days for any unrecognized amount
    return priceMap[amount] || 7;
}

function getPlanNameFromId(planId) {
    const planNames = {
        'trial': '7 Days Trial',
        '3months': '3 Months Plan',
        '6months': '6 Months Plan', 
        '1year': '12 Months Plan'
    };
    return planNames[planId] || planId;
}

// Define valid plans and their exact amounts
const VALID_PLANS = {
    'trial': 19,
    '3months': 129, 
    '6months': 199,
    '1year': 329
};

exports.initiate = async (req, res, next) => {
    try {
        const { plan, amount, mobileNumber } = req.body;
        
        // Validate required fields
        if (!plan || !amount) {
            return res.status(400).json({ success: false, error: 'plan_amount_required' });
        }
        
        // Check if user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, error: 'authentication_required' });
        }
        
        // Security: Validate plan exists and amount matches exactly
        if (!VALID_PLANS[plan]) {
            return res.status(400).json({ success: false, error: 'invalid_plan' });
        }
        
        if (Number(amount) !== VALID_PLANS[plan]) {
            return res.status(400).json({ success: false, error: 'amount_mismatch' });
        }
        
        // Security: Rate limiting check (prevent spam)
        const recentOrders = await Order.countDocuments({
            userId: req.user.id,
            createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
        });
        
        if (recentOrders >= 3) {
            return res.status(429).json({ success: false, error: 'too_many_requests' });
        }
        
        const amountPaise = Math.round(Number(amount) * 100);
        const merchantTransactionId = generateMerchantTxId(plan);
        
        // Security: Create order with validated data only
        const order = new Order({ 
            merchantTransactionId, 
            userId: req.user.id, 
            plan, 
            amount: VALID_PLANS[plan], // Use validated amount
            amountPaise, 
            status: 'INITIATED',
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
        });
        await order.save();

        const clientBase = process.env.CLIENT_ORIGIN || process.env.SITE_BASE_URL || 'https://www.brainmesh.in';
        const redirectUrl = `${clientBase}/payment/validate/${merchantTransactionId}`;
        
        
        const result = await phonepe.createPayment(merchantTransactionId, amountPaise, req.user.id, redirectUrl, mobileNumber || '9999999999');
        
        if (!result.success) {
            order.status = 'FAILED';
            order.phonepeRaw = result.raw || result.error;
            order.failureReason = result.error || 'Payment initiation failed';
            await order.save();
            return res.status(500).json({ 
                success: false, 
                error: 'phonepe_initiation_failed', 
                message: result.error || 'Payment could not be initiated. Please try again.',
                details: result.error,
                orderId: merchantTransactionId
            });
        }
        order.status = 'PENDING';
        order.phonepeRaw = result.raw;
        await order.save();
        return res.json({ success: true, paymentUrl: result.redirectUrl, orderId: merchantTransactionId });
    } catch (err) { 
        return res.status(500).json({ 
            success: false, 
            error: 'internal_server_error', 
            message: 'An error occurred while processing your payment. Please try again.' 
        }); 
    }
};

exports.status = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        if (!orderId) return res.status(400).json({ success: false, error: 'orderId required' });
        const ord = await Order.findOne({ merchantTransactionId: orderId });
        if (ord && ord.status === 'SUCCESS') return res.json({ success: true, state: 'SUCCESS', order: ord });
        const status = await phonepe.checkStatus(orderId);
        if (!status.success) return res.json({ success: false, error: 'phonepe_check_failed' });
        const raw = status.raw || {};
        const code = (raw.code || raw.data?.code || '').toString().toUpperCase();
        const isSuccess = code.includes('PAYMENT_SUCCESS') || code.includes('SUCCESS');
        if (ord) {
            ord.phonepeRaw = raw;
            ord.status = isSuccess ? 'SUCCESS' : 'FAILED';
            await ord.save();
            if (isSuccess && ord.userId) {
                // Grant plan to user (same logic as webhook)
                const User = require('../models/User');
                const user = await User.findById(ord.userId);
                if (user) {
                    // Calculate days based on price (19rs = 7 days, etc.)
                    const daysToAdd = calculateDaysFromPrice(ord.amount);
                    
                    // Calculate remaining days from current subscription
                    let currentRemainingDays = 0;
                    if (user.subscription?.expiresAt && user.subscription.status === 'active') {
                        const now = new Date();
                        const timeDiff = user.subscription.expiresAt.getTime() - now.getTime();
                        currentRemainingDays = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
                    }
                    
                    // Add new days to existing remaining days
                    const totalDays = currentRemainingDays + daysToAdd;
                    const expiryDate = new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000);
                    
                    // Update subscription
                    user.subscription = {
                        ...user.subscription,
                        currentPlan: ord.plan || 'trial',
                        planName: getPlanNameFromId(ord.plan || 'trial'),
                        planPrice: ord.amount,
                        status: 'active',
                        expiresAt: expiryDate,
                        remainingDays: totalDays,
                        purchaseHistory: [
                            ...(user.subscription?.purchaseHistory || []),
                            {
                                plan: ord.plan || 'trial',
                                planName: getPlanNameFromId(ord.plan || 'trial'),
                                price: ord.amount,
                                purchaseDate: new Date(),
                                daysAdded: daysToAdd
                            }
                        ]
                    };
                    await user.save();
                }
            }
        }
        return res.json({ success: true, state: isSuccess ? 'SUCCESS' : 'FAILED', raw });
    } catch (err) { next(err); }
};

exports.webhook = async (req, res, next) => {
    try {
        const callback = req.body || {};
        let merchantTransactionId = callback.merchantTransactionId || callback.data?.merchantTransactionId || callback.data?.order?.merchantTransactionId || null;
        if (!merchantTransactionId) return res.status(200).send({ success: true });
        const status = await phonepe.checkStatus(merchantTransactionId);
        if (!status.success) return res.status(200).send({ success: true });
        const raw = status.raw || {};
        const code = (raw.code || raw.data?.code || '').toString().toUpperCase();
        const isSuccess = code.includes('PAYMENT_SUCCESS') || code.includes('SUCCESS');
        const ord = await Order.findOne({ merchantTransactionId });
        if (ord) {
            ord.phonepeRaw = raw;
            ord.status = isSuccess ? 'SUCCESS' : 'FAILED';
            await ord.save();
            if (isSuccess && ord.userId) {
                const User = require('../models/User');
                const user = await User.findById(ord.userId);
                if (user) {
                    // Calculate days based on price (19rs = 7 days, etc.)
                    const daysToAdd = calculateDaysFromPrice(ord.amount);
                    
                    // Calculate remaining days from current subscription
                    let currentRemainingDays = 0;
                    if (user.subscription?.expiresAt && user.subscription.status === 'active') {
                        const now = new Date();
                        const timeDiff = user.subscription.expiresAt.getTime() - now.getTime();
                        currentRemainingDays = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
                    }
                    
                    // Add new days to existing remaining days
                    const totalDays = currentRemainingDays + daysToAdd;
                    const expiryDate = new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000);
                    
                    // Update subscription
                    user.subscription = {
                        ...user.subscription,
                        currentPlan: ord.plan || 'trial',
                        planName: getPlanNameFromId(ord.plan || 'trial'),
                        planPrice: ord.amount,
                        status: 'active',
                        expiresAt: expiryDate,
                        remainingDays: totalDays,
                        purchaseHistory: [
                            ...(user.subscription?.purchaseHistory || []),
                            {
                                plan: ord.plan || 'trial',
                                planName: getPlanNameFromId(ord.plan || 'trial'),
                                price: ord.amount,
                                purchaseDate: new Date(),
                                daysAdded: daysToAdd
                            }
                        ]
                    };
                    await user.save();
                }
            }
        }
        return res.status(200).send({ success: true });
    } catch (err) { next(err); }
};
