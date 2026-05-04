const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

// 設定圖片上傳的儲存位置和檔名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 避免中文檔名問題，用時間戳記命名
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `img_${Date.now()}${ext}`);
  },
});

// 只接受圖片格式
const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('只接受 JPG、PNG、GIF、WebP 格式的圖片'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 最大 5MB
});

// POST /api/upload — 後台：上傳圖片（需要登入）
router.post('/', auth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '請選擇要上傳的圖片' });
  }

  // 回傳可供前端使用的圖片網址
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: imageUrl, filename: req.file.filename });
});

// 錯誤處理
router.use((err, req, res, next) => {
  res.status(400).json({ message: err.message });
});

module.exports = router;
