const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

// GET /api/news — 前台
router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const { rows } = await pool.query(
      'SELECT * FROM news WHERE active = 1 ORDER BY published_at DESC LIMIT $1',
      [limit]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// GET /api/news/all — 後台
router.get('/all', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM news ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// GET /api/news/:id — 前台：單篇
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM news WHERE id = $1 AND active = 1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: '找不到此消息' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// POST /api/news — 後台：新增
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, image_url, published_at } = req.body;
    if (!title || !content) return res.status(400).json({ message: '標題和內容為必填' });

    const date = published_at || new Date().toISOString().split('T')[0];
    const { rows } = await pool.query(
      'INSERT INTO news (title, content, image_url, published_at) VALUES ($1, $2, $3, $4) RETURNING id',
      [title, content, image_url || null, date]
    );
    res.status(201).json({ id: rows[0].id, message: '新增成功' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// PUT /api/news/:id — 後台：更新
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, image_url, published_at, active } = req.body;
    await pool.query(
      'UPDATE news SET title=$1, content=$2, image_url=$3, published_at=$4, active=$5 WHERE id=$6',
      [title, content, image_url || null, published_at, active ? 1 : 0, req.params.id]
    );
    res.json({ message: '更新成功' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// DELETE /api/news/:id — 後台：刪除
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM news WHERE id = $1', [req.params.id]);
    res.json({ message: '刪除成功' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

module.exports = router;
