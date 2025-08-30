const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { requireActiveSubscription, checkSubscriptionStatus } = require('../middleware/subscriptionAuth');

// In-memory storage for user quiz sessions (in production, use Redis or database)
const userQuizSessions = new Map();

// Free quiz endpoint - serves 200ows.json data directly
router.get('/free', async (req, res) => {
    try {
        const freeQuizPath = path.join(__dirname, '../data/200ows.json');
        
        if (!fs.existsSync(freeQuizPath)) {
            return res.status(404).json({ error: 'Free quiz data not found' });
        }
        
        const owsData = JSON.parse(fs.readFileSync(freeQuizPath, 'utf8'));
        // 200ows.json is already an array, no need to flatten
        const freeQuizData = Array.isArray(owsData) ? owsData : Object.values(owsData).flat();
        
        // Use all available words and shuffle them randomly
        const shuffled = freeQuizData.sort(() => Math.random() - 0.5);
        
        // Generate quiz questions with options
        const questions = shuffled.map(item => {
            // Generate 3 random distractors from other words
            const distractors = freeQuizData
                .filter(d => d.word !== item.word)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(d => d.word);
            
            // Create options array with correct answer and distractors
            const options = [item.word, ...distractors].sort(() => Math.random() - 0.5);
            
            return {
                word: item.word,
                definition: item.definition,
                pos: item.pos,
                options,
                prompt: item.definition,
                correctAnswer: item.word
            };
        });
        
        res.json({
            questions,
            total: questions.length,
            type: 'freequiz'
        });
        
    } catch (error) {
        console.error('Free quiz error:', error);
        res.status(500).json({ error: 'Failed to generate free quiz' });
    }
});

