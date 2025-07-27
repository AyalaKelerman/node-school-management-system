const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all grades
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM grades ORDER BY name');
  res.json(result.rows);
});

// POST create grade
router.post('/', async (req, res) => {
  const { name } = req.body;
  const result = await pool.query('INSERT INTO grades (name) VALUES ($1) RETURNING *', [name]);
  res.status(201).json(result.rows[0]);
});

// DELETE grade
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM grades WHERE id = $1', [req.params.id]);
  res.json({ message: 'Grade deleted' });
});

module.exports = router;
