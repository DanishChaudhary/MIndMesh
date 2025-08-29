const express = require('express');
const router = express.Router();
const vocabController = require('../controllers/vocab');

router.get('/', vocabController.list);
router.get('/wotd', vocabController.wotd);
router.get('/overview', vocabController.overview);
router.get('/ows/:letter', vocabController.owsByLetter);
router.get('/iph/:letter', vocabController.iphByLetter);
router.get('/synonyms/:letter', vocabController.synonymsByLetter);
router.get('/antonyms/:letter', vocabController.antonymsByLetter);
router.get('/top200-ows/:letter', vocabController.top200OwsByLetter);
router.get('/top200-iph/:letter', vocabController.top200IphByLetter);
router.get('/top200-synonyms/:letter', vocabController.top200SynonymsByLetter);
router.get('/top200-antonyms/:letter', vocabController.top200AntonymsByLetter);
router.get('/:id', vocabController.detail);

module.exports = router;