// Synonyms quiz endpoint with tracking - PREMIUM FEATURE
router.get('/synonyms', requireActiveSubscription, async (req, res) => {
    try {
        const { userId = 'anonymous', sessionId, reset, wordAttempts, letter = 'A' } = req.query;
        
        // Parse wordAttempts from client if provided
        let clientWordAttempts = {};
        if (wordAttempts) {
            try {
                clientWordAttempts = JSON.parse(wordAttempts);
            } catch (e) {
                // Failed to parse wordAttempts
            }
        }
        
        const userSessionKey = `${userId}_synonyms`;
        
        // Reset session if requested
        if (reset === 'true') {
            userQuizSessions.delete(userSessionKey);
            clientWordAttempts = {};
        }
        
        // Get or create user session
        let userSession = userQuizSessions.get(userSessionKey);
        if (!userSession) {
            userSession = {
                wordAttempts: new Map(), // word -> attempt count (1, 2, 3)
                usedQuestions: new Set(), // track questions used in current session
                sessionStartTime: new Date()
            };
            userQuizSessions.set(userSessionKey, userSession);
        }
        
        // Merge client word attempts with server session
        Object.keys(clientWordAttempts).forEach(word => {
            userSession.wordAttempts.set(word, clientWordAttempts[word]);
        });
        
        const synonymsPath = path.join(__dirname, '../data/synonyms.json');
        if (!fs.existsSync(synonymsPath)) {
            return res.status(404).json({ error: 'Synonyms data not found' });
        }
        
        const synonymsData = JSON.parse(fs.readFileSync(synonymsPath, 'utf8'));
        // Filter words by letter
        const letterWords = synonymsData[letter.toUpperCase()] || [];
        const allWords = Object.values(synonymsData).flat(); // Keep all words for distractors
        
        // Shuffle the letter words for randomization like OWS quiz
        const shuffledLetterWords = [...letterWords].sort(() => Math.random() - 0.5);
        
        // Filter out words that have been used in current session (only from selected letter)
        const availableWords = shuffledLetterWords.filter(item => {
            const currentAttempt = userSession.wordAttempts.get(item.word) || 1;
            const questionKey = `${item.word}_${currentAttempt}`;
            return !userSession.usedQuestions.has(questionKey);
        });
        
        if (availableWords.length === 0) {
            // Reset session if no more questions available
            userSession.usedQuestions.clear();
            // Don't reset wordAttempts - keep tracking which synonym to show next
        }
        
        // Refresh available words after reset (only from selected letter)
        const finalAvailableWords = availableWords.length === 0 ? shuffledLetterWords : availableWords;
        
        // Generate questions with proper synonym selection - use all available words like OWS/IPH
        const questions = finalAvailableWords.map(item => {
            // Get current attempt count for this word (1, 2, or 3)
            let attemptCount = userSession.wordAttempts.get(item.word) || 1;
            
            // Determine which synonym to use based on attempt count
            let correctSynonym;
            if (attemptCount === 1 && item.synonym1) {
                correctSynonym = item.synonym1;
            } else if (attemptCount === 2 && item.synonym2) {
                correctSynonym = item.synonym2;
            } else if (attemptCount === 3 && item.synonym3) {
                correctSynonym = item.synonym3;
            } else {
                // Fallback to synonym1 if others don't exist
                correctSynonym = item.synonym1;
            }
            
            // Mark this question as used
            const questionKey = `${item.word}_${attemptCount}`;
            userSession.usedQuestions.add(questionKey);
            
            // Update attempt count for next time (cycle through 1, 2, 3)
            const nextAttempt = attemptCount >= 3 ? 1 : attemptCount + 1;
            userSession.wordAttempts.set(item.word, nextAttempt);
            
            // Generate 3 random distractors from other synonyms
            const distractors = [];
            const otherWords = allWords.filter(w => w.word !== item.word);
            
            while (distractors.length < 3 && otherWords.length > 0) {
                const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
                const randomSynonym = randomWord.synonym1 || randomWord.synonym2 || randomWord.synonym3;
                
                if (randomSynonym && randomSynonym !== correctSynonym && !distractors.includes(randomSynonym)) {
                    distractors.push(randomSynonym);
                }
                
                // Remove to avoid infinite loop
                otherWords.splice(otherWords.indexOf(randomWord), 1);
            }
            
            // Create options array
            const options = [correctSynonym, ...distractors].sort(() => Math.random() - 0.5);
            
            return {
                word: item.word,
                definition: item.definition,
                options,
                prompt: `What is a synonym for "${item.word}"? (${item.definition})`,
                correctAnswer: correctSynonym,
                attemptNumber: attemptCount
            };
        });
        
        // Convert Map to object for client storage
        const wordAttemptsObj = {};
        userSession.wordAttempts.forEach((value, key) => {
            wordAttemptsObj[key] = value;
        });

        res.json({
            questions,
            total: questions.length,
            type: 'synonyms',
            wordAttempts: wordAttemptsObj, // Send back to client for localStorage
            sessionInfo: {
                totalWordsTracked: userSession.wordAttempts.size,
                questionsUsedInSession: userSession.usedQuestions.size
            }
        });
        
    } catch (error) {
        console.error('Synonyms quiz error:', error);
        res.status(500).json({ error: 'Failed to generate synonyms quiz' });
    }
});

