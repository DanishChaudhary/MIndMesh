const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    merchantTransactionId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    plan: String,
    amount: Number,
    amountPaise: Number,
    status: { type: String, default: 'INITIATED' },
    phonepeRaw: mongoose.Schema.Types.Mixed,
    failureReason: String,
    completedAt: Date,
    refundedAt: Date,
    ipAddress: String,
    userAgent: String,
    webhookEvents: [{
        eventType: String,
        processed: { type: Boolean, default: false },
        processedAt: Date,
        payload: mongoose.Schema.Types.Mixed
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
OrderSchema.pre('save', function (next) { this.updatedAt = Date.now(); next(); });
module.exports = mongoose.model('Order', OrderSchema);
