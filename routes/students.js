

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all students
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT st.*, c.name AS class_name
      FROM students st
      LEFT JOIN classes c ON st.class_id = c.id
      ORDER BY st.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('שגיאה בשליפת כל התלמידות:', err.message);
    res.status(500).send('Server error');
  }
});

// GET student by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).send('Student not found');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('שגיאה בשליפת תלמידה לפי ID:', err.message);
    res.status(500).send('Server error');
  }
});

// GET students by teacher ID
router.get('/by-teacher/:teacherId', async (req, res) => {
  const { teacherId } = req.params;
  try {
    const result = await pool.query(`
      SELECT DISTINCT st.*, c.name AS class_name
      FROM students st
      JOIN schedules sch ON st.id = sch.student_id
      LEFT JOIN classes c ON st.class_id = c.id
      WHERE sch.teacher_id = $1
      ORDER BY st.full_name
    `, [teacherId]);
    res.json(result.rows);
  } catch (err) {
    console.error('שגיאה בשליפת תלמידות לפי מורה:', err);
    res.status(500).send('שגיאה בשרת');
  }
});

// GET students by class ID
router.get('/by-class/:classId', async (req, res) => {
  const { classId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM students WHERE class_id = $1 ORDER BY full_name',
      [classId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('שגיאה בשליפת תלמידות לפי כיתה:', err.message);
    res.status(500).send('Server error');
  }
});

// POST create new student
router.post('/', async (req, res) => {
  const {
    full_name, class_id, difficulties, remarks, adjustments,
    characterization, start_year, coordinator,
    has_valid_document, entitled_hours, available_hours
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO students (
        full_name, class_id, difficulties, remarks, adjustments,
        characterization, start_year, coordinator,
        has_valid_document, entitled_hours, available_hours
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        full_name, class_id, difficulties, remarks, adjustments,
        characterization, start_year, coordinator,
        has_valid_document, entitled_hours, available_hours
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('שגיאה ביצירת תלמידה:', err.message);
    res.status(500).send('Server error');
  }
});

// POST bulk students
router.post('/bulk', async (req, res) => {
  const students = req.body.filter(s => s.full_name && s.class_id);
  try {
    const inserted = [];
    for (const s of students) {
      const result = await pool.query(
        `INSERT INTO students (
          full_name, class_id, difficulties, remarks, adjustments,
          characterization, start_year, coordinator,
          has_valid_document, entitled_hours, available_hours
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [
          s.full_name, s.class_id, s.difficulties || [], s.remarks || '', s.adjustments || '',
          s.characterization || '', s.start_year || null, s.coordinator || '',
          s.has_valid_document || false, s.entitled_hours || 0, s.available_hours || 0
        ]
      );
      inserted.push(result.rows[0]);
    }
    res.status(201).json(inserted);
  } catch (err) {
    console.error('שגיאה בשמירת תלמידות:', err);
    res.status(500).send('שגיאה בשרת');
  }
});

// PUT update student
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    full_name, class_id, difficulties, remarks, adjustments,
    characterization, start_year, coordinator,
    has_valid_document, entitled_hours, available_hours
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE students SET
        full_name = $1, class_id = $2, difficulties = $3, remarks = $4,
        adjustments = $5, characterization = $6, start_year = $7,
        coordinator = $8, has_valid_document = $9,
        entitled_hours = $10, available_hours = $11
      WHERE id = $12 RETURNING *`,
      [
        full_name, class_id, difficulties, remarks, adjustments,
        characterization, start_year, coordinator,
        has_valid_document, entitled_hours, available_hours, id
      ]
    );
    if (result.rows.length === 0) return res.status(404).send('Student not found');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('שגיאה בעדכון תלמידה:', err.message);
    res.status(500).send('Server error');
  }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).send('Student not found');
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('שגיאה במחיקת תלמידה:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
