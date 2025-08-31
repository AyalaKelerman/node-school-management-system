const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET all treatments
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .order('id');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('שגיאה בשליפת טיפולים:', err.message);
    res.status(500).send('שגיאה בשרת');
  }
});

// POST create treatment
router.post('/', async (req, res) => {
  const { student_id, teacher_id, subject, hours, group_type } = req.body;
  try {
    const { data, error } = await supabase
      .from('treatments')
      .insert([{ student_id, teacher_id, subject, hours, group_type }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('שגיאה ביצירת טיפול:', err.message);
    res.status(500).send('שגיאה בשרת');
  }
});

// PUT update treatment
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { student_id, teacher_id, subject, hours, group_type } = req.body;
  try {
    const { data, error } = await supabase
      .from('treatments')
      .update({ student_id, teacher_id, subject, hours, group_type })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('שגיאה בעדכון טיפול:', err.message);
    res.status(500).send('שגיאה בשרת');
  }
});

// DELETE treatment
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('treatments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Treatment deleted' });
  } catch (err) {
    console.error('שגיאה במחיקת טיפול:', err.message);
    res.status(500).send('שגיאה בשרת');
  }
});

module.exports = router;
