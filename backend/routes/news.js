const express = require('express');
const router = express.Router();
const { db } = require('../db');
const auth = require('../middleware/auth');

// GET /api/news — 前台：取得已啟用的消息
router.get('/', (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 50;
  const items = db.prepare(
    'SELECT * FROM news WHERE active = 1 ORDER BY published_at DESC LIMIT ?'
  ).all(limit);
  res.json(items);
});

// GET /api/news/all — 後台：取得全部
router.get('/all', auth, (req, res) => {
  const items = db.prepare('SELECT * FROM news ORDER BY created_at DESC').all();
  res.json(items);
});

// GET /api/news/:id — 前台：取得單篇消息
router.get('/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM news WHERE id = ? AND active = 1').get(req.params.id);
  if (!item) return res.status(404).json({ message: '找不到此消息' });
  res.json(item);
});

// POST /api/news — 後台：新增消息
router.post('/', auth, (req, res) => {
  const { title, content, image_url, published_at } = req.body;
  if (!title || !content) return res.status(400).json({ message: '標題和內容為必填' });

  const date = published_at || new Date().toISOString().split('T')[0];
  const result = db.prepare(
    'INSERT INTO news (title, content, image_url, published_at) VALUES (?, ?, ?, ?)'
  ).run(title, content, image_url || null, date);

  res.status(201).json({ id: result.lastInsertRowid, message: '新增成功' });
});

// PUT /api/news/:id — 後台：更新消息
router.put('/:id', auth, (req, res) => {
  const { title, content, image_url, published_at, active } = req.body;
  db.prepare(
    'UPDATE news SET title=?, content=?, image_url=?, published_at=?, active=? WHERE id=?'
  ).run(title, content, image_url || null, published_at, active ? 1 : 0, req.params.id);
  res.json({ message: '更新成功' });
});

// DELETE /api/news/:id — 後台：刪除消息
router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM news WHERE id = ?').run(req.params.id);
  res.json({ message: '刪除成功' });
});

module.exports = router;
