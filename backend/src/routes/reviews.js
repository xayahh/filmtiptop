const express = require('express');
const router = express.Router();
const { getMovieReviews, addReview, deleteReview, getUserReviews } = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

router.get('/movie/:imdbID', getMovieReviews);
router.post('/', auth, addReview);
router.delete('/:id', auth, deleteReview);
router.get('/user', auth, getUserReviews);

module.exports = router;
