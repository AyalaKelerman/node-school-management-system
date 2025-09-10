const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET all students עם שם כיתה
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*, class:classes(name)')
      .order('id');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching students:', err.message);
    res.status(500).send('Server error');
  }
});

// GET students by teacher ID
router.get('/by-teacher/:teacherId', async (req, res) => {
  const { teacherId } = req.params;

  try {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        class:classes(name),
        schedules!inner(teacher_id)
      `)
      .eq('schedules.teacher_id', teacherId)
      .order('full_name');

    if (error) throw error;

    // להתאים את הפלט לשדה class_name כמו שהיה קודם
    const formatted = data.map(st => ({
      ...st,
      class_name: st.class ? st.class.name : null
    }));

    res.json(formatted);
  } catch (err) {
    console.error('שגיאה בשליפת תלמידות לפי מורה:', err.message);
    res.status(500).send('שגיאה בשרת');
  }
});


// GET students by class ID (קודם - כדי לא ליפול על /:id)
router.get('/by-class/:classId', async (req, res) => {
  const { classId } = req.params;
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('class_id', classId)
    .order('full_name');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET student by ID (אחרי by-class)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).send('Student not found');
  res.json(data);
});

// POST create new student
router.post('/', async (req, res) => {
  const student = req.body;

  try {
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating student:', err.message);
    res.status(500).send('Server error');
  }
});

// POST bulk students
router.post('/bulk', async (req, res) => {
  const students = req.body.filter(s => s.full_name && s.class_id);
  try {
    const inserted = [];
    for (const s of students) {
      const { data, error } = await supabase.from('students').insert([s]).select().single();
      if (error) throw error;
      inserted.push(data);
    }
    res.status(201).json(inserted);
  } catch (err) {
    console.error('Error bulk inserting students:', err);
    res.status(500).send('Server error');
  }
});

// PUT update student
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const student = req.body;

  try {
    const { data, error } = await supabase
      .from('students')
      .update(student)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).send('Student not found');
    res.json(data);
  } catch (err) {
    console.error('Error updating student:', err.message);
    res.status(500).send('Server error');
  }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from('students').delete().eq('id', id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).send('Student not found');
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Error deleting student:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
