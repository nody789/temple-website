const express = require('express');
const router = express.Router();
const { db } = require('../db');
const auth = require('../middleware/auth');

// GET /api/settings — 前台和後台都可讀取
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  // 把陣列轉成物件格式，比較好用：{ site_name: '...', phone: '...' }
  const settings = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  res.json(settings);
});

// PUT /api/settings — 後台：批次更新設定
router.put('/', auth, (req, res) => {
  const updates = req.body; // 物件格式：{ site_name: '新名稱', phone: '新電話', ... }

  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  const updateMany = db.transaction((data) => {
    for (const [key, value] of Object.entries(data)) {
      upsert.run(key, value);
    }
  });

  updateMany(updates);
  res.json({ message: '設定更新成功' });
});

module.exports = router;
