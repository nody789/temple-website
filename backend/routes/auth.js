const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'temple-secret-key-change-this-in-production';

// POST /api/auth/login — 登入，回傳 JWT token
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '請輸入帳號和密碼' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: '帳號或密碼錯誤' });
  }

  // 產生 JWT，24小時後過期
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

  res.json({ token, username: user.username });
});

// POST /api/auth/change-password — 更改密碼（需要登入）
router.post('/change-password', authMiddleware, (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: '新密碼至少需要 6 個字元' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

  if (!bcrypt.compareSync(oldPassword, user.password)) {
    return res.status(400).json({ message: '舊密碼錯誤' });
  }

  const hashed = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.user.id);

  res.json({ message: '密碼更新成功' });
});

module.exports = router;
