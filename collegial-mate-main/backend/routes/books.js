import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// GET /api/books?q=searchTerm
router.get('/', async (req, res) => {
  const q = req.query.q || 'javascript';
  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Google Books API' });
  }
});

export default router;
