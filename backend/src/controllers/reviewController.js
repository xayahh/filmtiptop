const Review = require('../models/Review');

const getMovieReviews = async (req, res) => {
  try {
    const { imdbID } = req.params;
    const reviews = await Review.find({ imdbID })
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addReview = async (req, res) => {
  try {
    const { imdbID, rating, comment } = req.body;
    const existingReview = await Review.findOne({ user: req.user._id, imdbID });
    if (existingReview) {
      return res.status(400).json({ message: 'You already reviewed this movie' });
    }
    const review = new Review({
      user: req.user._id,
      imdbID,
      rating,
      comment
    });
    await review.save();
    await review.populate('user', 'username');
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Review.findByIdAndDelete(id);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMovieReviews, addReview, deleteReview, getUserReviews };
