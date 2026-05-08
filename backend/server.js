require('dotenv').config();

// 啟動時驗證必要環境變數
['JWT_SECRET', 'DATABASE_URL'].forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ 缺少必要的環境變數：${key}`);
    process.exit(1);
  }
});

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// 正式環境同源不需要 CORS；本機開發允許 Vite dev server
const corsOrigin = process.env.NODE_ENV === 'production'
  ? (process.env.CORS_ORIGIN || false)
  : 'http://localhost:5173';
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// 登入防暴力破解：15 分鐘內最多嘗試 10 次
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '嘗試次數過多，請 15 分鐘後再試' },
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/carousel', require('./routes/carousel'));
app.use('/api/news', require('./routes/news'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/registration', require('./routes/registration'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/settings', require('./routes/settings'));

// 正式環境：Node.js 同時服務前端靜態檔案（build 後才存在）
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 後端伺服器啟動於 http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ 資料庫初始化失敗：', err.message);
    process.exit(1);
  });
