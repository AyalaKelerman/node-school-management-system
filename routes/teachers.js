const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET all teachers
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('id');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('שגיאה בשליפת מורות:', err.message);
    res.status(500).send('שגיאה בשרת');
  }
});

// GET summary of teachers
router.get('/summary', async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('teachers_summary');
    // כאן אפשר ליצור פונקציה ב־PostgreSQL בשם teachers_summary שמחזירה את הסיכומים
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('שגיאה בשליפת סיכום מורות:', err.message);
    res.status(500).send('שגיאה בשרת');
  }
});

// POST create teacher
router.post('/', async (req, res) => {
  const { full_name, birth_date, position, teaching_hours, subjects } = req.body;
  try {
    const { data, error } = await supabase
      .from('teachers')
      .insert([{ full_name, birth_date, position, teaching_hours, subjects }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('שגיאה ביצירת מורה:', err.message);
    res.status(500).send('שגיאה בשרת');
  }
});

// POST bulk create teachers
router.post('/bulk', async (req, res) => {
  const teachers = req.body.filter(t => t.full_name && t.birth_date && t.position && t.teaching_hours);

  try {
    const { data, error } = await supabase
      .from('teachers')
      .insert(teachers)
      .select();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('שגיאה בשמירת מורות:', err.message);
    res.status(500).send('שגיאה בשמירת מורות');
  }
});

// PUT update teacher
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, birth_date, position, teaching_hours, subjects } = req.body;

  try {
    const { data, error } = await supabase
      .from('teachers')
      .update({ full_name, birth_date, position, teaching_hours, subjects })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('שגיאה בעדכון מורה:', err.message);
    res.status(500).send('שגיאה בשרת');
  }
});

// DELETE teacher
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Teacher deleted' });
  } catch (err) {
    console.error('שגיאה במחיקת מורה:', err.message);
    res.status(500).send('שגיאה בשרת');
  }
});

module.exports = router;
