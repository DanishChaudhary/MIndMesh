const mongoose = require('mongoose');

const VocabSchema = new mongoose.Schema({
    source: { type: String, enum: ['ows', 'iph', 'top200'], required: true },
    letter: { type: String, required: true },
    word: String,
    definition: String,
    pos: String,
    meaning: String,
    example: String,
    raw: mongoose.Schema.Types.Mixed
});
VocabSchema.index({ source: 1, letter: 1 });
module.exports = mongoose.model('Vocab', VocabSchema);