// Antonyms quiz endpoint with tracking
// 200 Synonyms Quiz with tracking and rotation - PREMIUM FEATURE
router.get('/200synonyms', requireActiveSubscription, async (req, res) => {
    try {
        const { userId = 'anonymous', sessionId, reset, wordAttempts } = req.query;
        
        // Parse wordAttempts from client if provided
        let clientWordAttempts = {};
        if (wordAttempts) {
            try {
                clientWordAttempts = JSON.parse(wordAttempts);
            } catch (e) {
                // Failed to parse wordAttempts
            }
        }
        
        const userSessionKey = `${userId}_200synonyms`;
        
        // Reset session if requested
        if (reset === 'true') {
            userQuizSessions.delete(userSessionKey);
            clientWordAttempts = {};
        }
        
        // Get or create user session
        let userSession = userQuizSessions.get(userSessionKey);
        if (!userSession) {
            userSession = {
                wordAttempts: new Map(),
                usedQuestions: new Set(),
                sessionStartTime: new Date()
            };
            userQuizSessions.set(userSessionKey, userSession);
        }
        
        // Merge client word attempts with server session
        Object.keys(clientWordAttempts).forEach(word => {
            userSession.wordAttempts.set(word, clientWordAttempts[word]);
        });
        
        const synonymsPath = path.join(__dirname, '../data/200synonyms.json');
        if (!fs.existsSync(synonymsPath)) {
            return res.status(404).json({ error: '200synonyms data not found' });
        }
        
        const synonymsData = JSON.parse(fs.readFileSync(synonymsPath, 'utf8'));
        
        // Shuffle the data for randomization like OWS quiz
        const shuffledData = [...synonymsData].sort(() => Math.random() - 0.5);
        
        // Filter out words that have been used in current session
        const availableWords = shuffledData.filter(item => {
            const currentAttempt = userSession.wordAttempts.get(item.word) || 1;
            const questionKey = `${item.word}_${currentAttempt}`;
            return !userSession.usedQuestions.has(questionKey);
        });
        
        if (availableWords.length === 0) {
            // Reset session if no more questions available
            userSession.usedQuestions.clear();
        }
        
        const finalAvailableWords = availableWords.length === 0 ? shuffledData : availableWords;
        
        const questions = finalAvailableWords.map(item => {

            let attemptCount = userSession.wordAttempts.get(item.word) || 1;
            
            let correctSynonym;
            if (attemptCount === 1 && item.synonym1) {
                correctSynonym = item.synonym1;
            } else if (attemptCount === 2 && item.synonym2) {
                correctSynonym = item.synonym2;
            } else if (attemptCount === 3 && item.synonym3) {
                correctSynonym = item.synonym3;
            } else {
                correctSynonym = item.synonym1;
            }
            
            const questionKey = `${item.word}_${attemptCount}`;
            userSession.usedQuestions.add(questionKey);
            
            const nextAttempt = attemptCount >= 3 ? 1 : attemptCount + 1;
            userSession.wordAttempts.set(item.word, nextAttempt);
            
            const distractors = [];
            const otherWords = synonymsData.filter(w => w.word !== item.word);
            
            while (distractors.length < 3 && otherWords.length > 0) {
                const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
                const randomSynonym = randomWord.synonym1 || randomWord.synonym2 || randomWord.synonym3;
                
                if (randomSynonym && randomSynonym !== correctSynonym && !distractors.includes(randomSynonym)) {
                    distractors.push(randomSynonym);
                }
                
                // Remove to avoid infinite loop
                otherWords.splice(otherWords.indexOf(randomWord), 1);
            }
            
            // Create options array
            const options = [correctSynonym, ...distractors].sort(() => Math.random() - 0.5);
            
            return {
                word: item.word,
                definition: item.definition,
                options,
                prompt: `What is a synonym for "${item.word}"? (${item.definition})`,
                correctAnswer: correctSynonym,
                attemptNumber: attemptCount
            };
        });
        
        // Convert Map to object for client storage
        const wordAttemptsObj = {};
        userSession.wordAttempts.forEach((value, key) => {
            wordAttemptsObj[key] = value;
        });
        
        res.json({
            questions,
            total: questions.length,
            type: '200synonyms',
            wordAttempts: wordAttemptsObj,
            sessionInfo: {
                totalWordsTracked: userSession.wordAttempts.size,
                questionsUsedInSession: userSession.usedQuestions.size
            }
        });
    } catch (error) {
        console.error('200synonyms quiz error:', error);
        res.status(500).json({ error: 'Failed to generate 200synonyms quiz' });
    }
});

