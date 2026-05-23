const express = require("express");
const Review = require("../models/Review");
const Book = require("../models/Book");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// Crear reseña (requiere auth)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { bookId, rating, comment, readAt } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Libro no encontrado" });

    const review = await Review.create({
      user: req.user.id,
      book: bookId,
      rating,
      comment,
      readAt: readAt || Date.now(),
    });

    await review.populate("book");
    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: "Ya reseñaste este libro" });
    res.status(500).json({ message: err.message });
  }
});

// Obtener todas las reseñas del usuario logueado
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate("book")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtener reseñas de un libro específico
router.get("/book/:bookId", async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId })
      .populate("user", "username")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Eliminar reseña propia
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!review)
      return res.status(404).json({ message: "Reseña no encontrada" });
    await review.deleteOne();
    res.json({ message: "Reseña eliminada" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
