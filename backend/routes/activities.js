// ============================================================
// 【檔案說明】routes/activities.js — 活動管理 API 路由
//
// 提供以下 API 端點：
//   GET    /api/activities      → 前台：取得啟用中的活動列表（公開）
//   GET    /api/activities/all  → 後台：取得所有活動（需登入）
//   GET    /api/activities/:id  → 前台：取得單一活動詳情（公開，不限 active 狀態）
//   POST   /api/activities      → 後台：新增活動（需登入）
//   PUT    /api/activities/:id  → 後台：更新活動（需登入）
//   DELETE /api/activities/:id  → 後台：刪除活動（需登入）
//
// 與 news.js 的結構幾乎相同，差別在於：
//   - 活動多了 start_date、end_date（日期範圍）和 location（地點）欄位
//   - 排序依照 start_date ASC（活動按日期由近到遠排列）
//   - GET /:id 沒有 AND active = 1 的限制（任何活動都可以看詳情）
//
// 學習重點（複習）：
//   - 路由參數 :id = req.params.id
//   - auth middleware 保護後台路由
//   - SQL 的 NULL 處理：|| null 確保「無值」正確存成 NULL 而非空字串
// ============================================================

// ── 載入必要模組 ─────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

// ============================================================
// GET /api/activities — 前台：取得啟用中的活動列表
//
// 公開 API，不需要登入。
// ORDER BY start_date ASC：依開始日期升冪排列（最近即將舉行的活動排最前面）
// ============================================================
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      // WHERE active = 1 → 只回傳前台啟用顯示的活動
      // ORDER BY start_date ASC → ASC（Ascending）= 升冪，從最早到最晚
      'SELECT * FROM activities WHERE active = 1 ORDER BY start_date ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============================================================
// GET /api/activities/all — 後台：取得所有活動（含未啟用）
//
// 需要登入（auth middleware）。
// 後台管理頁面需要查看所有活動，包括已隱藏的，方便管理員編輯。
// ============================================================
router.get('/all', auth, async (req, res) => {
  try {
    // 沒有 WHERE 條件，取出全部活動（包含 active=0 的隱藏活動）
    const { rows } = await pool.query('SELECT * FROM activities ORDER BY start_date ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============================================================
// GET /api/activities/:id — 前台：取得單一活動詳細資訊
//
// 注意：這裡沒有加 AND active = 1，
// 表示即使活動被隱藏，只要知道 id 就能查看（報名頁面可能需要這樣的行為）。
// ============================================================
router.get('/:id', async (req, res) => {
  try {
    // req.params.id：從 URL 取得路由參數
    // 例如 GET /api/activities/5 → req.params.id = '5'
    const { rows } = await pool.query('SELECT * FROM activities WHERE id = $1', [req.params.id]);

    // 如果 rows[0] 是 undefined，代表沒有這個 id 的活動，回傳 404
    if (!rows[0]) return res.status(404).json({ message: '找不到此活動' });

    res.json(rows[0]); // 回傳單一物件，不是陣列
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============================================================
// POST /api/activities — 後台：新增活動
//
// 需要登入（auth middleware）。
// 請求 body 預期格式：
//   {
//     "title": "活動名稱",          ← 必填
//     "description": "活動說明",
//     "start_date": "2026-06-15",   ← 日期格式 YYYY-MM-DD
//     "end_date": "2026-06-15",
//     "location": "廟前廣場",
//     "image_url": "https://..."
//   }
// ============================================================
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, start_date, end_date, location, image_url } = req.body;

    // 只有 title 是必填，其他欄位可以為空
    if (!title) return res.status(400).json({ message: '活動名稱為必填' });

    const { rows } = await pool.query(
      'INSERT INTO activities (title, description, start_date, end_date, location, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [
        title,
        description || '', // 沒有描述就存空字串
        start_date || null, // 沒有日期就存 NULL（SQL 的「無值」）
        end_date || null,
        location || '',
        image_url || null   // 沒有圖片就存 NULL
      ]
    );

    // HTTP 201 Created，並回傳新建的活動 id
    res.status(201).json({ id: rows[0].id, message: '新增成功' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============================================================
// PUT /api/activities/:id — 後台：更新指定活動
//
// 需要登入。完整取代指定活動的所有可編輯欄位。
// active 欄位控制活動是否在前台顯示。
// ============================================================
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, start_date, end_date, location, image_url, active } = req.body;

    await pool.query(
      // $1~$7 依序對應下方陣列中的值，$8 是 WHERE 條件用的 id
      'UPDATE activities SET title=$1, description=$2, start_date=$3, end_date=$4, location=$5, image_url=$6, active=$7 WHERE id=$8',
      [
        title,
        description,
        start_date,
        end_date,
        location,
        image_url || null, // 空字串轉成 NULL
        active ? 1 : 0,    // 布林值轉成整數（資料庫欄位是 INTEGER）
        req.params.id      // URL 路由參數，指定要更新哪筆記錄
      ]
    );

    res.json({ message: '更新成功' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============================================================
// DELETE /api/activities/:id — 後台：刪除指定活動
//
// 需要登入。永久刪除資料庫記錄。
//
// 注意：activities 資料表被 registrations 資料表引用（外鍵 activity_id）。
// 如果要刪除的活動有報名資料存在，SQL 會報外鍵約束錯誤。
// 實務上刪除活動前應先確認沒有相關報名，或改用軟刪除（設 active=0）。
// ============================================================
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM activities WHERE id = $1', [req.params.id]);
    res.json({ message: '刪除成功' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ── 匯出路由 ─────────────────────────────────────────────────
module.exports = router;
