const express = require('express');
const router = express.Router();
const pool = require('../db');

// שליפת כל התפקידים
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('שגיאה בשליפת תפקידים:', err);
    res.status(500).send('שגיאה בשרת');
  }
});

// הוספת תפקיד חדש
router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO roles (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('שגיאה בהוספת תפקיד:', err);
    res.status(500).send('שגיאה בשרת');
  }
});

// הוספת תפקידים מרובים
router.post('/bulk', async (req, res) => {
  const roles = req.body.filter(r => r.name && r.name.trim() !== '');

  try {
    const inserted = [];
    for (const role of roles) {
      const result = await pool.query(
        'INSERT INTO roles (name) VALUES ($1) RETURNING *',
        [role.name]
      );
      inserted.push(result.rows[0]);
    }

    res.status(201).json(inserted);
  } catch (err) {
    console.error('שגיאה בהוספת תפקידים:', err);
    res.status(500).send('שגיאה בשרת');
  }
});


// עדכון תפקיד
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query(
      'UPDATE roles SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('שגיאה בעדכון תפקיד:', err);
    res.status(500).send('שגיאה בשרת');
  }
});

// מחיקת תפקיד
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM roles WHERE id = $1', [id]);
    res.json({ message: 'תפקיד נמחק' });
  } catch (err) {
    console.error('שגיאה במחיקת תפקיד:', err);
    res.status(500).send('שגיאה בשרת');
  }
});

module.exports = router;
