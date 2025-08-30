require('dotenv').config({ path: '../.env' });
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const axios = require('axios');

const authRoutes = require('./routes/auth');
const vocabRoutes = require('./routes/vocab');
const paymentRoutes = require('./routes/payment');
const userRoutes = require('./routes/user');
const quizRoutes = require('./routes/quiz');
const webhookRoutes = require('./routes/webhook');

const app = express();
const PORT = process.env.PORT || 5000;


const url = 'https://www.brainmesh.in';
const interval = 120000;

function reloadWebsite(){
    axios 
    .get(url)
    .then(res => { console.log('Website reloaded successfully'); })
    .catch(err => { console.log('Website reload failed'); });
}

setInterval(reloadWebsite, interval);


// Connect Mongo
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blackbook-vocab', {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 5
}).then(() => console.log('Server: MongoDB connected')).catch(err => {
    console.error('Server: MongoDB error', err);
    process.exit(1);
});

// Disable mongoose buffering
mongoose.set('bufferCommands', false);

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ 
    origin: process.env.CLIENT_ORIGIN || 'https://www.brainmesh.in', 
    credentials: true,
    optionsSuccessStatus: 200
}));
app.set('trust proxy', 1);
app.use(rateLimit({ 
    windowMs: 60 * 1000, 
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/health';
    }
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/vocab', vocabRoutes);
app.use('/api/pay', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/webhook', webhookRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV 
    });
});

// Serve built client when available
const distDir = path.join(__dirname, '..', 'client', 'dist');
const distIndex = path.join(distDir, 'index.html');
if (fs.existsSync(distIndex)) {
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
        // Skip API routes
        if (req.path.startsWith('/api/')) {
            return res.status(404).json({ error: 'API endpoint not found' });
        }
        res.sendFile(distIndex);
    });
} else {
    app.get('*', (req, res) => {
        res.status(200).send('Client build not found. Run "npm run build" first, then restart the server.');
    });
}

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({ error: err.message || 'internal_error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));