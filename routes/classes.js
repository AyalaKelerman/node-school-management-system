const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all classes
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM classes ORDER BY id');
  res.json(result.rows);
});

// POST create class
router.post('/', async (req, res) => {
  const { name, gradeName, teacherName } = req.body;

  try {
    // חיפוש האם המחזור כבר קיים
    let grade = await pool.query('SELECT * FROM grades WHERE name = $1', [gradeName]);

    let gradeId;
    if (grade.rowCount === 0) {
      // אם לא קיים - מוסיפים מחזור חדש
      const inserted = await pool.query(
        'INSERT INTO grades (name) VALUES ($1) RETURNING id',
        [gradeName]
      );
      gradeId = inserted.rows[0].id;
    } else {
      gradeId = grade.rows[0].id;
    }

    // הוספת הכיתה עם grade_id ו־teacher_name
    const newClass = await pool.query(
      'INSERT INTO classes (name, grade_id, teacher_name) VALUES ($1, $2, $3) RETURNING *',
      [name, gradeId, teacherName]
    );

    res.status(201).json(newClass.rows[0]);
  } catch (err) {
    console.error('שגיאה בהוספת כיתה:', err);
    res.status(500).send('שגיאה בשרת');
  }
});

// POST - הוספת כיתות מרובות
router.post('/bulk', async (req, res) => {
  const classes = req.body;

  try {
    const insertedClasses = [];

    for (const cls of classes) {
      const { name, gradeName, teacherName } = cls;

      // בדיקה אם המחזור קיים
      let grade = await pool.query('SELECT * FROM grades WHERE name = $1', [gradeName]);
      let gradeId;

      if (grade.rowCount === 0) {
        const newGrade = await pool.query(
          'INSERT INTO grades (name) VALUES ($1) RETURNING id',
          [gradeName]
        );
        gradeId = newGrade.rows[0].id;
      } else {
        gradeId = grade.rows[0].id;
      }

      const newClass = await pool.query(
        'INSERT INTO classes (name, grade_id, teacher_name) VALUES ($1, $2, $3) RETURNING *',
        [name, gradeId, teacherName]
      );

      insertedClasses.push(newClass.rows[0]);
    }

    res.status(201).json(insertedClasses);
  } catch (err) {
    console.error('שגיאה בהוספת כיתות מרובות:', err);
    res.status(500).send('שגיאה בשרת');
  }
});

// PUT update class
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const result = await pool.query('UPDATE classes SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
  res.json(result.rows[0]);
});

// DELETE class
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM classes WHERE id = $1', [id]);
  res.json({ message: 'Class deleted' });
});

module.exports = router;
