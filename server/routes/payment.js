const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { initiate, status } = require('../controllers/payment');
const { checkSubscriptionStatus } = require('../middleware/subscriptionAuth');

// Strict rate limiting for payment endpoints
const paymentRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Max 5 payment attempts per 15 minutes per IP
    message: { success: false, error: 'too_many_payment_attempts' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/initiate', paymentRateLimit, checkSubscriptionStatus, initiate);
router.get('/status/:merchantTransactionId', checkSubscriptionStatus, status);

module.exports = router;
