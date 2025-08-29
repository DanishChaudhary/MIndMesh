const jwt = require('jsonwebtoken');
const User = require('../models/User');

const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret';

// Middleware to check if user has active subscription
exports.requireActiveSubscription = async (req, res, next) => {
    try {
        const token = req.cookies && req.cookies.token;
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                error: 'subscription_required',
                message: 'Please subscribe to access this feature' 
            });
        }

        const data = jwt.verify(token, jwtSecret);
        const user = await User.findById(data.id);
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'user_not_found',
                message: 'User not found' 
            });
        }

        // Check if user has active subscription
        if (!user.subscription || user.subscription.status !== 'active') {
            return res.status(403).json({ 
                success: false, 
                error: 'subscription_expired',
                message: 'Your subscription has expired. Please renew to continue using premium features.' 
            });
        }

        // Check if subscription is actually expired (double check)
        if (user.subscription.expiresAt && new Date() > new Date(user.subscription.expiresAt)) {
            // Update user status to expired
            user.subscription.status = 'expired';
            user.subscription.remainingDays = 0;
            await user.save();
            
            return res.status(403).json({ 
                success: false, 
                error: 'subscription_expired',
                message: 'Your subscription has expired. Please renew to continue using premium features.' 
            });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ 
            success: false, 
            error: 'invalid_token',
            message: 'Invalid authentication token' 
        });
    }
};

// Middleware to check subscription but allow limited access
exports.checkSubscriptionStatus = async (req, res, next) => {
    try {
        const token = req.cookies && req.cookies.token;
        if (!token) {
            req.subscriptionStatus = 'none';
            return next();
        }

        const data = jwt.verify(token, jwtSecret);
        const user = await User.findById(data.id);
        
        if (!user) {
            req.subscriptionStatus = 'none';
            return next();
        }

        // Update subscription status if needed
        if (user.subscription && user.subscription.expiresAt) {
            const now = new Date();
            const expiryDate = new Date(user.subscription.expiresAt);
            const timeDiff = expiryDate.getTime() - now.getTime();
            const remainingDays = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
            
            if (remainingDays <= 0) {
                user.subscription.status = 'expired';
                user.subscription.remainingDays = 0;
                await user.save();
            } else {
                user.subscription.remainingDays = remainingDays;
                if (user.subscription.status !== 'active') {
                    user.subscription.status = 'active';
                    await user.save();
                }
            }
        }

        req.user = user;
        req.subscriptionStatus = user.subscription?.status || 'none';
        next();
    } catch (err) {
        req.subscriptionStatus = 'none';
        next();
    }
};
