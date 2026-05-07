# 待辦事項

## 資料庫遷移：SQLite → MariaDB

### 本機準備
- [ ] Navicat 建立資料庫 `temple_db`（utf8mb4_unicode_ci）
- [ ] 確認本機 MariaDB 帳號密碼（root / ?）

### 程式碼修改
- [ ] `backend/package.json` — 新增 `mysql2`，移除 `better-sqlite3`
- [ ] `backend/.env` — 新增 MariaDB 連線設定（DB_HOST / DB_USER / DB_PASS / DB_NAME）
- [ ] `backend/db.js` — 改成 mysql2 連線池，自動建表語法移過來
- [ ] `backend/routes/auth.js` — 查詢改 async/await
- [ ] `backend/routes/carousel.js` — 查詢改 async/await
- [ ] `backend/routes/news.js` — 查詢改 async/await
- [ ] `backend/routes/activities.js` — 查詢改 async/await
- [ ] `backend/routes/registration.js` — 查詢改 async/await
- [ ] `backend/routes/settings.js` — 查詢改 async/await

### 測試
- [ ] 本機啟動後端，確認自動建表成功
- [ ] 測試登入 / 登出
- [ ] 測試各功能 CRUD（消息、活動、報名、輪播、設定）

---

## 圖片儲存：本機 → Cloudinary

> Railway 重新部署會清空 `backend/uploads/`，需改用雲端儲存

- [ ] 申請 Cloudinary 免費帳號（25GB 免費）
- [ ] `backend/.env` — 新增 Cloudinary 設定（CLOUD_NAME / API_KEY / API_SECRET）
- [ ] `backend/routes/upload.js` — 改用 Cloudinary SDK 上傳
- [ ] 前端圖片 URL 改為 Cloudinary 網址格式
- [ ] 測試圖片上傳 / 顯示

---

## 正式上線

- [ ] Railway 後台新增 MySQL Plugin
- [ ] Railway 環境變數填入 DB 連線資訊 + JWT_SECRET（換強密碼）
- [ ] `backend/server.js` — 新增服務前端靜態檔案的程式碼（見 HOSTING_GUIDE.md）
- [ ] 本機執行 `cd frontend && npm run build`
- [ ] 推送到 GitHub，Railway 自動部署
- [ ] 驗收：前台 / 後台 / 圖片 / HTTPS 全部確認正常

---

## 網域（上線後）

- [ ] 向廟方收集法人文件（見 HOSTING_GUIDE.md）
- [ ] 網路中文申請 `.org.tw` 網域
- [ ] Railway 綁定自訂網域 + DNS 設定
