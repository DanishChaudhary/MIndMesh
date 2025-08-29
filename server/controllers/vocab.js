const Vocab = require('../models/Vocab');
const fs = require('fs');
const path = require('path');

exports.list = async (req, res, next) => {
    try {
        const { source, letter, q, page = 1, pageSize = 20 } = req.query;
        const filter = {};
        if (source) filter.source = source;
        if (letter) filter.letter = letter.toUpperCase();
        if (q) filter.$or = [{ word: { $regex: q, $options: 'i' } }, { definition: { $regex: q, $options: 'i' } }, { meaning: { $regex: q, $options: 'i' } }];
        const skip = (Math.max(1, Number(page)) - 1) * Number(pageSize);
        const [items, total] = await Promise.all([
            Vocab.find(filter).skip(skip).limit(Number(pageSize)).lean(),
            Vocab.countDocuments(filter)
        ]);
        res.json({ items, total, page: Number(page), pageSize: Number(pageSize) });
    } catch (err) { next(err); }
};

exports.wotd = async (req, res, next) => {
    try {
        // Load WOTD from JSON file
        const wotdPath = path.join(__dirname, '../data/wotd.json');
        
        if (!fs.existsSync(wotdPath)) {
            // Fallback to random word from database
            const count = await Vocab.countDocuments({ source: 'ows' });
            if (!count) return res.json({});
            const rand = Math.floor(Math.random() * count);
            const item = await Vocab.findOne({ source: 'ows' }).skip(rand).lean();
            if (!item) return res.json({});
            const w = {
                word: item.word,
                pos: item.pos || null,
                definition: item.definition || item.meaning,
                example: item.example || null,
                type: item.source
            };
            return res.json(w);
        }

        const wotdData = JSON.parse(fs.readFileSync(wotdPath, 'utf8'));
        
        // Calculate days since epoch to get sequential word index
        const today = new Date();
        const epoch = new Date('2024-01-01'); // Starting date
        const daysSinceEpoch = Math.floor((today - epoch) / (1000 * 60 * 60 * 24));
        
        // Get word sequentially, cycling through the array
        const wordIndex = daysSinceEpoch % wotdData.length;
        let todayWord = wotdData[wordIndex];
        
        if (!todayWord) {
            // Final fallback to database
            const count = await Vocab.countDocuments({ source: 'ows' });
            if (!count) return res.json({});
            const rand = Math.floor(Math.random() * count);
            const item = await Vocab.findOne({ source: 'ows' }).skip(rand).lean();
            if (!item) return res.json({});
            todayWord = {
                word: item.word,
                pos: item.pos || null,
                definition: item.definition || item.meaning,
                example: item.example || null,
                type: item.source
            };
        }
        
        res.json(todayWord);
    } catch (err) { 
        console.error('WOTD Error:', err);
        next(err); 
    }
};

exports.overview = async (req, res, next) => {
    try {
        // Count from JSON files for accurate counts
        const owsPath = path.join(__dirname, '../data/ows.json');
        const iphPath = path.join(__dirname, '../data/iph.json');
        const synonymsPath = path.join(__dirname, '../data/synonyms.json');
        const antonymsPath = path.join(__dirname, '../data/antonyms.json');
        
        let owsCount = 0, iphCount = 0, synonymsCount = 0, antonymsCount = 0;
        
        // Count OWS items
        if (fs.existsSync(owsPath)) {
            const owsData = JSON.parse(fs.readFileSync(owsPath, 'utf8'));
            owsCount = Object.values(owsData).reduce((sum, items) => sum + items.length, 0);
        }
        
        // Count IPH items
        if (fs.existsSync(iphPath)) {
            const iphData = JSON.parse(fs.readFileSync(iphPath, 'utf8'));
            iphCount = Object.values(iphData).reduce((sum, items) => sum + items.length, 0);
        }
        
        // Count Synonyms items
        if (fs.existsSync(synonymsPath)) {
            const synonymsData = JSON.parse(fs.readFileSync(synonymsPath, 'utf8'));
            synonymsCount = Object.values(synonymsData).reduce((sum, items) => sum + items.length, 0);
        }
        
        // Count Antonyms items
        if (fs.existsSync(antonymsPath)) {
            const antonymsData = JSON.parse(fs.readFileSync(antonymsPath, 'utf8'));
            antonymsCount = Object.values(antonymsData).reduce((sum, items) => sum + items.length, 0);
        }
        
        const total = owsCount + iphCount + synonymsCount + antonymsCount;
        
        res.json({ 
            total, 
            ows: owsCount, 
            iph: iphCount, 
            synonyms: synonymsCount, 
            antonyms: antonymsCount 
        });
    } catch (err) { 
        console.error('Overview error:', err);
        next(err); 
    }
};

