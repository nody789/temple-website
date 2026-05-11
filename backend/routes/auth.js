// ============================================================
// 【檔案說明】routes/auth.js — 使用者身份驗證路由
//
// 提供兩個 API 端點：
//   POST /api/auth/login          → 登入，驗證帳號密碼，回傳 JWT Token
//   POST /api/auth/change-password → 修改密碼（需要先登入，受 authMiddleware 保護）
//
// 學習重點：
//   - express.Router()：建立模組化路由，可以把相關 API 集中在一個檔案管理
//   - bcrypt：密碼雜湊套件，用來安全地比對密碼（不儲存明文密碼）
//   - JWT（JSON Web Token）：無狀態的身份驗證機制，登入成功後發給前端一個 Token
//   - async/await + try/catch：非同步函式的標準寫法，捕捉可能的錯誤
//   - res.status()：設定 HTTP 狀態碼，讓前端知道請求成功還是失敗
// ============================================================

// ── 載入必要模組 ─────────────────────────────────────────────
const express = require('express');

// express.Router()：建立一個路由物件。
// 好處：可以把路由分拆到不同檔案，讓 server.js 更簡潔。
// 這裡定義的路徑（如 '/login'）會和 server.js 中的前綴合併：
//   server.js: app.use('/api/auth', ...) + 這裡的 '/login' = 最終路徑 /api/auth/login
const router = express.Router();

// bcryptjs：bcrypt 的純 JavaScript 版本，效能穩定，不需要編譯原生模組
const bcrypt = require('bcryptjs');

// jsonwebtoken：產生和驗證 JWT Token 的套件
const jwt = require('jsonwebtoken');

// 從 db.js 取得 pool（資料庫連線池），用來執行 SQL 查詢
const { pool } = require('../db');

// authMiddleware：身份驗證中介軟體，確保只有已登入的使用者才能存取某些路由
const authMiddleware = require('../middleware/auth');

// JWT_SECRET：用來簽署 Token 的秘鑰，必須保密（不能暴露在前端）
// 優先從環境變數讀取，如果沒設定則使用後備值（正式環境一定要設定環境變數！）
const JWT_SECRET = process.env.JWT_SECRET || 'temple-secret-key-change-this-in-production';

