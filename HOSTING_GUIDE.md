# 廟宇網站上線流程指南（草稿，勿 commit）

---

## 費用總覽（一年大約多少錢）

| 項目 | 費用 | 備注 |
|------|------|------|
| `.org.tw` 網域 | NT$350–500 / 年 | 向網路中文申請，需法人文件 |
| 主機（Railway） | NT$1,920 / 年（$5 美元/月） | 跑 Node.js，無需管 Linux |
| SSL 憑證 | **免費** | Railway 自動處理 |
| **每年合計** | **約 NT$2,300–2,400 / 年** | |

> 換算說明：$5 美元 × 12 個月 × 32 匯率 ≈ NT$1,920

---

## 你的架構說明

```
現在開發中：
  瀏覽器 → Vite (port 5173) → Vite proxy → Node.js (port 3001)

上線後：
  瀏覽器 → https://廟名.org.tw
         ├─ /api/*  → Railway 跑的 Node.js
         └─ 其他    → React 靜態檔案（build 出來的 dist/）
```

**前端程式碼不需要改**：`frontend/src/api/index.js` 的 `baseURL: '/api'` 上線後繼續有效。

---

## 完整上線步驟（照順序做）

### 階段一：向廟方收集資料（你的工作）

- [ ] 請廟方提供：
  - 財團法人登記證書（影本即可）
  - 統一編號
  - 法人代表人姓名、電話、地址
  - 廟方官方 Email（沒有的話先用代表人個人信箱）

---

### 階段二：申請網域（約 10–20 分鐘）

1. 前往 **網路中文 Netchinese**（網址請自行搜尋 netchinese.com）
2. 搜尋想要的 `.org.tw` 網域名稱，例如 `xxtemple.org.tw`
3. 填寫 registrant（申請人）資料：**填法人資料，不是你個人**
4. 上傳財團法人登記證書（.org.tw 需要審核）
5. 付款（年費約 NT$350–500）
6. 等待審核通過（通常 1–3 個工作天）

> 帳號可以你自己建，但申請人欄位一定要填廟方法人資料。

---

### 階段三：準備程式碼上線（你的工作）

**修改 backend/.env（上線前必做）：**

```env
PORT=3001
JWT_SECRET=請換成至少32字元的隨機字串，例如：k9x$mP2#qL8vN5wR7jT0aZ3eB6hC1dF4
```

> 目前 JWT_SECRET 是 `temple-secret-key-change-this-in-production`，
> 上線前一定要換掉，否則任何人都可以偽造登入 token。

**建立 Railway 設定檔（`railway.json`，放在專案根目錄）：**

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node backend/server.js",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**前端 build 設定（讓 Node.js 同時服務前端靜態檔案）：**

在 `backend/server.js` 最下方 `app.listen` 之前加入：

```js
// 上線時服務前端靜態檔案
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});
```

---

### 階段四：部署到 Railway（約 15 分鐘）

1. 前往 **railway.app**，用 GitHub 帳號登入
2. 點「New Project」→「Deploy from GitHub repo」
3. 選擇這個專案的 repo
4. Railway 偵測到 Node.js 會自動部署
5. 部署完成後，點「Settings」→「Networking」→「Generate Domain」
   - 先取得暫時網址，例如 `temple-abc123.up.railway.app`
6. 在 Railway 後台設定環境變數（把 .env 的內容填進去）：
   - `PORT` = `3001`
   - `JWT_SECRET` = （你改好的強密碼）

---

### 階段五：部署前端（在 Railway 之前先 build）

在本機執行：

```bash
cd frontend
npm run build
```

這會產生 `frontend/dist/` 資料夾，Railway 部署時會一起上傳。

---

### 階段六：綁定網域（網路中文 + Railway）

1. **Railway 這邊**：
   - Settings → Networking → Custom Domain
   - 輸入你的網域，例如 `xxtemple.org.tw`
   - Railway 會給你一個 CNAME 目標，例如 `xxxxxxx.railway.app`

2. **網路中文這邊**：
   - 進入網域管理後台
   - 找到 DNS 設定
   - 新增一筆 CNAME record：
     ```
     主機名稱：@（或空白，代表根網域）
     指向：Railway 給你的 CNAME 位址
     TTL：3600
     ```

3. 等待 DNS 生效（約 5 分鐘–24 小時）

4. Railway 自動啟用 HTTPS（免費 SSL）

---

### 階段七：驗收上線

- [ ] 用手機和電腦分別開啟網站，確認畫面正常
- [ ] 測試前台：輪播圖、最新消息、活動列表、線上報名
- [ ] 測試後台：`https://廟名.org.tw/admin/login` 能否登入
- [ ] 確認圖片能正常顯示（上傳功能）
- [ ] 確認 HTTPS 鎖頭出現（綠色安全連線）

---

## 常見問題

**Q：網域審核需要多久？**
`.org.tw` 需要人工審核財團法人文件，通常 1–3 個工作天。

**Q：Railway 免費嗎？**
有免費額度（每月 $5 美元的用量），低流量廟宇網站可能夠用，但建議直接付費方案（$5/月）確保穩定不中斷。

**Q：資料庫是 SQLite，上線會有問題嗎？**
SQLite 是存在本機檔案的資料庫。Railway 每次重新部署可能會重置，建議上線前確認資料庫路徑，或考慮改用 Railway 提供的 PostgreSQL（免費額度內）。

**Q：上傳的圖片怎麼辦？**
目前圖片存在 `backend/uploads/` 資料夾，Railway 重新部署會清空。
上線前需要考慮改用雲端儲存（如 Cloudinary 免費方案），這部分需要額外開發。

---

## 聯絡節點整理

| 角色 | 負責事項 |
|------|----------|
| **你（開發者）** | 程式修改、Railway 部署、DNS 設定協助 |
| **廟方法人代表** | 提供法人文件、簽名申請網域、付款授權 |
| **網路中文客服** | .org.tw 審核問題（電話或線上客服） |

---

*本文件為開發參考用，確認架站方向後請刪除。*
