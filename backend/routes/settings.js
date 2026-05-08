const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT key, value FROM settings');
    const settings = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// PUT /api/settings — 後台：批次更新
router.put('/', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [key, value] of Object.entries(req.body)) {
      await client.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
        [key, value]
      );
    }
    await client.query('COMMIT');
    res.json({ message: '設定更新成功' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: '伺服器錯誤' });
  } finally {
    client.release();
  }
});

module.exports = router;
