// ============================================================
// 【檔案說明】routes/upload.js — 檔案上傳 API 路由
//
// 提供以下 API 端點：
//   POST /api/upload  → 後台：上傳圖片或影片到 Cloudinary（需登入）
//
// 整體流程：
//   1. 前端送出 multipart/form-data 格式的檔案
//   2. multer middleware 接收並暫存到記憶體（不寫入磁碟）
//   3. 驗證檔案類型（只接受圖片和影片格式）
//   4. 把檔案串流上傳到 Cloudinary（雲端圖片/影片服務）
//   5. 回傳 Cloudinary 提供的公開 URL 給前端使用
//
// 學習重點：
//   - multer：處理 multipart/form-data（檔案上傳）的 middleware
//   - Cloudinary：雲端媒體儲存服務，上傳後回傳 CDN URL
//   - Promise 包裝 Callback：把舊式的 callback 風格轉換成可以 await 的 Promise
//   - Stream（串流）：不用把整個檔案讀進記憶體，分段傳輸（適合大檔案）
//   - 錯誤處理 middleware：Express 的四個參數錯誤處理格式 (err, req, res, next)
// ============================================================

// ── 載入必要模組 ─────────────────────────────────────────────
const express = require('express');
const router = express.Router();

// multer：處理 HTTP multipart/form-data 的 middleware，
// 這是上傳檔案時瀏覽器使用的資料格式（和 JSON 不同，需要專門的解析器）
const multer = require('multer');

// path：Node.js 內建模組，用來處理和解析檔案路徑
const path = require('path');

// cloudinary：Cloudinary 的 Node.js SDK
// .v2 表示使用第 2 版的 API（現在的標準版本）
const cloudinary = require('cloudinary').v2;

// auth：JWT 身份驗證 middleware（只有管理員才能上傳檔案）
const auth = require('../middleware/auth');

// ── 設定 Cloudinary 連線 ─────────────────────────────────────
// 從環境變數讀取 Cloudinary 的帳號資訊。
// 這三個值可以在 Cloudinary 官網的 Dashboard 找到。
// 一定要放在環境變數中，不能直接寫在程式碼裡（避免外洩）！
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Cloudinary 帳號名稱
  api_key: process.env.CLOUDINARY_API_KEY,       // API 金鑰（公開部分）
  api_secret: process.env.CLOUDINARY_API_SECRET, // API 秘鑰（務必保密！）
});

// ── 定義允許的檔案格式 ───────────────────────────────────────
// 把允許的副檔名分成兩類，方便後面判斷上傳類型
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']; // 圖片格式
const VIDEO_EXTS = ['.mp4', '.webm', '.mov'];                  // 影片格式

// ── Magic Bytes（魔術位元組）偵測函式 ──────────────────────────
//
// 問題背景：
//   HTTP 請求裡的 Content-Type（即 multer 的 file.mimetype）是由「瀏覽器或攻擊者」
//   提供的，可以輕易偽造。攻擊者可以把一個 .exe 惡意程式的 Content-Type
//   設成 image/jpeg，就能繞過只檢查 mimetype 的過濾器。
//
// 解決方法：讀取檔案的「Magic Bytes」（魔術位元組）
//   每種檔案格式在檔案最開頭都有固定的二進位數值（十六進位），
//   像 DNA 指紋一樣，是檔案內容的一部分，比 MIME type 更難偽造。
//
//   常見格式的 Magic Bytes（十六進位）：
//     JPEG:  FF D8 FF
//     PNG:   89 50 4E 47（即 \x89PNG）
//     GIF:   47 49 46 38（即 GIF8）
//     WebP:  52 49 46 46 .. .. .. .. 57 45 42 50（RIFF....WEBP）
//     MP4:   ?? ?? ?? ?? 66 74 79 70（第 4-7 位元組是 ftyp box 標記）
//     WebM:  1A 45 DF A3（EBML 格式標記）
//
// 參數：buffer (Buffer) — multer memoryStorage 儲存的檔案二進位資料
// 回傳：偵測到的 MIME 類型字串，若無法識別則回傳 null
function detectMimeFromBuffer(buffer) {
  // 至少需要 12 個位元組才能可靠地識別所有格式
  if (!buffer || buffer.length < 12) return null;

  // JPEG：開頭固定是 FF D8 FF（三個位元組）
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'image/jpeg';

  // PNG：開頭固定是 89 50 4E 47（即 ASCII 的 \x89PNG）
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return 'image/png';

  // GIF：開頭固定是 47 49 46 38（即 ASCII 的 GIF8，包含 GIF87a 和 GIF89a）
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return 'image/gif';

  // WebP：位元組 0-3 是 RIFF，位元組 8-11 是 WEBP
  //   完整格式：52 49 46 46 [4 bytes size] 57 45 42 50
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) return 'image/webp';

  // MP4：第 4-7 位元組是 ftyp box（幾乎所有 MP4/M4V 都有這個標記）
  //   66 74 79 70 = ASCII 的 "ftyp"
  if (buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) return 'video/mp4';

  // WebM：開頭是 1A 45 DF A3（EBML 格式的 Header 標記）
  if (buffer[0] === 0x1A && buffer[1] === 0x45 && buffer[2] === 0xDF && buffer[3] === 0xA3) return 'video/webm';

  return null; // 無法識別的格式 → 拒絕
}

