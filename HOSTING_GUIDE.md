# 廟宇網站上線流程指南

---

## 費用總覽（每年大約多少錢）

| 項目 | 費用 | 備注 |
|------|------|------|
| `.org.tw` 網域 | NT$350–500 / 年 | 向網路中文申請，需法人文件 |
| 主機（Railway） | NT$1,920 / 年（$5 美元/月） | 跑 Node.js，無需管 Linux |
| 資料庫（Neon） | **免費** | PostgreSQL 雲端，500MB 免費額度 |
| 圖片／影片（Cloudinary） | **免費** | 25GB 免費，永久儲存 |
| SSL 憑證 | **免費** | Railway 自動處理 |
| **每年合計** | **約 NT$2,300–2,400 / 年** | |

> 換算說明：$5 美元 × 12 個月 × 32 匯率 ≈ NT$1,920

---

## 架構說明

```
本機開發中：
  瀏覽器 → Vite (port 5173) → proxy → Node.js (port 3001) → Neon DB
                                                            → Cloudinary（圖片／影片）

正式上線後：
  瀏覽器 → https://廟名.org.tw（Railway）
         ├─ /api/*  → Node.js 處理（讀寫 Neon DB、Cloudinary）
         └─ 其他    → React 靜態檔案（frontend/dist/）
```

**前端程式碼不需要改**：`frontend/src/api/index.js` 的 `baseURL: '/api'` 上線後繼續有效。

---

## 暫時預覽部署（Render 免費版）

> 適用情境：廟方資料還沒拿到、還不能申請網域，但需要先讓別人看到網站。
> 完全免費、不需要信用卡，約 5 分鐘完成。

### 前置條件確認（已完成）

- [x] 程式碼已推到 GitHub（`nody789/temple-website`）
- [x] Neon PostgreSQL 已設定（`DATABASE_URL` 已填入 `.env`）
- [x] Cloudinary 已設定（圖片上傳功能可用）

---

### 步驟一：在 Render 建立服務

