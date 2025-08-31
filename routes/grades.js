const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET all grades
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('grades').select('*').order('name');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST create grade
router.post('/', async (req, res) => {
  const { name } = req.body;
  const { data, error } = await supabase.from('grades').insert({ name }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// DELETE grade
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('grades').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Grade deleted' });
});

module.exports = router;
