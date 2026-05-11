// ============================================================
// 【檔案說明】routes/carousel.js — 輪播圖 API 路由
//
// 提供以下 API 端點（RESTful 風格）：
//   GET    /api/carousel      → 前台：取得已啟用的輪播圖（公開）
//   GET    /api/carousel/all  → 後台：取得所有輪播圖（需登入）
//   POST   /api/carousel      → 後台：新增輪播圖（需登入）
//   PUT    /api/carousel/:id  → 後台：更新指定輪播圖（需登入）
//   DELETE /api/carousel/:id  → 後台：刪除指定輪播圖（需登入）
//
// RESTful API 的 HTTP 方法語意：
//   GET    → 讀取資料（不修改伺服器狀態）
//   POST   → 新增資料（建立新資源）
//   PUT    → 更新資料（取代整筆資源）
//   DELETE → 刪除資料（移除資源）
//
// 學習重點：
//   - 路由參數 :id（req.params.id）：URL 中的動態片段
//   - auth middleware：只有帶有有效 Token 的請求才能執行後台操作
//   - RETURNING id：PostgreSQL 語法，INSERT 後立刻回傳新建記錄的 id
//   - res.status(201)：HTTP 201 = Created，表示成功新增資源
// ============================================================

// ── 載入必要模組 ─────────────────────────────────────────────
const express = require('express');
const router = express.Router(); // 建立模組化路由
const { pool } = require('../db'); // 資料庫連線池
const auth = require('../middleware/auth'); // JWT 身份驗證 middleware

// ============================================================
// GET /api/carousel — 前台：取得啟用中的輪播圖
//
// 這個路由「沒有」加上 auth middleware，表示任何人都可以存取（公開 API）。
// 前台網站需要顯示輪播圖給訪客，所以不需要登入。
//
// SQL 說明：
//   SELECT * FROM carousel → 取出 carousel 資料表的所有欄位
//   WHERE active = 1 → 只取「啟用中」的輪播圖（active=0 的代表已隱藏）
//   ORDER BY sort_order ASC → 依照 sort_order 由小到大排序（ASC = 升冪）
// ============================================================
router.get('/', async (req, res) => {
  try {
    // pool.query(sql)：執行 SQL，回傳 { rows: [...] }
    // rows 是查詢結果的陣列，每個元素是一筆資料（物件格式）
    const { rows } = await pool.query('SELECT * FROM carousel WHERE active = 1 ORDER BY sort_order ASC');

    // res.json(rows)：把 JavaScript 陣列轉成 JSON 字串回傳給客戶端
    // Express 會自動設定 Content-Type: application/json
    res.json(rows);
  } catch (err) {
    // 資料庫查詢失敗時，回傳 500 Internal Server Error
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============================================================
// GET /api/carousel/all — 後台：取得所有輪播圖（含未啟用的）
//
// 注意第二個參數 auth：這裡加上了身份驗證 middleware！
// 只有在 HTTP Header 帶有有效 JWT Token 的請求才能取得資料。
// 後台管理頁面需要看到所有輪播圖（包括隱藏的），所以要查全部。
//
// 路由順序很重要：'/all' 要放在 '/:id' 之前！
// 因為如果 '/:id' 先定義，Express 會把 'all' 當成 id 參數的值來處理。
// ============================================================
router.get('/all', auth, async (req, res) => {
  try {
    // 沒有 WHERE 條件，取出所有輪播圖（包含 active=0 的）
    const { rows } = await pool.query('SELECT * FROM carousel ORDER BY sort_order ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============================================================
// POST /api/carousel — 後台：新增輪播圖
//
// 需要登入（有 auth middleware）。
// 請求 body 預期格式：
//   { "title": "神恩浩蕩", "description": "說明文字", "image_url": "https://...", "sort_order": 1 }
//
// SQL 說明：
//   INSERT INTO carousel (...) VALUES ($1, $2, $3, $4) RETURNING id
//   RETURNING id：PostgreSQL 特有語法，INSERT 完成後把新建記錄的 id 回傳。
//   這讓前端可以立刻知道新建的記錄 ID，方便後續操作。
// ============================================================
router.post('/', auth, async (req, res) => {
  try {
    // 從請求 body 解構取出各欄位值
    const { title, description, image_url, sort_order } = req.body;

    // 必填欄位驗證：image_url 一定要有，沒有圖片的輪播圖沒有意義
    if (!image_url) return res.status(400).json({ message: '請提供圖片網址' });

    const { rows } = await pool.query(
      'INSERT INTO carousel (title, description, image_url, sort_order) VALUES ($1, $2, $3, $4) RETURNING id',
      [
        title || '',        // title 可以是空字串（用 || '' 設定預設值）
        description || '',  // description 同上
        image_url,          // 必填，已在上面驗證
        sort_order || 0     // sort_order 預設為 0
      ]
    );

    // HTTP 201 Created：表示成功建立新資源（比 200 更精確地表達「新增成功」）
    res.status(201).json({ id: rows[0].id, message: '新增成功' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============================================================
// PUT /api/carousel/:id — 後台：更新指定輪播圖
//
// :id 是路由參數（Route Parameter），是 URL 中的動態片段。
// 例如：PUT /api/carousel/3 → req.params.id = '3'（字串型別）
//
// PUT 語意：用新資料「完整取代」這筆資源的所有可編輯欄位。
//
// SQL 說明：
//   UPDATE carousel SET col1=$1, col2=$2, ... WHERE id=$6
//   SET：指定要更新的欄位和新值
//   WHERE id=$6：精確定位要更新的那一筆記錄（不加 WHERE 就會更新全部，非常危險！）
// ============================================================
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, image_url, sort_order, active } = req.body;

    await pool.query(
      'UPDATE carousel SET title=$1, description=$2, image_url=$3, sort_order=$4, active=$5 WHERE id=$6',
      [
        title,
        description,
        image_url,
        sort_order,
        active ? 1 : 0,   // 三元運算子：active 為 true 存 1，false 存 0（資料庫用整數表示布林值）
        req.params.id      // 從 URL 取得的 id，用來指定要更新哪筆記錄
      ]
    );

    // HTTP 200（預設）+ 成功訊息
    res.json({ message: '更新成功' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============================================================
// DELETE /api/carousel/:id — 後台：刪除指定輪播圖
//
// :id 一樣是路由參數，指定要刪除哪筆記錄。
//
// SQL 說明：
//   DELETE FROM carousel WHERE id = $1
//   從 carousel 資料表刪除 id 符合的那一筆。
//   WHERE 條件非常重要！沒有 WHERE 就會刪掉整個資料表的所有資料。
// ============================================================
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM carousel WHERE id = $1', [req.params.id]);
    res.json({ message: '刪除成功' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ── 匯出路由 ─────────────────────────────────────────────────
module.exports = router;