// 200 Antonyms Quiz with tracking and rotation - PREMIUM FEATURE
router.get('/200antonyms', requireActiveSubscription, async (req, res) => {
    try {
        const { userId = 'anonymous', sessionId, reset, wordAttempts } = req.query;
        
        // Parse wordAttempts from client if provided
        let clientWordAttempts = {};
        if (wordAttempts) {
            try {
                clientWordAttempts = JSON.parse(wordAttempts);
            } catch (e) {
                // Failed to parse wordAttempts
            }
        }
        
        const userSessionKey = `${userId}_200antonyms`;
        
        // Reset session if requested
        if (reset === 'true') {
            userQuizSessions.delete(userSessionKey);
            clientWordAttempts = {};
        }
        
        // Get or create user session
        let userSession = userQuizSessions.get(userSessionKey);
        if (!userSession) {
            userSession = {
                wordAttempts: new Map(),
                usedQuestions: new Set(),
                sessionStartTime: new Date()
            };
            userQuizSessions.set(userSessionKey, userSession);
        }
        
        // Merge client word attempts with server session
        Object.keys(clientWordAttempts).forEach(word => {
            userSession.wordAttempts.set(word, clientWordAttempts[word]);
        });
        
        const antonymsPath = path.join(__dirname, '../data/200antonyms.json');
        if (!fs.existsSync(antonymsPath)) {
            return res.status(404).json({ error: '200antonyms data not found' });
        }
        
        const antonymsData = JSON.parse(fs.readFileSync(antonymsPath, 'utf8'));
        
        // Shuffle the data for randomization like OWS quiz
        const shuffledData = [...antonymsData].sort(() => Math.random() - 0.5);
        
        // Filter out words that have been used in current session
        const availableWords = shuffledData.filter(item => {
            const currentAttempt = userSession.wordAttempts.get(item.word) || 1;
            const questionKey = `${item.word}_${currentAttempt}`;
            return !userSession.usedQuestions.has(questionKey);
        });
        
        if (availableWords.length === 0) {
            // Reset session if no more questions available
            userSession.usedQuestions.clear();
        }
        
        // Refresh available words after reset
        const finalAvailableWords = availableWords.length === 0 ? shuffledData : availableWords;
        
        // Generate questions with proper antonym selection
        const questions = finalAvailableWords.slice(0, 20).map(item => {
            // Get current attempt count for this word (1, 2, or 3)
            let attemptCount = userSession.wordAttempts.get(item.word) || 1;
            
            // Determine which antonym to use based on attempt count
            let correctAntonym;
            if (attemptCount === 1 && item.antonym1) {
                correctAntonym = item.antonym1;
            } else if (attemptCount === 2 && item.antonym2) {
                correctAntonym = item.antonym2;
            } else if (attemptCount === 3 && item.antonym3) {
                correctAntonym = item.antonym3;
            } else {
                // Fallback to antonym1 if others don't exist
                correctAntonym = item.antonym1;
            }
            
            // Mark this question as used
            const questionKey = `${item.word}_${attemptCount}`;
            userSession.usedQuestions.add(questionKey);
            
            // Update attempt count for next time (cycle through 1, 2, 3)
            const nextAttempt = attemptCount >= 3 ? 1 : attemptCount + 1;
            userSession.wordAttempts.set(item.word, nextAttempt);
            
            // Generate 3 random distractors from other antonyms
            const distractors = [];
            const otherWords = antonymsData.filter(w => w.word !== item.word);
            
            while (distractors.length < 3 && otherWords.length > 0) {
                const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
                const randomAntonym = randomWord.antonym1 || randomWord.antonym2 || randomWord.antonym3;
                
                if (randomAntonym && randomAntonym !== correctAntonym && !distractors.includes(randomAntonym)) {
                    distractors.push(randomAntonym);
                }
                
                // Remove to avoid infinite loop
                otherWords.splice(otherWords.indexOf(randomWord), 1);
            }
            
            // Create options array
            const options = [correctAntonym, ...distractors].sort(() => Math.random() - 0.5);
            
            return {
                word: item.word,
                definition: item.definition,
                options,
                prompt: `What is an antonym for "${item.word}"? (${item.definition})`,
                correctAnswer: correctAntonym,
                attemptNumber: attemptCount
            };
        });
        
        // Convert Map to object for client storage
        const wordAttemptsObj = {};
        userSession.wordAttempts.forEach((value, key) => {
            wordAttemptsObj[key] = value;
        });
        
        res.json({
            questions,
            total: questions.length,
            type: '200antonyms',
            wordAttempts: wordAttemptsObj,
            sessionInfo: {
                totalWordsTracked: userSession.wordAttempts.size,
                questionsUsedInSession: userSession.usedQuestions.size
            }
        });
    } catch (error) {
        console.error('200antonyms quiz error:', error);
        res.status(500).json({ error: 'Failed to generate 200antonyms quiz' });
    }
});

