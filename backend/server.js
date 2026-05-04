require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// 允許前端（localhost:5173）送來的請求
app.use(cors());
app.use(express.json());

// 讓前端可以直接讀取上傳的圖片，網址像是 http://localhost:3001/uploads/xxx.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 初始化資料庫（建立資料表 + 預設資料）
initDb();

// 掛載各功能的路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/carousel', require('./routes/carousel'));
app.use('/api/news', require('./routes/news'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/registration', require('./routes/registration'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/settings', require('./routes/settings'));

app.listen(PORT, () => {
  console.log(`🚀 後端伺服器啟動於 http://localhost:${PORT}`);
});
