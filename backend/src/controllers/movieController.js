const fetch = require('node-fetch');
const Movie = require('../models/Movie');

const fetchTrailerFromTMDB = async (imdbID) => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.log('TMDB_API_KEY not configured');
    return null;
  }
  try {
    const findResponse = await fetch(
      `https://api.themoviedb.org/3/find/${imdbID}?api_key=${apiKey}&external_source=imdb_id`
    );
    const findData = await findResponse.json();
    const movie = findData.movie_results?.[0];
    if (!movie) return null;
    const videosResponse = await fetch(
      `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${apiKey}`
    );
    const videosData = await videosResponse.json();
    const trailer = videosData.results?.find(
      (v) => v.type === 'Trailer' && v.site === 'YouTube'
    );
    if (trailer) {
      return `https://www.youtube.com/embed/${trailer.key}`;
    }
    return null;
  } catch {
    return null;
  }
};

const searchMovies = async (req, res) => {
  try {
    const { s, y, type, page = 1 } = req.query;
    if (!s) {
      return res.status(400).json({ message: 'Search query required' });
    }
    let url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${encodeURIComponent(s)}&page=${page}`;
    if (y) url += `&y=${y}`;
    if (type) url += `&type=${type}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.Response === 'False') {
      return res.json({ Search: [], totalResults: '0' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMovie = async (req, res) => {
  try {
    const { imdbID } = req.params;
    let movie = await Movie.findOne({ imdbID });
    if (movie) {
      if (!movie.TrailerURL) {
        const trailerURL = await fetchTrailerFromTMDB(imdbID);
        if (trailerURL) {
          movie.TrailerURL = trailerURL;
          await movie.save();
        }
      }
      return res.json(movie);
    }
    const response = await fetch(`http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${imdbID}&plot=full`);
    const data = await response.json();
    if (data.Response === 'False') {
      return res.status(404).json({ message: 'Movie not found' });
    }
    const trailerURL = await fetchTrailerFromTMDB(imdbID);
    movie = new Movie({ ...data, TrailerURL: trailerURL });
    await movie.save();
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMovie = async (req, res) => {
  try {
    const movieData = req.body;
    const existing = await Movie.findOne({ imdbID: movieData.imdbID });
    if (existing) {
      return res.status(400).json({ message: 'Movie already exists' });
    }
    const movie = new Movie(movieData);
    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTrailer = async (req, res) => {
  try {
    const { imdbID } = req.params;
    const { trailerURL } = req.body;
    const movie = await Movie.findOneAndUpdate(
      { imdbID },
      { TrailerURL: trailerURL },
      { new: true }
    );
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { searchMovies, getMovie, addMovie, updateTrailer };