exports.owsByLetter = async (req, res, next) => {
    try {
        const { letter } = req.params;
        const { page = 1, pageSize = 20 } = req.query;
        
        // Load from JSON file
        const owsPath = path.join(__dirname, '../data/ows.json');
        if (!fs.existsSync(owsPath)) {
            return res.status(404).json({ error: 'Data file not found' });
        }
        
        const owsData = JSON.parse(fs.readFileSync(owsPath, 'utf8'));
        let items = [];
        
        if (owsData[letter.toUpperCase()]) {
            items = owsData[letter.toUpperCase()];
        }
        
        const total = items.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + parseInt(pageSize);
        const paginatedItems = items.slice(startIndex, endIndex);
        
        res.json({
            items: paginatedItems,
            total,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalPages: Math.ceil(total / pageSize)
        });
    } catch (err) {
        console.error('OWS by letter error:', err);
        next(err);
    }
};

exports.iphByLetter = async (req, res, next) => {
    try {
        const { letter } = req.params;
        const { page = 1, pageSize = 20 } = req.query;
        
        // Load from JSON file
        const iphPath = path.join(__dirname, '../data/iph.json');
        if (!fs.existsSync(iphPath)) {
            return res.status(404).json({ error: 'Data file not found' });
        }
        
        const iphData = JSON.parse(fs.readFileSync(iphPath, 'utf8'));
        let items = [];
        
        if (iphData[letter.toUpperCase()]) {
            items = iphData[letter.toUpperCase()];
        }
        
        const total = items.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + parseInt(pageSize);
        const paginatedItems = items.slice(startIndex, endIndex);
        
        res.json({
            items: paginatedItems,
            total,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalPages: Math.ceil(total / pageSize)
        });
    } catch (err) {
        console.error('IPH by letter error:', err);
        next(err);
    }
};

exports.synonymsByLetter = async (req, res, next) => {
    try {
        const { letter } = req.params;
        const { page = 1, pageSize = 20 } = req.query;
        
        // Load from JSON file
        const synonymsPath = path.join(__dirname, '../data/synonyms.json');
        if (!fs.existsSync(synonymsPath)) {
            return res.status(404).json({ error: 'Data file not found' });
        }
        
        const synonymsData = JSON.parse(fs.readFileSync(synonymsPath, 'utf8'));
        let items = [];
        
        if (synonymsData[letter.toUpperCase()]) {
            items = synonymsData[letter.toUpperCase()].map(item => {
                // Collect all available synonyms
                const synonyms = [];
                if (item.synonym1) synonyms.push(item.synonym1);
                if (item.synonym2) synonyms.push(item.synonym2);
                if (item.synonym3) synonyms.push(item.synonym3);
                
                return {
                    ...item,
                    synonyms: synonyms,
                    synonymsText: synonyms.join(', ')
                };
            });
        }
        
        const total = items.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + parseInt(pageSize);
        const paginatedItems = items.slice(startIndex, endIndex);
        
        res.json({
            items: paginatedItems,
            total,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalPages: Math.ceil(total / pageSize)
        });
    } catch (err) {
        console.error('Synonyms by letter error:', err);
        next(err);
    }
};

// Top200 handlers
exports.top200OwsByLetter = async (req, res, next) => {
    try {
        const { letter } = req.params;
        const { page = 1, pageSize = 20 } = req.query;
        
        const owsPath = path.join(__dirname, '../data/200ows.json');
        if (!fs.existsSync(owsPath)) {
            return res.status(404).json({ error: 'Data file not found' });
        }
        
        const owsData = JSON.parse(fs.readFileSync(owsPath, 'utf8'));
        let items = [];
        
        if (owsData[letter.toUpperCase()]) {
            items = owsData[letter.toUpperCase()];
        }
        
        const total = items.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + parseInt(pageSize);
        const paginatedItems = items.slice(startIndex, endIndex);
        
        res.json({
            items: paginatedItems,
            total,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalPages: Math.ceil(total / pageSize)
        });
    } catch (err) {
        next(err);
    }
};

