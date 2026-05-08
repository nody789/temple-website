const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

// POST /api/registration — 前台：提交報名
router.post('/', async (req, res) => {
  try {
    const { name, id_number, phone, email, address, activity_id, participants, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: '姓名和電話為必填欄位' });
    }

    const phoneRegex = /^(09\d{8}|0[2-8]\d{7,8})$/;
    if (!phoneRegex.test(phone.replace(/-/g, ''))) {
      return res.status(400).json({ message: '請輸入正確的電話號碼格式' });
    }

    const { rows } = await pool.query(
      'INSERT INTO registrations (name, id_number, phone, email, address, activity_id, participants, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [name, id_number || null, phone, email || null, address || null, activity_id || null, participants || 1, notes || null]
    );
    res.status(201).json({ id: rows[0].id, message: '報名成功！我們將儘快與您聯繫確認。' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// GET /api/registration — 後台
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT r.*, a.title AS activity_title
      FROM registrations r
      LEFT JOIN activities a ON r.activity_id = a.id
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// PUT /api/registration/:id/status — 後台：更新狀態
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE registrations SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ message: '狀態更新成功' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// DELETE /api/registration/:id — 後台：刪除
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM registrations WHERE id = $1', [req.params.id]);
    res.json({ message: '刪除成功' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

module.exports = router;
