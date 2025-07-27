const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET schedules, אם יש student_id מסנן לפיו, אחרת מחזיר את הכל
router.get('/', async (req, res) => {
  const { student_id } = req.query;

  let query = `
    SELECT schedules.*, teachers.full_name as teacher_name
    FROM schedules
    LEFT JOIN teachers ON schedules.teacher_id = teachers.id
  `;
  const params = [];

  if (student_id) {
    query += ' WHERE student_id = $1';
    params.push(student_id);
  }

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('שגיאה בשליפת מערכת:', err.message);
    res.status(500).send('Server error');
  }
});


// שליפת כל תלמידות שיש להן שעת שילוב, לפי class_id
router.get('/by-class/:classId', async (req, res) => {
  const { classId } = req.params;

  try {
    const result = await pool.query(`
      SELECT s.day, s.hour, st.full_name AS student_name, s.subject
      FROM schedules s
      JOIN students st ON s.student_id = st.id
      WHERE st.class_id = $1
    `, [classId]);

    res.json(result.rows);
  } catch (err) {
    console.error('שגיאה בשליפת מערכת שעות:', err);
    res.status(500).send('שגיאה בשרת');
  }
});

// שליפת מערכת שעות לפי teacher_id (עם נושא ושם תלמידה)
router.get('/by-teacher/:teacherId', async (req, res) => {
  const { teacherId } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
         s.day, s.hour, s.subject, st.full_name AS student_name
       FROM schedules s
       JOIN students st ON s.student_id = st.id
       WHERE s.teacher_id = $1`,
      [teacherId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('שגיאה בשליפת מערכת מורה:', err);
    res.status(500).send('שגיאה בשרת');
  }
});


// POST create schedule entry
router.post('/', async (req, res) => {
  const { day, hour, student_id, subject, teacher_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO schedules (day, hour, student_id, subject, teacher_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [day, hour, student_id, subject, teacher_id]
    );
    res.status(201).json(result.rows[0]);
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
    const result = await pool.query(
      `UPDATE schedules
       SET day=$1, hour=$2, student_id=$3, subject=$4, teacher_id=$5
       WHERE id=$6 RETURNING *`,
      [day, hour, student_id, subject, teacher_id, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// DELETE schedule entry
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM schedules WHERE id = $1', [id]);
    res.json({ message: 'Schedule entry deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
