const express = require('express');
const router = express.Router();
const { db } = require('../db');
const auth = require('../middleware/auth');

// POST /api/registration — 前台：提交報名表
router.post('/', (req, res) => {
  const { name, id_number, phone, email, address, activity_id, participants, notes } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: '姓名和電話為必填欄位' });
  }

  // 簡單驗證電話格式（台灣手機或市話）
  const phoneRegex = /^(09\d{8}|0[2-8]\d{7,8})$/;
  if (!phoneRegex.test(phone.replace(/-/g, ''))) {
    return res.status(400).json({ message: '請輸入正確的電話號碼格式' });
  }

  const result = db.prepare(
    'INSERT INTO registrations (name, id_number, phone, email, address, activity_id, participants, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    name,
    id_number || null,
    phone,
    email || null,
    address || null,
    activity_id || null,
    participants || 1,
    notes || null
  );

  res.status(201).json({ id: result.lastInsertRowid, message: '報名成功！我們將儘快與您聯繫確認。' });
});

// GET /api/registration — 後台：查看所有報名資料
router.get('/', auth, (req, res) => {
  const items = db.prepare(`
    SELECT r.*, a.title as activity_title
    FROM registrations r
    LEFT JOIN activities a ON r.activity_id = a.id
    ORDER BY r.created_at DESC
  `).all();
  res.json(items);
});

// PUT /api/registration/:id/status — 後台：更新報名狀態
router.put('/:id/status', auth, (req, res) => {
  const { status } = req.body; // 'pending' | 'confirmed' | 'cancelled'
  db.prepare('UPDATE registrations SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ message: '狀態更新成功' });
});

// DELETE /api/registration/:id — 後台：刪除報名記錄
router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM registrations WHERE id = ?').run(req.params.id);
  res.json({ message: '刪除成功' });
});

module.exports = router;
