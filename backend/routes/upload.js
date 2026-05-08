const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const auth = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const VIDEO_EXTS = ['.mp4', '.webm', '.mov'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if ([...IMAGE_EXTS, ...VIDEO_EXTS].includes(ext)) cb(null, true);
  else cb(new Error('只接受圖片（JPG/PNG/GIF/WebP）或影片（MP4/WebM/MOV）格式'));
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 圖片或影片最大 200MB
});

// POST /api/upload
router.post('/', auth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: '請選擇要上傳的檔案' });

  const ext = path.extname(req.file.originalname).toLowerCase();
  const isVideo = VIDEO_EXTS.includes(ext);

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'temple-website',
          resource_type: isVideo ? 'video' : 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });
    res.json({ url: result.secure_url, filename: result.public_id });
  } catch (err) {
    res.status(500).json({ message: '上傳失敗：' + err.message });
  }
});

router.use((err, req, res, next) => {
  res.status(400).json({ message: err.message });
});

module.exports = router;
