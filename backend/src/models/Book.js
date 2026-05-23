const mongoose = require('mongoose');

// Cache local de los libros de la API de Google Books
const bookSchema = new mongoose.Schema({
    googleBooksId: { type: String, required: true },
    title: { type: String, required: true },
    authors: [String],
    description: String,
    thumbnail: String,
    publishedDate: String,
    categories: [String]
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);