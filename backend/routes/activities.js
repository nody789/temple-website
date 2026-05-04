const express = require('express');
const router = express.Router();
const { db } = require('../db');
const auth = require('../middleware/auth');

// GET /api/activities — 前台
router.get('/', (req, res) => {
  const items = db.prepare(
    'SELECT * FROM activities WHERE active = 1 ORDER BY start_date ASC'
  ).all();
  res.json(items);
});

// GET /api/activities/all — 後台
router.get('/all', auth, (req, res) => {
  const items = db.prepare('SELECT * FROM activities ORDER BY start_date ASC').all();
  res.json(items);
});

// GET /api/activities/:id
router.get('/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ message: '找不到此活動' });
  res.json(item);
});

// POST /api/activities — 後台：新增活動
router.post('/', auth, (req, res) => {
  const { title, description, start_date, end_date, location, image_url } = req.body;
  if (!title) return res.status(400).json({ message: '活動名稱為必填' });

  const result = db.prepare(
    'INSERT INTO activities (title, description, start_date, end_date, location, image_url) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(title, description || '', start_date || null, end_date || null, location || '', image_url || null);

  res.status(201).json({ id: result.lastInsertRowid, message: '新增成功' });
});

// PUT /api/activities/:id — 後台：更新活動
router.put('/:id', auth, (req, res) => {
  const { title, description, start_date, end_date, location, image_url, active } = req.body;
  db.prepare(
    'UPDATE activities SET title=?, description=?, start_date=?, end_date=?, location=?, image_url=?, active=? WHERE id=?'
  ).run(title, description, start_date, end_date, location, image_url || null, active ? 1 : 0, req.params.id);
  res.json({ message: '更新成功' });
});

// DELETE /api/activities/:id — 後台：刪除活動
router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM activities WHERE id = ?').run(req.params.id);
  res.json({ message: '刪除成功' });
});

module.exports = router;
