const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret';
const jwtExpiry = process.env.JWT_EXPIRES_IN || '7d';

function signToken(user) {
    return jwt.sign({ id: user._id, email: user.email }, jwtSecret, { expiresIn: jwtExpiry });
}

// Email validation function for genuine Gmail addresses
function isValidGmail(email) {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
}

// Additional email validation (can be extended for other providers)
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        
        // Validation checks
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ error: 'email_and_password_required' });
        }
        
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'passwords_do_not_match' });
        }
        
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'invalid_email' });
        }
        
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'user_exists' });
        
        const hashed = await bcrypt.hash(password, 12);
        const user = new User({ name, email, password: hashed });
        await user.save();
        
        const token = signToken(user);
        const cookieOptions = { 
            httpOnly: true, 
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        };
        
        res.cookie('token', token, cookieOptions);
        res.json({ 
            user: { _id: user._id, name: user.name, email: user.email },
            subscription: user.subscription || null
        });
    } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'email_and_password_required' });
        
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) return res.status(400).json({ error: 'invalid_credentials' });
        
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: 'invalid_credentials' });
        
        const token = signToken(user);
        
        const cookieOptions = { 
            httpOnly: true, 
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        };
        
        res.cookie('token', token, cookieOptions);
        res.json({ 
            user: { _id: user._id, name: user.name, email: user.email },
            subscription: user.subscription || null
        });
    } catch (err) { next(err); }
};

exports.logout = async (req, res) => {
    res.clearCookie('token', { path: '/' });
    res.json({ ok: true });
};

exports.me = async (req, res, next) => {
    try {
        const token = req.cookies && req.cookies.token;
        if (!token) return res.json({ user: null, subscription: null });
        const data = jwt.verify(token, jwtSecret);
        let user = await User.findById(data.id);
        if (!user) {
            // Clear invalid cookie
            res.clearCookie('token', { path: '/' });
            return res.json({ user: null, subscription: null });
        }
        
        // Check subscription expiry and update status if expired
        if (user.subscription && user.subscription.expiresAt) {
            const now = new Date();
            const expiryDate = new Date(user.subscription.expiresAt);
            const timeDiff = expiryDate.getTime() - now.getTime();
            const remainingDays = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
            
            if (remainingDays <= 0) {
                user.subscription.status = 'expired';
                user.subscription.remainingDays = 0;
            } else {
                user.subscription.remainingDays = remainingDays;
                if (user.subscription.status !== 'active') {
                    user.subscription.status = 'active';
                }
            }
            await user.save();
        }
        
        res.json({ user: { _id: user._id, name: user.name, email: user.email }, subscription: user.subscription || null });
    } catch (err) { 
        // Clear invalid/expired token cookie
        res.clearCookie('token', { path: '/' });
        res.json({ user: null, subscription: null });
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'email_required' });
        
        const user = await User.findOne({ email });
        if (!user) {
            // For security, don't reveal if user exists or not
            // Always return success message
            return res.json({ 
                message: 'If an account with that email exists, password reset instructions have been sent'
            });
        }
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
        
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiry = resetTokenExpiry;
        await user.save();
        
        // In production, send email with reset link
        // For now, return the token (remove this in production)
        res.json({ 
            message: 'Password reset instructions sent to your email',
            resetToken: resetToken // Remove this in production
        });
    } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { token, password, confirmPassword } = req.body;
        
        if (!token || !password || !confirmPassword) {
            return res.status(400).json({ error: 'all_fields_required' });
        }
        
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'passwords_do_not_match' });
        }
        
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiry: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ error: 'invalid_or_expired_token' });
        }
        
        const hashed = await bcrypt.hash(password, 12);
        user.password = hashed;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();
        
        res.json({ message: 'Password reset successful' });
    } catch (err) { next(err); }
};
