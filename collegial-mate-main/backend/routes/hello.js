import express from 'express';

const router = express.Router();

// GET /api/hello
router.get('/', (req, res) => {
  res.json({ message: 'Hello from the backend API!' });
});

export default router;
