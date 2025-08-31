const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// שליפת כל המקצועות
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('שגיאה בשליפת מקצועות:', err.message);
    res.status(500).send('שגיאה בשרת');
  }
});

// הוספת מקצוע חדש
router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const { data, error } = await supabase
      .from('subjects')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('שגיאה בהוספת מקצוע:', err.message);
    res.status(500).send('שגיאה בשרת');
  }
});

// הוספת מספר מקצועות בבת אחת
router.post('/bulk', async (req, res) => {
  const subjects = req.body.filter(s => s.name && s.name.trim() !== '');
  try {
    const { data, error } = await supabase
      .from('subjects')
      .insert(subjects)
      .select();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('שגיאה בהוספת מקצועות:', err.message);
    res.status(500).send('שגיאה בשרת');
  }
});

// עדכון מקצוע
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const { data, error } = await supabase
      .from('subjects')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('שגיאה בעדכון מקצוע:', err.message);
    res.status(500).send('שגיאה בשרת');
  }
});

// מחיקת מקצוע
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'מקצוע נמחק' });
  } catch (err) {
    console.error('שגיאה במחיקת מקצוע:', err.message);
    res.status(500).send('שגיאה בשרת');
  }
});

module.exports = router;
