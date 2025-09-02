const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// פונקציה פנימית לוודא שהמחזור קיים או ליצור אותו
async function ensureGrade(gradeName) {
  if (!gradeName) throw new Error('gradeName is required');

  const { data: gradeData, error: gradeSelectError } = await supabase
    .from('grades')
    .select('*')
    .eq('name', gradeName)
    .single();

  if (gradeSelectError && gradeSelectError.code !== 'PGRST116') {
    throw gradeSelectError;
  }

  if (!gradeData) {
    const { data: newGrade, error: gradeInsertError } = await supabase
      .from('grades')
      .insert({ name: gradeName })
      .select()
      .single();

    if (gradeInsertError || !newGrade) {
      throw new Error(`Failed to create grade: ${gradeName}`);
    }
    return newGrade.id;
  }

  return gradeData.id;
}

// GET all classes
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('classes').select('*').order('id');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching classes:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST create single class
router.post('/', async (req, res) => {
  const { name, gradeName, teacherName } = req.body;
  try {
    if (!name || !gradeName) {
      return res.status(400).json({ error: 'Missing required fields: name, gradeName' });
    }

    const gradeId = await ensureGrade(gradeName);

    const { data: newClass, error: classError } = await supabase
      .from('classes')
      .insert({ name, grade_id: gradeId, teacher_name: teacherName })
      .select()
      .single();

    if (classError || !newClass) throw new Error('Failed to create class');

    res.status(201).json(newClass);
  } catch (err) {
    console.error('Error creating class:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST bulk classes
router.post('/bulk', async (req, res) => {
  const classes = req.body;
  const insertedClasses = [];

  try {
    for (const cls of classes) {
      const { name, gradeName, teacherName } = cls;
      if (!name || !gradeName) throw new Error('Missing required fields in bulk insert');

      const gradeId = await ensureGrade(gradeName);

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
    console.error('Error bulk creating classes:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT update class
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, teacherName } = req.body;

  try {
    if (!name && !teacherName) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (teacherName) updateFields.teacher_name = teacherName;

    const { data, error } = await supabase
      .from('classes')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw error || new Error('Class not found');

    res.json(data);
  } catch (err) {
    console.error('Error updating class:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE class
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Class deleted' });
  } catch (err) {
    console.error('Error deleting class:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