// ── 允許的真實 MIME 類型（對應 Magic Bytes 偵測結果）────────────
// 這份清單對應 detectMimeFromBuffer() 可能回傳的值，
// 用來比對偵測結果是否在允許範圍內
const ALLOWED_REAL_MIMES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm',
];

// ── 自訂 multer 檔案篩選器 ───────────────────────────────────
// fileFilter 是 multer 的設定選項：
//   每次有檔案要上傳，multer 會呼叫這個函式，讓我們決定是否接受
//   cb(null, true)  → 接受這個檔案（第一個參數是錯誤，null 表示沒有錯誤）
//   cb(new Error()) → 拒絕這個檔案，並傳遞錯誤
const fileFilter = (req, file, cb) => {
  // path.extname(filename)：取得檔案的副檔名
  //   例如 'photo.JPG' → '.JPG'
  // .toLowerCase()：轉小寫，讓 '.JPG' 和 '.jpg' 視為相同
  const ext = path.extname(file.originalname).toLowerCase();

  // [...IMAGE_EXTS, ...VIDEO_EXTS]：展開運算子，合併兩個陣列
  //   = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.mov']
  // .includes(ext)：檢查 ext 是否在允許清單中
  if ([...IMAGE_EXTS, ...VIDEO_EXTS].includes(ext)) cb(null, true); // 接受
  else cb(new Error('只接受圖片（JPG/PNG/GIF/WebP）或影片（MP4/WebM/MOV）格式')); // 拒絕
};

// ── 建立 multer 上傳實例 ─────────────────────────────────────
// multer({...}) 回傳一個設定好的 middleware
const upload = multer({
  // storage: multer.memoryStorage()：
  //   把上傳的檔案儲存在「記憶體」中（不寫到磁碟）。
  //   好處：不需要管理暫存檔案的清除；適合後續馬上再轉上傳給 Cloudinary。
  //   代價：檔案會佔用 Node.js 程序的記憶體，大檔案要小心。
  storage: multer.memoryStorage(),

  fileFilter, // 套用上面定義的檔案類型篩選器

  limits: {
    fileSize: 200 * 1024 * 1024, // 最大檔案大小：200MB（200 * 1024KB * 1024B）
  },
});

