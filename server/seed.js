require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Vocab = require('./models/Vocab');

const MONGODB_URI = process.env.MONGODB_URI;

async function connect() {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
}

async function seed() {
    try {
        await connect();
        // console.log('Seeding vocab...');
        const dataDir = path.join(__dirname, '..', 'data');
        const files = ['ows.json', 'iph.json', 'top200.json'];
        for (const file of files) {
            const raw = fs.readFileSync(path.join(__dirname, '..', 'data', file), 'utf8');
            const json = JSON.parse(raw);
            const source = file === 'ows.json' ? 'ows' : (file === 'iph.json' ? 'iph' : 'top200');
            for (const letter of Object.keys(json)) {
                const arr = json[letter] || [];
                for (const item of arr) {
                    const doc = {
                        source,
                        letter,
                        raw: item
                    };
                    // normalize fields
                    if (item.word) doc.word = item.word;
                    if (item.definition) doc.definition = item.definition;
                    if (item.meaning) doc.meaning = item.meaning;
                    if (item.pos) doc.pos = item.pos;
                    if (item.example) doc.example = item.example;
                    await Vocab.updateOne({ source, letter, raw: item }, { $set: doc }, { upsert: true });
                }
            }
        }
        // console.log('Seeding complete');
        process.exit(0);
    } catch (err) {
        console.error('Seed error', err);
        process.exit(1);
    }
}

seed();
