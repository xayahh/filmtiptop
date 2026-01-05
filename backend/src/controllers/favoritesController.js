const fetch = require('node-fetch');
const User = require('../models/User');
const Movie = require('../models/Movie');

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.favorites || user.favorites.length === 0) {
      return res.json([]);
    }
    const existingMovies = await Movie.find({ imdbID: { $in: user.favorites } });
    const existingIds = new Set(existingMovies.map(m => m.imdbID));
    const missingIds = user.favorites.filter(id => !existingIds.has(id));
    const fetchedMovies = await Promise.all(
      missingIds.map(async (imdbID) => {
        try {
          const response = await fetch(`http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${imdbID}&plot=full`);
          const data = await response.json();
          if (data.Response !== 'False') {
            const movie = new Movie(data);
            await movie.save();
            return movie;
          }
          return null;
        } catch {
          return null;
        }
      })
    );
    const allMovies = [...existingMovies, ...fetchedMovies.filter(Boolean)];
    const movieMap = new Map(allMovies.map(m => [m.imdbID, m]));
    const orderedMovies = user.favorites.map(id => movieMap.get(id)).filter(Boolean);
    res.json(orderedMovies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addFavorite = async (req, res) => {
  try {
    const { imdbID } = req.body;
    const user = await User.findById(req.user._id);
    if (user.favorites.includes(imdbID)) {
      return res.status(400).json({ message: 'Already in favorites' });
    }
    user.favorites.push(imdbID);
    await user.save();
    res.json({ message: 'Added to favorites', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { imdbID } = req.params;
    const user = await User.findById(req.user._id);
    user.favorites = user.favorites.filter(id => id !== imdbID);
    await user.save();
    res.json({ message: 'Removed from favorites', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkFavorite = async (req, res) => {
  try {
    const { imdbID } = req.params;
    const user = await User.findById(req.user._id);
    const isFavorite = user.favorites.includes(imdbID);
    res.json({ isFavorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite, checkFavorite };