router.get('/antonyms', requireActiveSubscription, async (req, res) => {
    try {
        const { userId = 'anonymous', sessionId, reset, wordAttempts, letter = 'A' } = req.query;
        
        // Parse wordAttempts from client if provided
        let clientWordAttempts = {};
        if (wordAttempts) {
            try {
                clientWordAttempts = JSON.parse(wordAttempts);
            } catch (e) {
                // Failed to parse wordAttempts
            }
        }
        
        const userSessionKey = `${userId}_antonyms`;
        
        // Reset session if requested
        if (reset === 'true') {
            userQuizSessions.delete(userSessionKey);
            clientWordAttempts = {};
        }
        
        // Get or create user session
        let userSession = userQuizSessions.get(userSessionKey);
        if (!userSession) {
            userSession = {
                wordAttempts: new Map(), // word -> attempt count (1, 2, 3)
                usedQuestions: new Set(), // track questions used in current session
                sessionStartTime: new Date()
            };
            userQuizSessions.set(userSessionKey, userSession);
        }
        
        // Merge client word attempts with server session
        Object.keys(clientWordAttempts).forEach(word => {
            userSession.wordAttempts.set(word, clientWordAttempts[word]);
        });
        
        const antonymsPath = path.join(__dirname, '../data/antonyms.json');
        if (!fs.existsSync(antonymsPath)) {
            return res.status(404).json({ error: 'Antonyms data not found' });
        }
        
        const antonymsData = JSON.parse(fs.readFileSync(antonymsPath, 'utf8'));
        // Filter words by letter
        const letterWords = antonymsData[letter.toUpperCase()] || [];
        const allWords = Object.values(antonymsData).flat(); // Keep all words for distractors
        
        // Shuffle the letter words for randomization like OWS quiz
        const shuffledLetterWords = [...letterWords].sort(() => Math.random() - 0.5);
        
        // Filter out words that have been used in current session (only from selected letter)
        const availableWords = shuffledLetterWords.filter(item => {
            const currentAttempt = userSession.wordAttempts.get(item.word) || 1;
            const questionKey = `${item.word}_${currentAttempt}`;
            return !userSession.usedQuestions.has(questionKey);
        });
        
        if (availableWords.length === 0) {
            // Reset session if no more questions available
            userSession.usedQuestions.clear();
            // Don't reset wordAttempts - keep tracking which antonym to show next
        }
        
        // Refresh available words after reset (only from selected letter)
        const finalAvailableWords = availableWords.length === 0 ? shuffledLetterWords : availableWords;
        
        // Generate questions with proper antonym selection - use all available words like OWS/IPH
        const questions = finalAvailableWords.map(item => {
            // Get current attempt count for this word (1, 2, or 3)
            let attemptCount = userSession.wordAttempts.get(item.word) || 1;
            
            // Determine which antonym to use based on attempt count
            let correctAntonym;
            if (attemptCount === 1 && item.antonym1) {
                correctAntonym = item.antonym1;
            } else if (attemptCount === 2 && item.antonym2) {
                correctAntonym = item.antonym2;
            } else if (attemptCount === 3 && item.antonym3) {
                correctAntonym = item.antonym3;
            } else {
                // Fallback to antonym1 if others don't exist
                correctAntonym = item.antonym1;
            }
            
            // Mark this question as used
            const questionKey = `${item.word}_${attemptCount}`;
            userSession.usedQuestions.add(questionKey);
            
            // Update attempt count for next time (cycle through 1, 2, 3)
            const nextAttempt = attemptCount >= 3 ? 1 : attemptCount + 1;
            userSession.wordAttempts.set(item.word, nextAttempt);
            
            // Generate 3 random distractors from other antonyms
            const distractors = [];
            const otherWords = allWords.filter(w => w.word !== item.word);
            
            while (distractors.length < 3 && otherWords.length > 0) {
                const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
                const randomAntonym = randomWord.antonym1 || randomWord.antonym2 || randomWord.antonym3;
                
                if (randomAntonym && randomAntonym !== correctAntonym && !distractors.includes(randomAntonym)) {
                    distractors.push(randomAntonym);
                }
                
                // Remove to avoid infinite loop
                otherWords.splice(otherWords.indexOf(randomWord), 1);
            }
            
            // Create options array
            const options = [correctAntonym, ...distractors].sort(() => Math.random() - 0.5);
            
            return {
                word: item.word,
                definition: item.definition,
                options,
                prompt: `What is an antonym for "${item.word}"? (${item.definition})`,
                correctAnswer: correctAntonym,
                attemptNumber: attemptCount
            };
        });
        
        // Convert Map to object for client storage
        const wordAttemptsObj = {};
        userSession.wordAttempts.forEach((value, key) => {
            wordAttemptsObj[key] = value;
        });

        res.json({
            questions,
            total: questions.length,
            type: 'antonyms',
            wordAttempts: wordAttemptsObj, // Send back to client for localStorage
            sessionInfo: {
                totalWordsTracked: userSession.wordAttempts.size,
                questionsUsedInSession: userSession.usedQuestions.size
            }
        });
        
    } catch (error) {
        console.error('Antonyms quiz error:', error);
        res.status(500).json({ error: 'Failed to generate antonyms quiz' });
    }
});

