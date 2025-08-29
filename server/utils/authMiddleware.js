const jwt = require('jsonwebtoken');
const User = require('../models/User');
const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret';

exports.requireAuth = async (req, res, next) => {
    try {
        const token = req.cookies && req.cookies.token || req.headers.authorization && req.headers.authorization.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'unauthenticated' });
        const data = jwt.verify(token, jwtSecret);
        const user = await User.findById(data.id).lean();
        if (!user) return res.status(401).json({ error: 'unauthenticated' });
        
        // Check subscription expiry and update status if expired
        if (user.subscription && user.subscription.expiresAt && new Date() > new Date(user.subscription.expiresAt)) {
            await User.findByIdAndUpdate(data.id, {
                'subscription.status': 'inactive',
                'subscription.plans': []
            });
            user.subscription.status = 'inactive';
            user.subscription.plans = [];
        }
        
        req.user = { id: user._id, email: user.email, name: user.name, subscription: user.subscription };
        next();
    } catch (err) { 
        if (err.message === 'invalid signature' || err.name === 'JsonWebTokenError' || err.message.includes('jwt')) {
            return res.status(401).json({ error: 'token_expired', message: 'Please log out and log back in' });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'token_expired', message: 'Session expired, please log in again' });
        }
        return res.status(401).json({ error: 'unauthenticated' }); 
    }
};

// middleware to attach user if token exists but not error if absent
exports.optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies && req.cookies.token || req.headers.authorization && req.headers.authorization.split(' ')[1];
        if (!token) return next();
        const data = jwt.verify(token, jwtSecret);
        const user = await User.findById(data.id).lean();
        if (!user) return next();
        req.user = { id: user._id, email: user.email, name: user.name };
        next();
    } catch (err) { next(); }
};
