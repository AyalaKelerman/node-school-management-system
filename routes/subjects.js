const express = require('express');
const router = express.Router();
const pool = require('../db');

// שליפת כל המקצועות
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM subjects ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('שגיאה בשליפת מקצועות:', err);
    res.status(500).send('שגיאה בשרת');
  }
});

// הוספת מקצוע חדש
router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO subjects (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('שגיאה בהוספת מקצוע:', err);
    res.status(500).send('שגיאה בשרת');
  }
});

router.post('/bulk', async (req, res) => {
  const subjects = req.body.filter(s => s.name && s.name.trim() !== '');

  try {
    const inserted = [];
    for (const subject of subjects) {
      const result = await pool.query(
        'INSERT INTO subjects (name) VALUES ($1) RETURNING *',
        [subject.name]
      );
      inserted.push(result.rows[0]);
    }

    res.status(201).json(inserted);
  } catch (err) {
    console.error('שגיאה בהוספת מקצועות:', err);
    res.status(500).send('שגיאה בשרת');
  }
});

// עדכון מקצוע
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query(
      'UPDATE subjects SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('שגיאה בעדכון מקצוע:', err);
    res.status(500).send('שגיאה בשרת');
  }
});

// מחיקת מקצוע
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM subjects WHERE id = $1', [id]);
    res.json({ message: 'מקצוע נמחק' });
  } catch (err) {
    console.error('שגיאה במחיקת מקצוע:', err);
    res.status(500).send('שגיאה בשרת');
  }
});

module.exports = router;