exports.top200IphByLetter = async (req, res, next) => {
    try {
        const { letter } = req.params;
        const { page = 1, pageSize = 20 } = req.query;
        
        const iphPath = path.join(__dirname, '../data/200iph.json');
        if (!fs.existsSync(iphPath)) {
            return res.status(404).json({ error: 'Data file not found' });
        }
        
        const iphData = JSON.parse(fs.readFileSync(iphPath, 'utf8'));
        let items = [];
        
        if (iphData[letter.toUpperCase()]) {
            items = iphData[letter.toUpperCase()];
        }
        
        const total = items.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + parseInt(pageSize);
        const paginatedItems = items.slice(startIndex, endIndex);
        
        res.json({
            items: paginatedItems,
            total,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalPages: Math.ceil(total / pageSize)
        });
    } catch (err) {
        next(err);
    }
};

exports.top200SynonymsByLetter = async (req, res, next) => {
    try {
        const { letter } = req.params;
        const { page = 1, pageSize = 20 } = req.query;
        
        const synonymsPath = path.join(__dirname, '../data/200synonyms.json');
        if (!fs.existsSync(synonymsPath)) {
            return res.status(404).json({ error: 'Data file not found' });
        }
        
        const synonymsData = JSON.parse(fs.readFileSync(synonymsPath, 'utf8'));
        let items = [];
        
        if (synonymsData[letter.toUpperCase()]) {
            items = synonymsData[letter.toUpperCase()];
        }
        
        const total = items.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + parseInt(pageSize);
        const paginatedItems = items.slice(startIndex, endIndex);
        
        res.json({
            items: paginatedItems,
            total,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalPages: Math.ceil(total / pageSize)
        });
    } catch (err) {
        next(err);
    }
};

exports.top200AntonymsByLetter = async (req, res, next) => {
    try {
        const { letter } = req.params;
        const { page = 1, pageSize = 20 } = req.query;
        
        const antonymsPath = path.join(__dirname, '../data/200antonyms.json');
        if (!fs.existsSync(antonymsPath)) {
            return res.status(404).json({ error: 'Data file not found' });
        }
        
        const antonymsData = JSON.parse(fs.readFileSync(antonymsPath, 'utf8'));
        let items = [];
        
        if (antonymsData[letter.toUpperCase()]) {
            items = antonymsData[letter.toUpperCase()];
        }
        
        const total = items.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + parseInt(pageSize);
        const paginatedItems = items.slice(startIndex, endIndex);
        
        res.json({
            items: paginatedItems,
            total,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalPages: Math.ceil(total / pageSize)
        });
    } catch (err) {
        next(err);
    }
};

exports.antonymsByLetter = async (req, res, next) => {
    try {
        const { letter } = req.params;
        const { page = 1, pageSize = 20 } = req.query;
        
        // Load from JSON file
        const antonymsPath = path.join(__dirname, '../data/antonyms.json');
        if (!fs.existsSync(antonymsPath)) {
            return res.status(404).json({ error: 'Data file not found' });
        }
        
        const antonymsData = JSON.parse(fs.readFileSync(antonymsPath, 'utf8'));
        let items = [];
        
        if (antonymsData[letter.toUpperCase()]) {
            items = antonymsData[letter.toUpperCase()].map(item => {
                // Collect all available antonyms
                const antonyms = [];
                if (item.antonym1) antonyms.push(item.antonym1);
                if (item.antonym2) antonyms.push(item.antonym2);
                if (item.antonym3) antonyms.push(item.antonym3);
                
                return {
                    ...item,
                    antonyms: antonyms,
                    antonymsText: antonyms.join(', ')
                };
            });
        }
        
        const total = items.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + parseInt(pageSize);
        const paginatedItems = items.slice(startIndex, endIndex);
        
        res.json({
            items: paginatedItems,
            total,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalPages: Math.ceil(total / pageSize)
        });
    } catch (err) {
        console.error('Antonyms by letter error:', err);
        next(err);
    }
};

exports.detail = async (req, res, next) => {
    try {
        const item = await Vocab.findById(req.params.id).lean();
        if (!item) return res.status(404).json({ error: 'not_found' });
        res.json({ item });
    } catch (err) { next(err); }
};
