// ============================================================
// 【檔案說明】routes/registration.js — 活動報名 API 路由
//
// 提供以下 API 端點：
//   POST   /api/registration           → 前台：提交報名表單（公開，不需登入）
//   GET    /api/registration           → 後台：查看所有報名記錄（需登入）
//   PUT    /api/registration/:id/status → 後台：更新報名狀態（需登入）
//   DELETE /api/registration/:id       → 後台：刪除報名記錄（需登入）
//
// 學習重點：
//   - 表單驗證：後端一定要驗證使用者輸入，不能只靠前端驗證
//   - 正規表達式（Regex）：用來驗證電話號碼格式
//   - SQL JOIN：把兩個資料表的資料合併查詢
//   - 多層路由參數：/:id/status（id 是數字，status 是固定字串）
//
// 重要觀念：為什麼後端也要驗證？
//   前端驗證可以被繞過（直接用 Postman、curl 等工具發送請求），
//   所以後端必須再次驗證，確保資料安全性和完整性。
// ============================================================

// ── 載入必要模組 ─────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

// ============================================================
// POST /api/registration — 前台：提交報名表單
//
// 不需要登入（公開 API），任何訪客都可以提交報名。
//
// 請求 body 預期格式：
//   {
//     "name": "王小明",               ← 必填
//     "phone": "0912345678",          ← 必填，並驗證格式
//     "id_number": "A123456789",      ← 選填
//     "email": "test@example.com",    ← 選填
//     "address": "台北市...",         ← 選填
//     "activity_id": 2,               ← 選填，對應 activities 資料表的 id
//     "participants": 3,              ← 選填，預設 1 人
//     "notes": "備註事項"             ← 選填
//   }
// ============================================================
router.post('/', async (req, res) => {
  try {
    // 從請求 body 解構取出所有欄位
    const { name, id_number, phone, email, address, activity_id, participants, notes } = req.body;

    // ── 必填欄位驗證 ──────────────────────────────────────────
    // 姓名和電話是一定要填的（方便廟方聯絡確認報名）
    if (!name || !phone) {
      return res.status(400).json({ message: '姓名和電話為必填欄位' });
    }

    // ── 電話號碼格式驗證 ─────────────────────────────────────
    // 正規表達式（Regular Expression / Regex）：
    //   用來描述文字模式的語法，可以快速檢查字串是否符合某種格式。
    //
    // /^(09\d{8}|0[2-8]\d{7,8})$/  解析：
    //   ^ = 字串開頭
    //   $ = 字串結尾（確保整個字串都符合，不是部分符合）
    //   (09\d{8}|0[2-8]\d{7,8}) = 兩種格式擇一：
    //     09\d{8}         → 行動電話：09 + 8 個數字 = 共 10 碼（如 0912345678）
    //     0[2-8]\d{7,8}   → 市話：0 + 2~8 的數字 + 7 或 8 個數字（如 02XXXXXXXX）
    //   \d = 任意一個數字（0-9）
    //   {8} = 前面的字元重複 8 次
    //   {7,8} = 前面的字元重複 7 到 8 次
    //
    // .replace(/-/g, '')：先把所有連字號（-）移除（處理 0912-345-678 這種格式）
    //   /-/g：斜線是 Regex 分隔符，-/g 表示全域替換所有 -
    const phoneRegex = /^(09\d{8}|0[2-8]\d{7,8})$/;
    if (!phoneRegex.test(phone.replace(/-/g, ''))) {
      return res.status(400).json({ message: '請輸入正確的電話號碼格式' });
    }

    // ── 寫入資料庫 ────────────────────────────────────────────
    const { rows } = await pool.query(
      'INSERT INTO registrations (name, id_number, phone, email, address, activity_id, participants, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [
        name,
        id_number || null,      // 沒有填身分證就存 NULL
        phone,
        email || null,           // 沒有填 email 就存 NULL
        address || null,         // 沒有填地址就存 NULL
        activity_id || null,     // 沒有指定活動就存 NULL（通用報名）
        participants || 1,       // 沒有填人數就預設 1 人
        notes || null            // 沒有備註就存 NULL
      ]
    );

    // 成功回傳 201 Created，告知報名成功
    res.status(201).json({ id: rows[0].id, message: '報名成功！我們將儘快與您聯繫確認。' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============================================================
// GET /api/registration — 後台：查看所有報名記錄
//
// 需要登入（auth middleware）。
//
// SQL JOIN 說明：
//   LEFT JOIN activities a ON r.activity_id = a.id
//
//   JOIN（連接）是把兩個資料表合併的操作：
//     registrations 資料表只存了 activity_id（數字）
//     想同時顯示活動名稱，就要 JOIN activities 資料表
//
//   LEFT JOIN 的意義：
//     即使 activity_id 是 NULL（沒有指定活動），這筆報名也要出現在結果中。
//     （如果用 INNER JOIN，沒有對應活動的報名就會被過濾掉）
//
//   ON r.activity_id = a.id：
//     連接條件：registrations 的 activity_id 等於 activities 的 id
//
//   a.title AS activity_title：
//     把 activities 資料表的 title 欄位，以別名 activity_title 輸出
//     （因為 registrations 沒有 title 欄位，不需要加前綴；
//      但為了清楚，用別名標明這是活動名稱）
//
//   r.*：取出 registrations 所有欄位（r 是 registrations 的別名）
// ============================================================
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT r.*, a.title AS activity_title
      FROM registrations r
      LEFT JOIN activities a ON r.activity_id = a.id
      ORDER BY r.created_at DESC
    `);
    // 每筆結果包含報名資料 + activity_title（若無對應活動則為 null）
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============================================================
// PUT /api/registration/:id/status — 後台：更新報名狀態
//
// 需要登入。
// 路由路徑解析：/api/registration/:id/status
//   :id → 動態參數，對應報名記錄的 id
//   /status → 固定字串，代表「更新狀態」這個子操作
//   完整 URL 例如：PUT /api/registration/5/status
//
// 請求 body 預期格式：
//   { "status": "confirmed" }
//   常見狀態值：pending（待確認）、confirmed（已確認）、cancelled（已取消）
// ============================================================
router.put('/:id/status', auth, async (req, res) => {
  try {
    // 從 body 取出新狀態值
    const { status } = req.body;

    // UPDATE 只更新 status 這一個欄位，其他欄位不動
    await pool.query('UPDATE registrations SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ message: '狀態更新成功' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============================================================
// DELETE /api/registration/:id — 後台：刪除報名記錄
//
// 需要登入。永久刪除指定的報名記錄。
// ============================================================
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM registrations WHERE id = $1', [req.params.id]);
    res.json({ message: '刪除成功' });
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ── 匯出路由 ─────────────────────────────────────────────────
module.exports = router;
