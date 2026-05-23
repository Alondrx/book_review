const express = require("express");
const axios = require("axios");
const Book = require("../models/Book");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// Buscar libros en Google Books (no requiere auth)
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Parámetro q requerido" });

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=12`;
    const { data } = await axios.get(url);

    const books = (data.items || []).map((item) => ({
      googleBooksId: item.id,
      title: item.volumeInfo.title || "Sin título",
      authors: item.volumeInfo.authors || [],
      description: item.volumeInfo.description || "",
      thumbnail: item.volumeInfo.imageLinks?.thumbnail || null,
      publishedDate: item.volumeInfo.publishedDate || "",
      categories: item.volumeInfo.categories || [],
    }));

    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Guardar un libro en MongoDB, se llama cuando el usuario va a reseñarlo
router.post("/save", authMiddleware, async (req, res) => {
  try {
    const {
      googleBooksId,
      title,
      authors,
      description,
      thumbnail,
      publishedDate,
      categories,
    } = req.body;

    // Si ya existe lo devuelve, si no lo crea
    const book = await Book.findOneAndUpdate(
      { googleBooksId },
      {
        googleBooksId,
        title,
        authors,
        description,
        thumbnail,
        publishedDate,
        categories,
      },
      { upsert: true, new: true },
    );

    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtener un libro por su ID de MongoDB
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Libro no encontrado" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
