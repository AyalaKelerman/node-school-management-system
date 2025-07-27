const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all teachers
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM teachers ORDER BY id');
  res.json(result.rows);
});

// routes/teachers.js
router.get('/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id,
        t.full_name,
        t.position,
        t.teaching_hours,
        t.subjects,
        COUNT(DISTINCT s.id) AS total_students,
        COUNT(DISTINCT CASE WHEN 'ריכוז' = ANY(s.difficulties) THEN s.id END) AS ricuz,
        COUNT(DISTINCT CASE WHEN 'סיוע' = ANY(s.difficulties) THEN s.id END) AS siyua
      FROM teachers t
      LEFT JOIN schedules sch ON t.id = sch.teacher_id
      LEFT JOIN students s ON sch.student_id = s.id
      GROUP BY t.id
      ORDER BY t.full_name;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('שגיאה בשליפת סיכום מורות:', err);
    res.status(500).send('שגיאה בשרת');
  }
});

// POST create teacher
router.post('/', async (req, res) => {
  const { full_name, birth_date, position, teaching_hours, subjects } = req.body;
  const result = await pool.query(
    `INSERT INTO teachers (full_name, birth_date, position, teaching_hours, subjects)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [full_name, birth_date, position, teaching_hours, subjects]
  );
  res.status(201).json(result.rows[0]);
});

router.post('/bulk', async (req, res) => {
  const teachers = req.body.filter(t => t.full_name && t.birth_date && t.position_id && t.teaching_hours);

  try {
    const inserted = [];

    for (const t of teachers) {
      const result = await pool.query(
        `INSERT INTO teachers (full_name, birth_date, position, teaching_hours, subjects)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [
          t.full_name,
          t.birth_date,
          t.position_id,
          t.teaching_hours,
          t.subjects // assuming it's an array of subject IDs and the column is of type int[]
        ]
      );
      inserted.push(result.rows[0]);
    }

    res.status(201).json(inserted);
  } catch (err) {
    console.error('שגיאה בשמירת מורות:', err);
    res.status(500).send('שגיאה בשמירת מורות');
  }
});

// PUT update teacher
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, birth_date, position, teaching_hours, subjects } = req.body;
  const result = await pool.query(
    `UPDATE teachers SET full_name=$1, birth_date=$2, position=$3,
     teaching_hours=$4, subjects=$5 WHERE id=$6 RETURNING *`,
    [full_name, birth_date, position, teaching_hours, subjects, id]
  );
  res.json(result.rows[0]);
});

// DELETE teacher
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM teachers WHERE id = $1', [id]);
  res.json({ message: 'Teacher deleted' });
});

module.exports = router;
