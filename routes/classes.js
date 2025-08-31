const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET all classes
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('classes').select('*').order('id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST create class
router.post('/', async (req, res) => {
  const { name, gradeName, teacherName } = req.body;
  try {
    // בדיקה אם המחזור קיים
    const { data: gradeData, error: gradeSelectError } = await supabase
      .from('grades')
      .select('*')
      .eq('name', gradeName)
      .single();

    if (gradeSelectError && gradeSelectError.code !== 'PGRST116') { // 'PGRST116' = no rows
      throw gradeSelectError;
    }

    let gradeId;
    if (!gradeData) {
      // יצירת מחזור חדש אם לא קיים
      const { data: newGrade, error: gradeInsertError } = await supabase
        .from('grades')
        .insert({ name: gradeName })
        .select()
        .single();

      if (gradeInsertError || !newGrade) throw new Error('Failed to create grade');

      gradeId = newGrade.id;
    } else {
      gradeId = gradeData.id;
    }

    // יצירת כיתה
    const { data: newClass, error: classError } = await supabase
      .from('classes')
      .insert({ name, grade_id: gradeId, teacher_name: teacherName })
      .select()
      .single();

    if (classError || !newClass) throw new Error('Failed to create class');

    res.status(201).json(newClass);
  } catch (err) {
    console.error('Error creating class:', err);
    res.status(500).send('Server error');
  }
});

// POST bulk classes
router.post('/bulk', async (req, res) => {
  const classes = req.body;
  const insertedClasses = [];

  try {
    for (const cls of classes) {
      const { name, gradeName, teacherName } = cls;

      const { data: gradeData, error: gradeSelectError } = await supabase
        .from('grades')
        .select('*')
        .eq('name', gradeName)
        .single();

      if (gradeSelectError && gradeSelectError.code !== 'PGRST116') {
        throw gradeSelectError;
      }

      let gradeId;
      if (!gradeData) {
        const { data: newGrade, error: gradeInsertError } = await supabase
          .from('grades')
          .insert({ name: gradeName })
          .select()
          .single();

        if (gradeInsertError || !newGrade) throw new Error(`Failed to create grade: ${gradeName}`);

        gradeId = newGrade.id;
      } else {
        gradeId = gradeData.id;
      }

      const { data: newClass, error: classError } = await supabase
        .from('classes')
        .insert({ name, grade_id: gradeId, teacher_name: teacherName })
        .select()
        .single();

      if (classError || !newClass) throw new Error(`Failed to create class: ${name}`);

      insertedClasses.push(newClass);
    }

    res.status(201).json(insertedClasses);
  } catch (err) {
    console.error('Error bulk creating classes:', err);
    res.status(500).send('Server error');
  }
});

// PUT update class
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const { data, error } = await supabase.from('classes').update({ name }).eq('id', id).select().single();
  if (error || !data) return res.status(500).json({ error: error?.message || 'Failed to update class' });
  res.json(data);
});

// DELETE class
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('classes').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Class deleted' });
});

module.exports = router;
