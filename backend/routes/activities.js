const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

// GET /api/activities — 前台
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM activities WHERE active = 1 ORDER BY start_date ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// GET /api/activities/all — 後台
router.get('/all', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM activities ORDER BY start_date ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// GET /api/activities/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM activities WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: '找不到此活動' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// POST /api/activities — 後台：新增
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, start_date, end_date, location, image_url } = req.body;
    if (!title) return res.status(400).json({ message: '活動名稱為必填' });

    const { rows } = await pool.query(
      'INSERT INTO activities (title, description, start_date, end_date, location, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [title, description || '', start_date || null, end_date || null, location || '', image_url || null]
    );
    res.status(201).json({ id: rows[0].id, message: '新增成功' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// PUT /api/activities/:id — 後台：更新
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, start_date, end_date, location, image_url, active } = req.body;
    await pool.query(
      'UPDATE activities SET title=$1, description=$2, start_date=$3, end_date=$4, location=$5, image_url=$6, active=$7 WHERE id=$8',
      [title, description, start_date, end_date, location, image_url || null, active ? 1 : 0, req.params.id]
    );
    res.json({ message: '更新成功' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// DELETE /api/activities/:id — 後台：刪除
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM activities WHERE id = $1', [req.params.id]);
    res.json({ message: '刪除成功' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

module.exports = router;
