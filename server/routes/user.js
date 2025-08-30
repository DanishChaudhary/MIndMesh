const express = require('express');
const router = express.Router();
const { requireAuth } = require('../utils/authMiddleware');
const User = require('../models/User');

// Get practice queue
router.get('/practice-queue', requireAuth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id, 'practiceQueue').lean();
        res.json({ items: user?.practiceQueue || [] });
    } catch (err) { next(err); }
});

// Add to practice queue
router.post('/practice-queue', requireAuth, async (req, res, next) => {
    try {
        const item = req.body;
        if (!item.word && !item.phrase) return res.status(400).json({ error: 'word_or_phrase_required' });
        
        // Create practice queue item with all relevant fields
        const practiceItem = {
            word: item.word,
            phrase: item.phrase,
            definition: item.definition,
            meaning: item.meaning,
            pos: item.pos,
            example: item.example,
            synonyms: item.synonyms,
            antonyms: item.antonyms,
            type: item.type || (item.word ? 'ows' : 'iph'),
            addedAt: new Date()
        };
        
        // Remove undefined fields
        Object.keys(practiceItem).forEach(key => {
            if (practiceItem[key] === undefined) {
                delete practiceItem[key];
            }
        });
        
        // Check if item already exists to avoid duplicates
        const existingUser = await User.findById(req.user.id);
        const isDuplicate = existingUser.practiceQueue.some(existing => 
            (existing.word && existing.word === practiceItem.word) || 
            (existing.phrase && existing.phrase === practiceItem.phrase)
        );
        
        if (!isDuplicate) {
            await User.updateOne({ _id: req.user.id }, { $push: { practiceQueue: practiceItem } });
        }
        res.json({ ok: true });
    } catch (err) { next(err); }
});

// Clear practice queue
router.delete('/practice-queue', requireAuth, async (req, res, next) => {
    try {
        await User.updateOne({ _id: req.user.id }, { $set: { practiceQueue: [] } });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

// Mark known: no-op baseline (extend to track stats)
router.post('/mark-known', requireAuth, async (req, res, next) => {
    try {
        res.json({ ok: true });
    } catch (err) { next(err); }
});

// Profile for subscription details
router.get('/profile', requireAuth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id, 'subscription name email').lean();
        res.json({ subscription: user?.subscription || null, user: user ? { name: user.name, email: user.email, _id: user._id } : null });
    } catch (err) { next(err); }
});

module.exports = router;