// ============================================================
// POST /api/upload — 後台：上傳圖片或影片
//
// Middleware 鏈（中介軟體鏈）：
//   router.post(路徑, middleware1, middleware2, ..., 最終處理函式)
//   每個 middleware 依序執行，都通過才到最終處理函式。
//
//   這裡的順序：
//   1. auth：驗證 JWT Token，確保使用者已登入
//   2. upload.single('image')：解析 multipart/form-data，
//      從 form-data 中取出名為 'image' 的那個檔案，存到 req.file
//   3. async (req, res) => {...}：主要的處理函式
//
// 前端送出的格式（FormData）：
//   const formData = new FormData();
//   formData.append('image', fileInput.files[0]); // 'image' 要和 upload.single('image') 對應
// ============================================================
router.post('/', auth, upload.single('image'), async (req, res) => {
  // 如果 multer 沒有解析到檔案（前端沒有附上檔案），req.file 會是 undefined
  if (!req.file) return res.status(400).json({ message: '請選擇要上傳的檔案' });

  // ── Magic Bytes 驗證（防偽裝攻擊）────────────────────────────
  // 第一道防線（multer fileFilter）只檢查副檔名，可被繞過。
  // 第二道防線（這裡）讀取檔案二進位內容的前幾個位元組，
  // 確認「檔案實際上是什麼格式」，和「宣稱的格式」一致。
  const realMime = detectMimeFromBuffer(req.file.buffer);
  if (!realMime || !ALLOWED_REAL_MIMES.includes(realMime)) {
    // 偵測失敗或格式不在允許清單 → 拒絕上傳
    return res.status(400).json({ message: '檔案格式驗證失敗，僅接受圖片（JPG/PNG/GIF/WebP）或影片（MP4/WebM）' });
  }

  try {
    // ── 把檔案串流上傳到 Cloudinary ──────────────────────────
    // cloudinary.uploader.upload_stream() 使用的是 callback 風格（舊式非同步）：
    //   upload_stream(options, callback).end(buffer)
    //   callback 的格式：(error, result) => {}
    //
    // 問題：我們想用 await，但 upload_stream 不回傳 Promise
    // 解決：把它「包裝」在 new Promise() 裡，手動控制 resolve/reject
    //
    // new Promise((resolve, reject) => {...})：
    //   resolve(value)：Promise 成功，把 value 傳給 .then() 或 await 的回傳值
    //   reject(error)：Promise 失敗，把 error 傳給 .catch() 或 try/catch
    // 用 realMime（已驗證的真實 MIME）判斷 Cloudinary 的 resource_type，更可靠
    const isVideo = realMime.startsWith('video/');

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'temple-website',  // 在 Cloudinary 上的資料夾名稱（方便管理）
          resource_type: isVideo ? 'video' : 'image', // 告訴 Cloudinary 這是圖片還是影片
        },
        // Callback 函式：Cloudinary 上傳完成後呼叫
        (error, result) => {
          if (error) reject(error);   // 上傳失敗，把錯誤傳給 Promise 的 reject
          else resolve(result);        // 上傳成功，把結果傳給 Promise 的 resolve
        }
      ).end(req.file.buffer);
      // .end(buffer)：把記憶體中的檔案資料送出去（啟動串流上傳）
      // req.file.buffer：multer memoryStorage 把檔案暫存在記憶體中的 Buffer 物件
    });

    // 上傳成功，result.secure_url 是 Cloudinary 提供的 HTTPS URL
    // result.public_id 是檔案在 Cloudinary 中的唯一識別碼（可用來刪除）
    res.json({ url: result.secure_url, filename: result.public_id });

  } catch (err) {
    // 上傳失敗（網路問題、Cloudinary 服務問題等）
    res.status(500).json({ message: '上傳失敗：' + err.message });
  }
});

// ── 錯誤處理 Middleware ───────────────────────────────────────
// Express 的錯誤處理 middleware 固定是四個參數：(err, req, res, next)
// 有四個參數時，Express 才會把它當成「錯誤處理 middleware」。
//
// 這裡用來捕捉 multer 拋出的錯誤：
//   - 檔案類型不符合（fileFilter 拒絕）
//   - 檔案太大（超過 fileSize 限制）
// 這類錯誤屬於客戶端的錯誤，所以回傳 400 Bad Request
router.use((err, req, res, next) => {
  res.status(400).json({ message: err.message });
});

// ── 匯出路由 ─────────────────────────────────────────────────
module.exports = router;
