// ============================================================
// 【檔案說明】server.js — Express 後端應用程式的入口點（主程式）
//
// 這個檔案做了以下幾件事：
//   1. 載入環境變數（.env 設定檔）
//   2. 建立 Express 應用程式
//   3. 設定 middleware（中介軟體）：CORS、JSON 解析、速率限制
//   4. 掛載各功能路由（auth、carousel、news…）
//   5. 如果是正式環境，同時服務前端靜態檔案
//   6. 初始化資料庫後啟動伺服器監聽
//
// 學習重點：
//   - require() 是 Node.js 載入模組的方式，相當於 import
//   - app.use() 用來「掛載」middleware 或路由
//   - 非同步的資料庫初始化用 Promise 的 .then()/.catch() 處理
// ============================================================

// dotenv 套件會讀取專案根目錄的 .env 檔案，
// 把裡面的 KEY=VALUE 載入到 process.env 物件，
// 這樣整個應用程式都可以用 process.env.KEY 取得設定值。
require('dotenv').config();

// ── 啟動時驗證必要環境變數 ──────────────────────────────────
// 用陣列列出「一定要存在」的環境變數名稱，
// forEach 逐一檢查，任何一個缺少就印錯誤訊息並強制結束程式（exit code 1 = 異常結束）。
// 這樣能在開發初期就發現設定錯誤，而不是等到執行中才崩潰。
['JWT_SECRET', 'DATABASE_URL'].forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ 缺少必要的環境變數：${key}`);
    process.exit(1); // process.exit(1) = 立刻終止 Node.js 程序，回傳錯誤碼 1
  }
});

// ── 載入套件（第三方模組）───────────────────────────────────
const express = require('express');          // Express：Node.js 最主流的 Web 框架
const cors = require('cors');                // cors：處理「跨來源資源共享」問題
const path = require('path');               // path：Node.js 內建，處理檔案路徑
const fs = require('fs');                   // fs：Node.js 內建，讀寫檔案系統
const rateLimit = require('express-rate-limit'); // express-rate-limit：限制同一 IP 的請求次數
const { initDb } = require('./db');          // 從 db.js 解構取出 initDb 函式，用來初始化資料庫

// ── 建立 Express 應用程式實例 ─────────────────────────────────
// express() 會回傳一個 app 物件，後面所有路由、middleware 都掛在這個物件上
const app = express();

// PORT：伺服器要監聽的通訊埠號
// process.env.PORT 讓雲端平台（如 Render）自行指定埠號；本機開發預設用 3001
const PORT = process.env.PORT || 3001;

// ── CORS 設定 ─────────────────────────────────────────────────
// CORS（Cross-Origin Resource Sharing，跨來源資源共享）：
// 瀏覽器的安全機制，預設不允許 A 網域的前端去呼叫 B 網域的後端 API。
// 我們必須在後端明確告訴瀏覽器「哪些來源可以存取」。
//
// 正式環境：前端和後端同網域，不需要開放跨域（origin: false）；
//           也可以透過 CORS_ORIGIN 環境變數指定允許的網域。
// 開發環境：前端由 Vite dev server 跑在 localhost:5173，後端在 localhost:3001，
//           兩個埠號不同就屬於不同「來源」，所以要明確允許。
const corsOrigin = process.env.NODE_ENV === 'production'
  ? (process.env.CORS_ORIGIN || false)   // 正式環境
  : 'http://localhost:5173';             // 本機開發

// app.use() 掛載 middleware，每個請求都會先經過這裡
app.use(cors({ origin: corsOrigin }));

// express.json() 是內建 middleware，
// 它會自動把請求 body 中的 JSON 字串解析成 JavaScript 物件，
// 這樣在路由處理函式中才能用 req.body.xxx 取得資料。
app.use(express.json());

// ── 速率限制（Rate Limiting）設定 ──────────────────────────────
// Rate Limiting 的作用：限制同一個 IP 位址在一段時間內的請求次數。
// 目的：防止以下攻擊行為：
//   - 暴力破解（Brute Force）：不斷嘗試不同密碼
//   - 垃圾表單（Form Spam）：程式自動大量送出報名
//   - 配額耗盡（Quota Abuse）：惡意上傳大量檔案榨乾 Cloudinary 免費配額
//
// HTTP 429 Too Many Requests：超過速率限制時回傳的標準狀態碼。
// standardHeaders: true → 在回應 Headers 加入 RateLimit-* 標準欄位。
// legacyHeaders: false  → 不用舊版的 X-RateLimit-* 格式。

// 登入：防暴力破解（15 分鐘最多 10 次）
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000, // 時間窗口：15 分鐘（毫秒）
  max: 10,                  // 同一 IP 在窗口內最多 10 次請求
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '嘗試次數過多，請 15 分鐘後再試' },
}));

// 報名：防止程式自動大量送出垃圾報名（10 分鐘最多 5 次）
// 理由：真實使用者不可能在 10 分鐘內報名 5 次以上
app.use('/api/registration', rateLimit({
  windowMs: 10 * 60 * 1000, // 時間窗口：10 分鐘
  max: 5,                   // 同一 IP 在 10 分鐘內最多 5 筆報名
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '提交次數過多，請稍後再試' },
  // skip：只對 POST 請求（送出報名）限制，GET 請求（後台查詢）不受影響
  skip: (req) => req.method !== 'POST',
}));

// 上傳：防止惡意耗盡 Cloudinary 免費配額（1 小時最多 30 次）
// Cloudinary 免費方案每月有上傳次數限制，需要保護
app.use('/api/upload', rateLimit({
  windowMs: 60 * 60 * 1000, // 時間窗口：1 小時
  max: 30,                  // 同一 IP 每小時最多上傳 30 次
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '上傳次數超過限制，請稍後再試' },
}));

// ── 掛載 API 路由 ─────────────────────────────────────────────
// app.use(路徑前綴, 路由模組) 的意思：
// 當請求 URL 以這個路徑前綴開頭時，交由對應的路由模組處理。
//
// 例如：前端送出 GET /api/news
//   → 因為前綴是 '/api/news'，所以交給 routes/news.js
//   → news.js 裡的 router.get('/') 就會處理這個請求
app.use('/api/auth', require('./routes/auth'));               // 登入、改密碼
app.use('/api/carousel', require('./routes/carousel'));       // 輪播圖管理
app.use('/api/news', require('./routes/news'));               // 最新消息管理
app.use('/api/activities', require('./routes/activities'));   // 活動管理
app.use('/api/registration', require('./routes/registration')); // 活動報名
app.use('/api/upload', require('./routes/upload'));           // 檔案上傳
app.use('/api/settings', require('./routes/settings'));       // 網站設定

// ── 正式環境：服務前端靜態檔案 ───────────────────────────────
// 在 Render 等雲端平台上，前端和後端跑在同一個 Node.js 程序，
// Node.js 除了提供 API 之外，也負責把前端 build 出來的 HTML/CSS/JS 傳給瀏覽器。
//
// path.join(__dirname, '../frontend/dist')：
//   __dirname 是當前檔案所在目錄（backend/）
//   '../frontend/dist' 回到上一層再進 frontend/dist
//
// fs.existsSync()：同步檢查路徑是否存在（只在 build 後才有 dist 資料夾）
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  // express.static()：讓 Express 把這個資料夾當作靜態檔案服務目錄
  // 例如請求 /assets/main.js 就會回傳 frontend/dist/assets/main.js
  app.use(express.static(frontendDist));

  // 這個「萬用路由」必須放在所有 API 路由之後，
  // 當請求不符合任何 API 路由時（例如前端 React Router 的路徑），
  // 統一回傳 index.html，讓前端 React 去判斷要顯示哪個頁面。
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// ── 初始化資料庫後啟動伺服器 ─────────────────────────────────
// initDb() 是非同步函式，回傳一個 Promise。
// .then()：Promise 成功（資料庫初始化完成）後執行，啟動 HTTP 伺服器。
// .catch()：Promise 失敗（資料庫初始化失敗）後執行，印出錯誤並結束程序。
//
// app.listen(PORT, callback)：
//   讓 Express 開始監聽指定埠號，
//   當有 HTTP 請求進來時，Express 就會處理它。
//   callback 是伺服器成功啟動後執行的函式。
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 後端伺服器啟動於 http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ 資料庫初始化失敗：', err.message);
    process.exit(1); // 資料庫連不上，整個後端無法正常運作，直接結束程序
  });
