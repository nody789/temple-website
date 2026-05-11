// ============================================================
// 【檔案說明】middleware/auth.js — JWT 身份驗證 Middleware（中介軟體）
//
// 什麼是 Middleware（中介軟體）？
//   Middleware 是在「收到請求」和「執行路由處理函式」之間執行的函式。
//   就像保全人員一樣：請求進門前要先驗證身份，通過才放行。
//
// 什麼是 JWT（JSON Web Token）？
//   JWT 是一種身份驗證令牌（Token）的格式，由三部分組成：
//     Header.Payload.Signature
//   - Header：演算法類型（HS256 等）
//   - Payload：使用者資訊（id、username），不含機密資料
//   - Signature：用伺服器的 JWT_SECRET 加密，防止偽造
//
//   登入成功後，後端產生 JWT Token 給前端；
//   前端之後每次請求都在 HTTP Header 帶上 Token，
//   後端用這個 middleware 驗證 Token 是否有效。
//
// 這個 middleware 的工作流程：
//   1. 從請求的 Authorization Header 取出 Token
//   2. 驗證 Token 合法性（沒有被竄改、尚未過期）
//   3. 合法：解出使用者資訊存在 req.user，呼叫 next() 放行
//   4. 不合法：直接回傳 401 Unauthorized，拒絕請求
// ============================================================

// jsonwebtoken 套件：用來產生（sign）和驗證（verify）JWT Token
const jwt = require('jsonwebtoken');

// ── 匯出這個 Middleware 函式 ──────────────────────────────────
// module.exports = (req, res, next) => {}：
//   直接匯出一個函式（不是物件），其他路由檔 require 進來就是這個函式。
//
// Express middleware 的三個固定參數：
//   req（Request）：包含請求的所有資訊（headers、body、params…）
//   res（Response）：用來回傳回應給客戶端
//   next：呼叫 next() 表示「通過這個 middleware，繼續往下執行」
module.exports = (req, res, next) => {

  // ── 第一步：從 HTTP Header 取出授權資訊 ─────────────────────
  // HTTP Authorization Header 的標準格式：「Bearer <token>」
  // 例如：Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
  const authHeader = req.headers.authorization;

  // 檢查是否有 Authorization Header，且格式是否以 'Bearer ' 開頭
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // return 讓函式提前結束，不繼續往下執行
    // res.status(401)：HTTP 狀態碼 401 = Unauthorized（未授權）
    // .json({ message: ... })：回傳 JSON 格式的錯誤訊息
    return res.status(401).json({ message: '未授權，請先登入' });
  }

  // ── 第二步：從 Header 字串中截取出 Token ────────────────────
  // authHeader 格式：'Bearer eyJhbGciOi...'
  // .split(' ') → ['Bearer', 'eyJhbGciOi...']
  // [1] → 取出索引 1 的元素，也就是 Token 本身
  const token = authHeader.split(' ')[1];

  // ── 第三步：驗證 Token ────────────────────────────────────────
  // 用 try/catch 包住可能拋出錯誤的程式碼
  try {
    // jwt.verify(token, secret)：
    //   用 JWT_SECRET 驗證 Token 的 Signature 是否正確，
    //   同時確認 Token 是否在有效期限內（expiresIn）。
    //   驗證成功會回傳 Payload 物件（包含 id、username 等資訊）。
    //   驗證失敗（Token 被竄改或已過期）會拋出例外（Exception）。
    //
    // 把 Payload 存在 req.user，後續的路由處理函式就能用 req.user.id 取得使用者 ID
    req.user = jwt.verify(token, process.env.JWT_SECRET);

    // next()：呼叫 next 表示「驗證通過，請繼續執行後面的路由處理函式」
    next();
  } catch {
    // Token 無效（被竄改）或已過期時，jwt.verify 會拋出例外，被 catch 捕捉到
    // 回傳 401 Unauthorized，前端收到後應導向登入頁
    res.status(401).json({ message: 'Token 無效或已過期，請重新登入' });
  }
};
