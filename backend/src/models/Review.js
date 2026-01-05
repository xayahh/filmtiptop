const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imdbID: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

reviewSchema.index({ user: 1, imdbID: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
