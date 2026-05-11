// ============================================================
// 【檔案說明】routes/news.js — 最新消息 API 路由
//
// 提供以下 API 端點：
//   GET    /api/news          → 前台：取得已啟用的消息列表（公開，支援 limit 參數）
//   GET    /api/news/all      → 後台：取得所有消息（需登入）
//   GET    /api/news/:id      → 前台：取得單篇消息（公開）
//   POST   /api/news          → 後台：新增消息（需登入）
//   PUT    /api/news/:id      → 後台：更新消息（需登入）
//   DELETE /api/news/:id      → 後台：刪除消息（需登入）
//
// 學習重點：
//   - 查詢字串參數（Query String）：URL 中 ? 後面的部分，用 req.query 取得
//     例如：GET /api/news?limit=5 → req.query.limit = '5'（字串，要轉型）
//   - ORDER BY ... DESC：SQL 降冪排序，最新的排最前面
//   - LIMIT：SQL 限制回傳筆數，避免一次載入過多資料
//   - 404 Not Found：找不到指定資源時回傳的 HTTP 狀態碼
// ============================================================

// ── 載入必要模組 ─────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

// ============================================================
// GET /api/news — 前台：取得啟用中的消息列表
//
// 支援查詢字串參數（Query String Parameter）：
//   limit：限制回傳筆數，預設 50（例如首頁只顯示最新 3 則）
//
// URL 範例：
//   GET /api/news          → 取最多 50 筆
//   GET /api/news?limit=3  → 只取最新 3 筆
//
// req.query：Express 自動解析 URL 中 ? 後面的參數，
//   ?limit=3 → req.query = { limit: '3' }（注意是字串！要用 parseInt 轉整數）
// ============================================================
router.get('/', async (req, res) => {
  try {
    // 三元運算子：如果有傳 limit 參數就轉成整數，否則預設 50
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;

    const { rows } = await pool.query(
      // WHERE active = 1：只取啟用中的消息
      // ORDER BY published_at DESC：依照發佈日期降冪排列（最新的在最上面）
      // LIMIT $1：最多回傳 limit 筆（防止一次拿太多資料）
      'SELECT * FROM news WHERE active = 1 ORDER BY published_at DESC LIMIT $1',
      [limit]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============================================================
// GET /api/news/all — 後台：取得所有消息（含未啟用）
//
// 需要登入（auth middleware）。
// ORDER BY created_at DESC：依照建立時間排序，最新建立的排最前面。
// （後台管理通常用建立時間排序，方便管理員查看最近修改的項目）
// ============================================================
router.get('/all', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM news ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============================================================
// GET /api/news/:id — 前台：取得單篇消息詳細內容
//
// :id 是路由參數，對應 URL 中的動態片段。
// 例如：GET /api/news/3 → req.params.id = '3'
//
// 這個路由要放在 '/all' 之後定義！
// 因為路由是照順序匹配的：
//   如果 '/:id' 先定義，GET /api/news/all 就會被當成 id='all' 來處理。
// ============================================================
router.get('/:id', async (req, res) => {
  try {
    // WHERE id = $1 AND active = 1：
    //   id 要符合，而且必須是啟用中的消息（隱藏的消息前台不顯示）
    const { rows } = await pool.query('SELECT * FROM news WHERE id = $1 AND active = 1', [req.params.id]);

    // rows[0] 如果是 undefined（沒查到），表示找不到這篇消息
    if (!rows[0]) return res.status(404).json({ message: '找不到此消息' });
    // HTTP 404 = Not Found（資源不存在）

    // 找到了就回傳那一筆資料物件（不是陣列）
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============================================================
// POST /api/news — 後台：新增消息
//
// 需要登入（auth middleware）。
// 請求 body 預期格式：
//   { "title": "消息標題", "content": "消息內容", "image_url": "https://...", "published_at": "2026-01-01" }
// ============================================================
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, image_url, published_at } = req.body;

    // 必填欄位驗證：標題和內容不能為空
    if (!title || !content) return res.status(400).json({ message: '標題和內容為必填' });

    // 發佈日期處理：
    //   如果前端有傳 published_at 就用它，
    //   否則用今天的日期（new Date().toISOString() 回傳 "2026-01-01T00:00:00.000Z"，
    //   .split('T')[0] 截取日期部分 "2026-01-01"）
    const date = published_at || new Date().toISOString().split('T')[0];

    const { rows } = await pool.query(
      'INSERT INTO news (title, content, image_url, published_at) VALUES ($1, $2, $3, $4) RETURNING id',
      [
        title,
        content,
        image_url || null, // 沒有圖片就存 NULL（null 在 SQL 表示「無值」）
        date
      ]
    );

    // 201 Created + 回傳新建的 id
    res.status(201).json({ id: rows[0].id, message: '新增成功' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============================================================
// PUT /api/news/:id — 後台：更新指定消息
//
// 需要登入。用新資料完整取代指定消息的所有欄位。
// active 欄位控制消息是否在前台顯示（1=顯示，0=隱藏）。
// ============================================================
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, image_url, published_at, active } = req.body;

    await pool.query(
      'UPDATE news SET title=$1, content=$2, image_url=$3, published_at=$4, active=$5 WHERE id=$6',
      [
        title,
        content,
        image_url || null, // 如果前端傳了空字串，也轉成 null
        published_at,
        active ? 1 : 0,   // true → 1（啟用），false → 0（隱藏）
        req.params.id      // URL 中的 id 參數，指定要更新哪筆記錄
      ]
    );

    res.json({ message: '更新成功' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============================================================
// DELETE /api/news/:id — 後台：刪除指定消息
//
// 需要登入。永久刪除資料庫中的記錄（硬刪除）。
// 注意：刪除後無法復原！如果想「軟刪除」，可以改成更新 active=0。
// ============================================================
router.delete('/:id', auth, async (req, res) => {
  try {
    // DELETE FROM news WHERE id = $1：刪除指定 id 的那一筆記錄
    await pool.query('DELETE FROM news WHERE id = $1', [req.params.id]);
    res.json({ message: '刪除成功' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ── 匯出路由 ─────────────────────────────────────────────────
module.exports = router;
