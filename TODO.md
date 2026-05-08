# 待辦事項

## 正式上線後資料備份

### 資料庫（Neon PostgreSQL）
- [ ] Neon 免費版內建 **7 天自動備份**，無需額外設定
- [ ] 重要資料更新前，手動到 Neon Dashboard → Branches → Restore 確認快照存在
- [ ] 若需完整備份，在本機執行：
  ```
  pg_dump "你的 DATABASE_URL" > backup_YYYYMMDD.sql
  ```
  並將 .sql 檔存到 Google Drive / 隨身碟

### 圖片（Cloudinary）
- [ ] Cloudinary 圖片永久儲存，不會自動刪除，無需額外備份
- [ ] 若需備份，至 Cloudinary Dashboard → Media Library → 全選 → Download ZIP

---

## 填入環境變數憑證（本機開發）

- [ ] `backend/.env` — 將 `DATABASE_URL` 改為本機 PostgreSQL 連線字串
  - 範例：`postgresql://postgres:你的密碼@localhost:5432/temple_db`
  - 需先在 PostgreSQL 建立資料庫 `temple_db`
- [ ] `backend/.env` — 至 [cloudinary.com](https://cloudinary.com) 申請免費帳號，填入：
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

---

## 正式上線

- [ ] Railway 後台新增 PostgreSQL Plugin
- [ ] Railway 環境變數填入 `DATABASE_URL`（Railway 自動提供）+ `JWT_SECRET`（換強密碼）+ Cloudinary 三個變數
- [ ] `backend/server.js` — 新增服務前端靜態檔案的程式碼（見 HOSTING_GUIDE.md）
- [ ] 本機執行 `cd frontend && npm run build`
- [ ] 推送到 GitHub，Railway 自動部署
- [ ] 驗收：前台 / 後台 / 圖片 / HTTPS 全部確認正常

---

## 網域（上線後）

- [ ] 向廟方收集法人文件（見 HOSTING_GUIDE.md）
- [ ] 網路中文申請 `.org.tw` 網域
- [ ] Railway 綁定自訂網域 + DNS 設定
