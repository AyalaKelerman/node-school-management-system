const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET all roles
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('roles').select('*').order('name');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST create role
router.post('/', async (req, res) => {
  const { name } = req.body;
  const { data, error } = await supabase.from('roles').insert({ name }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// POST bulk roles
router.post('/bulk', async (req, res) => {
  const roles = req.body.filter(r => r.name && r.name.trim() !== '');
  const inserted = [];
  try {
    for (const role of roles) {
      const { data } = await supabase.from('roles').insert({ name: role.name }).select().single();
      inserted.push(data);
    }
    res.status(201).json(inserted);
  } catch (err) {
    console.error('Error bulk inserting roles:', err);
    res.status(500).send('Server error');
  }
});

// PUT update role
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const { data, error } = await supabase.from('roles').update({ name }).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE role
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('roles').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Role deleted' });
});

module.exports = router;
