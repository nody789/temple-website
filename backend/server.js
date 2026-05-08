require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/carousel', require('./routes/carousel'));
app.use('/api/news', require('./routes/news'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/registration', require('./routes/registration'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/settings', require('./routes/settings'));

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
