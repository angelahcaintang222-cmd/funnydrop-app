const express = require('express');
const router = express.Router();
const { getJokes, getJoke, addJoke, editJoke, removeJoke, likeAJoke } = require('../controllers/jokeController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/', getJokes);
router.get('/:id', getJoke);
router.post('/', authenticate, addJoke);
router.put('/:id', authenticate, editJoke);
router.delete('/:id', authenticate, removeJoke);
router.patch('/:id/like', authenticate, likeAJoke);

module.exports = router;