// Generate quiz questions - Apply subscription check for premium types
router.get('/generate', checkSubscriptionStatus, async (req, res) => {
    try {
        const { letter = 'A', type = 'ows', page = 1, pageSize = 100, random } = req.query;
        // Quiz generate request
        
        // Check if this is a premium quiz type that requires subscription
        const premiumTypes = ['synonyms', 'antonyms', 'top200synonyms', 'top200antonyms', 'top200ows', 'top200iph'];
        const isPremiumType = premiumTypes.includes(type);
        
        if (isPremiumType && req.subscriptionStatus !== 'active') {
            return res.status(403).json({ 
                success: false, 
                error: 'subscription_required',
                message: 'This quiz type requires an active subscription. Please upgrade to access premium features.',
                premiumFeature: true
            });
        }
        
        let data = [];
        let filePath = '';
        
        if (type === 'wotd') {
            // Handle WOTD quiz - get 20 questions from wotd.json
            filePath = path.join(__dirname, '../data/wotd.json');
            if (fs.existsSync(filePath)) {
                const wotdData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                // Shuffle and take requested number of items
                data = wotdData.sort(() => Math.random() - 0.5).slice(0, parseInt(pageSize));
            }
        } else if (type === 'practice') {
            // Handle practice quiz - this will be handled by frontend localStorage
            // Return empty for now, frontend will handle practice items
            return res.json({
                questions: [],
                total: 0,
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                message: 'Practice quiz handled by frontend'
            });
        } else if (type === 'ows') {
            filePath = path.join(__dirname, '../data/ows.json');
        } else if (type === 'iph') {
            filePath = path.join(__dirname, '../data/iph.json');
        } else if (type === 'synonyms') {
            filePath = path.join(__dirname, '../data/synonyms.json');
        } else if (type === 'antonyms') {
            filePath = path.join(__dirname, '../data/antonyms.json');
        } else if (type === 'top200ows') {
            filePath = path.join(__dirname, '../data/200ows.json');
        } else if (type === 'top200iph') {
            filePath = path.join(__dirname, '../data/200iph.json');
        } else if (type === 'top200synonyms') {
            filePath = path.join(__dirname, '../data/200synonyms.json');
        } else if (type === 'top200antonyms') {
            filePath = path.join(__dirname, '../data/200antonyms.json');
        } else if (type === 'freequiz') {
            filePath = path.join(__dirname, '../data/200ows.json');
        }
        
        if (fs.existsSync(filePath) && type !== 'wotd') {
            const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            // File loaded successfully
            // Handle both array format and object with letter keys
            if (Array.isArray(rawData)) {
                data = rawData;
            } else if (random || type.startsWith('top200')) {
                data = Object.values(rawData).flat();
            } else if (rawData[letter]) {
                data = rawData[letter];
            } else {
                // Flatten all letters if specific letter not found
                data = Object.values(rawData).flat();
            }
        }
        
        // Filter by letter if data is array (skip for WOTD, Top200, or when random selection is requested)
        let filteredData = data;
        if (Array.isArray(data) && type !== 'wotd' && !type.startsWith('top200')) {
            if (random) {
                // Use full dataset for random sampling
                filteredData = data;
            } else {
            filteredData = data.filter(item => {
                let word;
                if (type === 'ows' || type === 'synonyms' || type === 'antonyms') {
                    word = item.word;
                } else {
                    word = item.phrase;
                }
                return word && word.toUpperCase().startsWith(letter.toUpperCase());
            });
            }
        } else if (type.startsWith('top200')) {
            // For Top200 quizzes, use all data and randomize
            filteredData = data;
        } else if (type === 'freequiz') {
            // For free quiz, data is already loaded from 200ows.json above
            filteredData = data;
            // Freequiz filtered data
        }
        
        // For letter quizzes, get ALL words for that letter (no pagination)
        let paginatedData = filteredData;
        if (type !== 'wotd' && type !== 'practice') {
            // ALWAYS shuffle for OWS and IPH quizzes to randomize questions
            if (type === 'ows' || type === 'iph' || type === 'top200ows' || type === 'top200iph' || random || type.startsWith('top200') || type === 'freequiz') {
                const size = type.startsWith('top200') ? Math.min(filteredData.length, 200) : 
                           type === 'freequiz' ? (parseInt(pageSize) || 150) : 
                           (parseInt(pageSize) || 20);
                // Shuffle the data randomly using Fisher-Yates algorithm
                const arr = filteredData.slice();
                for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                paginatedData = arr.slice(0, size);
            } else {
                // For synonyms and antonyms, keep existing behavior
                paginatedData = filteredData;
            }
        } else if (type === 'wotd') {
            // WOTD already limited above
            paginatedData = filteredData;
        }
        
        // Final paginated data
        
        // Generate quiz questions
        const questions = paginatedData.map(item => {
            let correctAnswer, prompt;
            
            if (type === 'wotd') {
                correctAnswer = item.word;
                prompt = item.definition;
            } else {
                if (type === 'ows' || type === 'top200ows' || type === 'freequiz') {
                    correctAnswer = item.word;
                    prompt = item.definition;
                } else if (type === 'synonyms' || type === 'top200synonyms') {
                    // Use synonym1 as default for backward compatibility
                    correctAnswer = item.synonym1 || item.synonym;
                    prompt = `What is a synonym for "${item.word}"? (${item.definition})`;
                } else if (type === 'antonyms' || type === 'top200antonyms') {
                    correctAnswer = item.antonym;
                    prompt = `What is an antonym for "${item.word}"? (${item.definition})`;
                } else if (type === 'iph' || type === 'top200iph') {
                    correctAnswer = item.phrase;
                    prompt = item.meaning;
                } else {
                    correctAnswer = item.phrase;
                    prompt = item.meaning;
                }
            }
            
            // Generate distractors
            let distractors = [];
            if (type === 'wotd') {
                distractors = filteredData
                    .filter(d => d.word !== correctAnswer)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3)
                    .map(d => d.word);
            } else {
                distractors = filteredData
                    .filter(d => {
                        let answer;
                        if (type === 'ows' || type === 'top200ows' || type === 'freequiz') answer = d.word;
                        else if (type === 'synonyms' || type === 'top200synonyms') answer = d.synonym1 || d.synonym;
                        else if (type === 'antonyms' || type === 'top200antonyms') answer = d.antonym1 || d.antonym;
                        else if (type === 'iph' || type === 'top200iph') answer = d.phrase;
                        else answer = d.phrase;
                        return answer !== correctAnswer;
                    })
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3)
                    .map(d => {
                        if (type === 'ows' || type === 'top200ows' || type === 'freequiz') return d.word;
                        else if (type === 'synonyms' || type === 'top200synonyms') return d.synonym1 || d.synonym;
                        else if (type === 'antonyms' || type === 'top200antonyms') return d.antonym1 || d.antonym;
                        else if (type === 'iph' || type === 'top200iph') return d.phrase;
                        else return d.phrase;
                    });
            }
            
            // Create options array
            const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);
            
            return {
                ...item,
                options,
                prompt,
                correctAnswer,
                definition: (type === 'ows' || type === 'wotd' || type === 'synonyms' || type === 'antonyms' || type === 'top200ows' || type === 'top200synonyms' || type === 'top200antonyms' || type === 'freequiz') ? item.definition : undefined,
                meaning: (type === 'iph' || type === 'top200iph') ? item.meaning : undefined,
                synonym: (type === 'synonyms' || type === 'top200synonyms') ? item.synonym : undefined,
                antonym: (type === 'antonyms' || type === 'top200antonyms') ? item.antonym : undefined
            };
        });
        
        // Returning questions
        res.json({
            questions,
            total: filteredData.length,
            page: parseInt(page),
            pageSize: parseInt(pageSize)
        });
        
    } catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
});

// Submit quiz results
router.post('/submit', async (req, res) => {
    try {
        const { letter, type, score, total, answers } = req.body;
        
        // Here you could save quiz results to database if needed
        // Quiz submitted
        
        res.json({ success: true, message: 'Quiz results saved' });
        
    } catch (error) {
        console.error('Quiz submission error:', error);
        res.status(500).json({ error: 'Failed to save quiz results' });
    }
});

module.exports = router;
