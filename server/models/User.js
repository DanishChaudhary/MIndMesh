const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
    subscription: {
        currentPlan: { type: String, enum: ['trial', '3months', '6months', '1year'], default: null },
        planName: { type: String, default: null }, // Human readable plan name
        planPrice: { type: Number, default: 0 }, // Store the price paid (19rs, etc.)
        status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'inactive' },
        expiresAt: Date,
        remainingDays: { type: Number, default: 0 },
        purchaseHistory: [{
            plan: String,
            planName: String,
            price: Number,
            purchaseDate: { type: Date, default: Date.now },
            daysAdded: Number
        }]
    },
    practiceQueue: [{
        word: String,
        phrase: String,
        definition: String,
        meaning: String,
        pos: String,
        example: String,
        synonyms: [String],
        antonyms: [String],
        type: String,
        addedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
