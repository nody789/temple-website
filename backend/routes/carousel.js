const express = require('express');
const router = express.Router();
const { db } = require('../db');
const auth = require('../middleware/auth');

// GET /api/carousel — 前台：取得所有啟用的輪播（依排序）
router.get('/', (req, res) => {
  const slides = db.prepare('SELECT * FROM carousel WHERE active = 1 ORDER BY sort_order ASC').all();
  res.json(slides);
});

// GET /api/carousel/all — 後台：取得全部輪播（含停用）
router.get('/all', auth, (req, res) => {
  const slides = db.prepare('SELECT * FROM carousel ORDER BY sort_order ASC').all();
  res.json(slides);
});

// POST /api/carousel — 後台：新增輪播
router.post('/', auth, (req, res) => {
  const { title, description, image_url, sort_order } = req.body;
  if (!image_url) return res.status(400).json({ message: '請提供圖片網址' });

  const result = db.prepare(
    'INSERT INTO carousel (title, description, image_url, sort_order) VALUES (?, ?, ?, ?)'
  ).run(title || '', description || '', image_url, sort_order || 0);

  res.status(201).json({ id: result.lastInsertRowid, message: '新增成功' });
});

// PUT /api/carousel/:id — 後台：更新輪播
router.put('/:id', auth, (req, res) => {
  const { title, description, image_url, sort_order, active } = req.body;
  db.prepare(
    'UPDATE carousel SET title=?, description=?, image_url=?, sort_order=?, active=? WHERE id=?'
  ).run(title, description, image_url, sort_order, active ? 1 : 0, req.params.id);
  res.json({ message: '更新成功' });
});

// DELETE /api/carousel/:id — 後台：刪除輪播
router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM carousel WHERE id = ?').run(req.params.id);
  res.json({ message: '刪除成功' });
});

module.exports = router;
