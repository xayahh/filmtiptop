const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  imdbID: {
    type: String,
    required: true,
    unique: true
  },
  Title: {
    type: String,
    required: true
  },
  Year: String,
  Rated: String,
  Released: String,
  Runtime: String,
  Genre: String,
  Director: String,
  Writer: String,
  Actors: String,
  Plot: String,
  Language: String,
  Country: String,
  Awards: String,
  Poster: String,
  Ratings: [{
    Source: String,
    Value: String
  }],
  Metascore: String,
  imdbRating: String,
  imdbVotes: String,
  Type: String,
  DVD: String,
  BoxOffice: String,
  Production: String,
  Website: String,
  TrailerURL: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);