// ============================================================
// POST /api/auth/login — 使用者登入
//
// HTTP POST：用來送出需要「新建」或「處理」的資料（如登入表單）
//   適合用 POST 而不是 GET，因為密碼不能出現在 URL 中
//
// 請求 body（req.body）預期格式：
//   { "username": "admin", "password": "admin123" }
//
// 成功回應（200 OK）：
//   { "token": "eyJ...", "username": "admin" }
//
// 失敗回應：
//   400 Bad Request → 缺少帳號或密碼
//   401 Unauthorized → 帳號或密碼錯誤
//   500 Internal Server Error → 伺服器/資料庫發生意外錯誤
// ============================================================
router.post('/login', async (req, res) => {
  // try/catch：非同步操作可能出錯，用 try 包住正常流程，catch 處理錯誤
  try {
    // 從請求 body 解構取出 username 和 password
    // 如果前端送來 { "username": "admin", "password": "abc" }，
    // 這裡的 username = 'admin'，password = 'abc'
    const { username, password } = req.body;

    // 基本驗證：確保兩個欄位都有值（不是空字串、undefined、null）
    if (!username || !password) {
      // return 讓函式提前結束，不繼續往下執行
      // HTTP 400 = Bad Request（請求格式有問題，客戶端的錯）
      return res.status(400).json({ message: '請輸入帳號和密碼' });
    }

    // ── 查詢資料庫找使用者 ────────────────────────────────────
    // pool.query(sql, params)：執行 SQL 查詢
    //   sql：SELECT * FROM users WHERE username = $1
    //     SELECT * → 取出所有欄位
    //     FROM users → 從 users 資料表
    //     WHERE username = $1 → 篩選條件：username 等於第一個參數
    //   params：[$1 對應的值] = [username]
    //
    // 回傳的物件中，rows 是查詢結果的陣列
    //   找到一筆 → rows = [{ id: 1, username: 'admin', password: '$2b$...' }]
    //   找不到  → rows = []
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = rows[0]; // 取第一筆（username 是 UNIQUE，只會有 0 或 1 筆）

    // ── 驗證密碼 ──────────────────────────────────────────────
    // 第一個條件：!user → 使用者不存在（rows 為空陣列）
    // 第二個條件：!bcrypt.compareSync(password, user.password)
    //   bcrypt.compareSync(明文密碼, 資料庫雜湊值)：
    //     把使用者輸入的明文密碼，和資料庫中存的雜湊值比對，
    //     回傳 true（吻合）或 false（不吻合）
    //     Sync 表示同步版本（比較簡單，這裡效能影響不大）
    if (!user || !bcrypt.compareSync(password, user.password)) {
      // 刻意不指明是「帳號錯誤」還是「密碼錯誤」，
      // 避免攻擊者用這個資訊判斷帳號是否存在（資訊安全最佳實踐）
      return res.status(401).json({ message: '帳號或密碼錯誤' });
    }

    // ── 產生 JWT Token ────────────────────────────────────────
    // jwt.sign(payload, secret, options)：
    //   payload：Token 中要包含的資料（使用者 ID 和帳號名稱）
    //     注意：payload 是可以被 decode 的，不要放敏感資料（如密碼）！
    //   secret：用來簽署 Token 的秘鑰，伺服器保管，防止外部偽造 Token
    //   options.expiresIn：Token 有效期限，'24h' 表示 24 小時後過期
    //
    // 產生的 token 是一個字串，格式：header.payload.signature
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

    // 回傳 token 給前端，前端存起來（localStorage 或記憶體），
    // 之後每次 API 請求都帶在 Authorization Header 中
    res.json({ token, username: user.username });

  } catch (err) {
    // 意外錯誤（如資料庫連線失敗）
    // HTTP 500 = Internal Server Error（伺服器端的問題）
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============================================================
// POST /api/auth/change-password — 修改密碼
//
// 注意：第二個參數 authMiddleware！
//   這代表這個路由在執行主要函式之前，會先執行 authMiddleware。
//   authMiddleware 會驗證 JWT Token，確保使用者已登入。
//   如果 Token 無效，middleware 就會回傳 401，主要函式不會被執行。
//
// 請求 body 預期格式：
//   { "oldPassword": "admin123", "newPassword": "newpass456" }
//
// 路由參數順序：router.post(path, middleware, handler)
//   handler 裡的 req.user 是 authMiddleware 注入的使用者資訊（來自 JWT Payload）
// ============================================================
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    // 從請求 body 取出舊密碼和新密碼
    const { oldPassword, newPassword } = req.body;

    // 基本驗證：新密碼不能太短（太短的密碼容易被猜到）
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: '新密碼至少需要 6 個字元' });
    }

    // ── 從資料庫取出當前使用者的資料 ─────────────────────────
    // req.user.id 是 authMiddleware 從 JWT Payload 解出來的使用者 ID
    // 這樣確保使用者只能修改自己的密碼
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = rows[0];

    // ── 驗證舊密碼是否正確 ────────────────────────────────────
    // bcrypt.compareSync(輸入的舊密碼, 資料庫中的雜湊值)
    if (!bcrypt.compareSync(oldPassword, user.password)) {
      return res.status(400).json({ message: '舊密碼錯誤' });
    }

    // ── 對新密碼進行雜湊處理 ─────────────────────────────────
    // bcrypt.hashSync(明文密碼, saltRounds)：同步版雜湊
    // saltRounds=10：雜湊強度，越高越安全但越慢（10 是常用值）
    // 每次 hash 出來的結果都不一樣（加了隨機 salt），這是 bcrypt 的特點
    const hashed = bcrypt.hashSync(newPassword, 10);

    // ── 更新資料庫中的密碼 ────────────────────────────────────
    // UPDATE users SET password = $1 WHERE id = $2
    //   SET password = $1 → 把 password 欄位更新為新的雜湊值
    //   WHERE id = $2 → 只更新這個使用者的資料（精確定位，不影響其他人）
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id]);

    // HTTP 200（預設）+ 成功訊息
    res.json({ message: '密碼更新成功' });

  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ── 匯出路由 ─────────────────────────────────────────────────
// 讓 server.js 可以用 require('./routes/auth') 載入這個路由模組
module.exports = router;
