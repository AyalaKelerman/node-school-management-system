const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all treatments
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM treatments ORDER BY id');
  res.json(result.rows);
});

// POST create treatment
router.post('/', async (req, res) => {
  const { student_id, teacher_id, subject, hours, group_type } = req.body;
  const result = await pool.query(
    `INSERT INTO treatments (student_id, teacher_id, subject, hours, group_type)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [student_id, teacher_id, subject, hours, group_type]
  );
  res.status(201).json(result.rows[0]);
});

// PUT update treatment
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { student_id, teacher_id, subject, hours, group_type } = req.body;
  const result = await pool.query(
    `UPDATE treatments SET student_id=$1, teacher_id=$2, subject=$3, hours=$4, group_type=$5 WHERE id=$6 RETURNING *`,
    [student_id, teacher_id, subject, hours, group_type, id]
  );
  res.json(result.rows[0]);
});

// DELETE treatment
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM treatments WHERE id = $1', [id]);
  res.json({ message: 'Treatment deleted' });
});

module.exports = router;
