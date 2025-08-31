const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET schedules, עם אפשרות לסינון לפי student_id
router.get('/', async (req, res) => {
  const { student_id } = req.query;
  try {
    let query = supabase.from('schedules').select('*, teacher:teachers(full_name)');
    if (student_id) query = query.eq('student_id', student_id);

    const { data, error } = await query.order('id');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('שגיאה בשליפת מערכת:', err.message);
    res.status(500).send('Server error');
  }
});

// GET schedules לפי class_id
router.get('/by-class/:classId', async (req, res) => {
  const { classId } = req.params;
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select(`
        id AS schedule_id,
        day,
        hour,
        subject,
        student_id,
        teacher_id,
        student:students(full_name, class_id),
        teacher:teachers(full_name)
      `)
      .eq('student.class_id', classId);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('שגיאה בשליפת מערכת שעות:', err.message);
    res.status(500).send('Server error');
  }
});

// GET schedules לפי teacher_id
router.get('/by-teacher/:teacherId', async (req, res) => {
  const { teacherId } = req.params;
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select(`
        id AS schedule_id,
        day,
        hour,
        subject,
        student_id,
        student:students(full_name)
      `)
      .eq('teacher_id', teacherId);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('שגיאה בשליפת מערכת מורה:', err.message);
    res.status(500).send('Server error');
  }
});

// POST create schedule entry
router.post('/', async (req, res) => {
  const { day, hour, student_id, subject, teacher_id } = req.body;
  try {
    const { data, error } = await supabase
      .from('schedules')
      .insert([{ day, hour, student_id, subject, teacher_id }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// PUT update schedule entry
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { day, hour, student_id, subject, teacher_id } = req.body;
  try {
    const { data, error } = await supabase
      .from('schedules')
      .update({ day, hour, student_id, subject, teacher_id })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// DELETE schedule entry
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('schedules').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Schedule entry deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET occupied teachers לפי day/hour
router.get('/occupied-teachers', async (req, res) => {
  const { day, hour } = req.query;
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('teacher_id')
      .eq('day', day)
      .eq('hour', hour);

    if (error) throw error;
    res.json(data.map(r => r.teacher_id));
  } catch (err) {
    console.error('שגיאה בשליפת מורות תפוסות:', err.message);
    res.status(500).send('Server error');
  }
});

// GET occupied students לפי day/hour
router.get('/occupied-students', async (req, res) => {
  const { day, hour } = req.query;
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('student_id')
      .eq('day', day)
      .eq('hour', hour);

    if (error) throw error;
    res.json(data.map(r => r.student_id));
  } catch (err) {
    console.error('שגיאה בשליפת תלמידות תפוסות:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
