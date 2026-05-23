const mongoose = require('mongoose');

const reviewScherma = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    readAt: { type: Date, default: Date.now }
}, { timestamps: true });

// El usuario solo puede reseñar un libro a la vez
reviewScherma.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewScherma);