const express = require('express');
const router = express.Router();
const { searchMovies, getMovie, addMovie, updateTrailer } = require('../controllers/movieController');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/search', searchMovies);
router.get('/:imdbID', getMovie);
router.post('/', auth, adminOnly, addMovie);
router.put('/:imdbID/trailer', auth, adminOnly, updateTrailer);

module.exports = router;