1. 前往 **[render.com](https://render.com)**，用 GitHub 帳號登入
2. 點右上角 **New +** → **Web Service**
3. 選擇 `nody789/temple-website` → **Connect**

---

### 步驟二：填入基本設定

| 欄位 | 填入的值 |
|------|---------|
| **Name** | `temple-website`（可自訂） |
| **Environment** | `Node` |
| **Build Command** | `npm run build` |
| **Start Command** | `cd backend && node server.js` |
| **Plan** | `Free` |

---

### 步驟三：加入環境變數

在頁面下方 **Environment Variables** 區塊，逐一新增以下 6 個：

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `jJNLexaXc397qoIyC4p8PlR1zvQMuBKTDYrOgGwhH5Wm20dU` |
| `DATABASE_URL` | 貼上 `.env` 裡的 Neon 連線字串（postgresql://... 那串） |
| `CLOUDINARY_CLOUD_NAME` | `ddo3uxgeh` |
| `CLOUDINARY_API_KEY` | `996496426587827` |
| `CLOUDINARY_API_SECRET` | 貼上 `.env` 裡的 `CLOUDINARY_API_SECRET` 值 |

> **JWT_SECRET 說明**：上方的值是已重新產生的安全版本，請用這個，不要用 `.env` 裡的舊值。

---

### 步驟四：部署

點 **Create Web Service**，等待 3–5 分鐘。

---

### 網址在哪裡看

部署完成後，Render 頁面**右上角**會出現：

```
https://temple-website-xxxx.onrender.com
```

點那個連結就是公開的網站，可以直接把這個網址傳給別人。

後台管理：`https://temple-website-xxxx.onrender.com/admin/login`

---

### 注意事項

- **冷啟動**：Render 免費版閒置 15 分鐘後進入休眠，第一次訪問需等約 30 秒喚醒，之後正常。
- **資料不會消失**：資料存在 Neon，重新部署或休眠都不影響資料。
- **等正式上線再切換**：拿到廟方資料後，按下方「完整上線步驟」改用 Railway + 自訂網域。

---

## 完整上線步驟（照順序做）

### 階段一：向廟方收集資料

- [ ] 請廟方提供：
  - 財團法人登記證書（影本即可）
  - 統一編號
  - 法人代表人姓名、電話、地址
  - 廟方官方 Email（沒有的話先用代表人個人信箱）

---

### 階段二：申請網域（約 10–20 分鐘）

1. 前往 **網路中文 Netchinese**（搜尋 netchinese.com）
2. 搜尋想要的 `.org.tw` 網域，例如 `xxtemple.org.tw`
3. 填寫申請人資料：**填廟方法人資料，不是個人**
4. 上傳財團法人登記證書（`.org.tw` 需人工審核）
5. 付款（年費約 NT$350–500）
6. 等待審核通過（通常 1–3 個工作天）

---

### 階段三：準備 Railway 上的環境變數

上線前在 Railway 後台設定以下環境變數（Settings → Variables）：

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `JWT_SECRET` | 至少 32 字元的隨機字串 | `k9x$mP2#qL8vN5wR7jT0aZ3eB6hC1dF4` |
| `DATABASE_URL` | 從 Neon Dashboard 複製 Connection String | `postgresql://...@neon.tech/neondb?sslmode=require` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard 的 Cloud name | `ddo3uxgeh` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `996496...` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `Ls3La3...` |
| `NODE_ENV` | 正式環境標記 | `production` |

> ⚠️ **JWT_SECRET 一定要換**，目前預設值任何人都可以偽造登入 token。

---

### 階段四：部署到 Railway（約 15 分鐘）

1. 前往 **railway.app**，用 GitHub 帳號登入
2. 點「New Project」→「Deploy from GitHub repo」
3. 選擇這個專案的 repo
4. Railway 會讀取 `railway.json`，自動執行：
   - **Build**：`npm run build`（安裝套件 + 建立 `frontend/dist/`）
   - **Start**：`node backend/server.js`
5. 在 Railway 後台 → Settings → Variables，填入階段三的所有環境變數
6. 重新部署（Redeploy）
7. 點「Settings」→「Networking」→「Generate Domain」，取得暫時網址確認能正常存取

> Railway 偵測到的 `DATABASE_URL` 可直接從 Neon Dashboard 的 Connection Details 頁面複製「Connection string」。

---

### 階段五：綁定自訂網域

1. **Railway 這邊**：
   - Settings → Networking → Custom Domain
   - 輸入你的網域，例如 `xxtemple.org.tw`
   - Railway 會給你一個 CNAME 目標，例如 `xxxxxxx.railway.app`

2. **網路中文這邊**：
   - 進入網域管理後台 → DNS 設定
   - 新增一筆 CNAME record：
     ```
     主機名稱：@（代表根網域）
     指向：Railway 給的 CNAME 位址
     TTL：3600
     ```

3. 等待 DNS 生效（約 5 分鐘–24 小時）
4. Railway 自動啟用 HTTPS（免費 SSL）

---

### 階段六：驗收上線

- [ ] 用手機和電腦分別開啟網站，確認畫面正常
- [ ] 前台：輪播圖、最新消息、活動列表、線上報名
- [ ] 後台：`https://廟名.org.tw/admin/login` 能否登入
- [ ] 確認圖片可以正常上傳與顯示（Cloudinary）
- [ ] 確認 HTTPS 鎖頭出現
- [ ] 登入後到「網站設定」更改管理員密碼

---

## 常見問題

**Q：網域審核需要多久？**
`.org.tw` 需要人工審核財團法人文件，通常 1–3 個工作天。

**Q：Railway 免費嗎？**
有免費額度，但低流量網站可能不夠穩定。建議直接使用付費方案（$5 美元/月）確保不中斷。

**Q：資料庫怎麼備份？**
使用 Neon 免費版，內建 **7 天自動備份**，無需額外設定。需要手動備份時，在本機執行：
```bash
pg_dump "你的 DATABASE_URL" > backup_YYYYMMDD.sql
```

**Q：圖片和影片怎麼備份？**
Cloudinary 永久儲存，不會因為重新部署而消失。需要備份時，至 Cloudinary Dashboard → Media Library → 全選 → Download ZIP。

**Q：重新部署會清掉資料嗎？**
不會。資料存在 Neon（雲端 PostgreSQL），圖片存在 Cloudinary，兩者都獨立於 Railway，重新部署不影響任何資料。

**Q：如何更換建廟過程影片？**
後台 → 網站設定 → 建廟過程影片，貼上新的 YouTube 網址或重新上傳影片即可。

---

## 聯絡節點整理

| 角色 | 負責事項 |
|------|----------|
| **你（開發者）** | 程式修改、Railway 部署、DNS 設定協助 |
| **廟方法人代表** | 提供法人文件、簽名申請網域、付款授權 |
| **網路中文客服** | `.org.tw` 審核問題（電話或線上客服） |
