const express = require('express');
const router = express.Router();
const { getFavorites, addFavorite, removeFavorite, checkFavorite } = require('../controllers/favoritesController');
const { auth } = require('../middleware/auth');

router.get('/', auth, getFavorites);
router.post('/', auth, addFavorite);
router.delete('/:imdbID', auth, removeFavorite);
router.get('/check/:imdbID', auth, checkFavorite);

module.exports = router;
