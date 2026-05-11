# 南天母中壇元帥道場 官方網站

全端專案，前台使用 React + Vite + Tailwind CSS，後台 API 使用 Node.js + Express + PostgreSQL（Neon），圖片與影片儲存使用 Cloudinary。

---

## 環境需求

- **Node.js** 18 以上（建議 LTS 版）
- **npm** 9 以上

---

## 快速開始

### 1. 下載專案

```bash
git clone <你的-repo-url>
cd temple-website
```

### 2. 安裝所有套件（只需執行一次）

```bash
npm run install:all
```

### 3. 設定後端環境變數

在 `backend/` 資料夾建立 `.env` 檔案（參考 `.env.example`）：

```
PORT=3001
JWT_SECRET=請換成安全的隨機字串

# PostgreSQL（建議使用 Neon 免費雲端：neon.tech）
DATABASE_URL=postgresql://用戶名:密碼@主機/資料庫名?sslmode=require

# Cloudinary（至 cloudinary.com 申請免費帳號）
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **DATABASE_URL** 直接從 Neon Dashboard 複製「Connection String」貼上即可。  
> **Cloudinary** 三個值在 cloudinary.com → Settings → API Keys。

### 4. 啟動專案（需開兩個終端機視窗）

**終端機 1 — 後端 API 伺服器：**
```bash
npm run dev:backend
```
後端會在 http://localhost:3001 執行，**首次啟動會自動建立所有資料表及基本示範資料**。

**終端機 2 — 前端：**
```bash
npm run dev:frontend
```
前端會在 http://localhost:5173 執行

### 5. 填充豐富示範資料（選用）

如需填充完整示範資料（8 則消息、6 場活動、4 張輪播），執行：

```bash
node backend/seed-demo.js
```

> ⚠️ 此腳本會清除現有的輪播、消息、活動、報名資料後重新填充。

---

## 使用方式

| 頁面 | 網址 |
|------|------|
| 前台網站 | http://localhost:5173 |
| 後台登入 | http://localhost:5173/admin/login |

**後台預設帳號**
- 帳號：`admin`
- 密碼：`admin123`（請登入後立即到「網站設定」更改！）

---

## 功能說明

### 前台

| 頁面 | 功能說明 |
|------|----------|
| 首頁 | 輪播圖（響應式高度）、廟宇簡介、最新消息、近期活動、報名入口 |
| 本廟簡介 | 廟宇歷史介紹、建廟過程影片（YouTube 或上傳）、基本資訊、入廟須知 |
| 環境介紹 | 正殿、廣場、後殿、展覽室等各區域圖文介紹 |
| 最新消息 | 公告列表與詳細內容頁 |
| 活動訊息 | 活動列表含圖片、日期、地點 |
| 線上報名 | 報名表單，送出後彈出**正中央成功 Modal**（含報名者姓名、活動、人數） |
| 聯絡我們 | 地址、電話、Email、開放時間、交通指引、Google Maps 連結 |

### 後台（需登入）

| 功能 | 說明 |
|------|------|
| 輪播管理 | 新增 / 編輯 / 刪除 / 排序首頁輪播圖片 |
| 消息管理 | 新增 / 編輯 / 刪除最新消息，支援圖片上傳 |
| 活動管理 | 新增 / 編輯 / 刪除活動，支援圖片上傳 |
| 報名記錄 | 查看所有線上報名，可更改審核狀態（待確認 / 已確認） |
| 網站設定 | 廟名、副標語、主祀神明、電話、地址、開放時間、簡介文字、建廟影片 |
| SEO 設定 | 瀏覽器標題（SEO Title）、網站描述（meta description）、關鍵字（meta keywords） |
| 更改密碼 | 管理員帳號密碼變更 |

所有後台操作（儲存、新增、刪除）均以**正中央 Toast 通知**顯示結果，無論捲動到何處都能看到。

---

## 近期更新

### v1.1.0
- **主色系全面更新**：整站色調從咖啡棕改為純金色系（基底色 `#EFBF04`），包含按鈕、標題、邊框、底列等全部元件
- **報名成功 Modal**：表單送出後在畫面正中央彈出成功卡片（含報名者姓名、活動名稱、人數），不再顯示於頁面頂部
- **後台 Toast 通知**：後台所有操作通知改為固定在畫面正中央的 Toast 訊息，3 秒後自動消失
- **SEO 動態設定**：後台「網站設定」新增 SEO 區塊，修改廟名、SEO 標題、描述、關鍵字後，`<title>`、`<meta>` 標籤即時更新
- **輪播高度修正**：改用響應式固定高度（手機 256px → 桌機 640px），解決大螢幕輪播圖被裁切的問題
- **日期格式修正**：修正 PostgreSQL 回傳 ISO 時間字串（`T16:00:00.000Z`）導致日期顯示異常的問題
- **效能優化**：新增 `SettingsContext`，網站設定改為 App 層級一次性載入，所有頁面共用，減少重複 API 請求
- **示範資料腳本**：新增 `backend/seed-demo.js`，可快速填充完整示範資料

---

## 資料夾結構

```
temple-website/
├── package.json              ← 根目錄（一鍵安裝 / 啟動腳本）
├── backend/                  ← Node.js + Express API
│   ├── routes/               ← 各功能的 API 路由
│   ├── middleware/           ← 登入驗證
│   ├── db.js                 ← PostgreSQL 連線與資料庫初始化
│   ├── server.js             ← 伺服器主程式
│   ├── seed-demo.js          ← 示範資料填充腳本
│   └── .env                  ← 環境變數（不進 git）
└── frontend/                 ← React + Vite + Tailwind
    └── src/
        ├── pages/            ← 各頁面元件
        ├── components/       ← 可重複使用元件（含 AdminToast）
        ├── api/              ← 與後端溝通的 API 函式
        └── context/          ← 登入狀態 + 網站設定 Context
```

---

## 資料庫與儲存

| 類型 | 服務 | 說明 |
|------|------|------|
| 資料庫 | [Neon](https://neon.tech)（PostgreSQL） | 免費版 500MB，內建 7 天自動備份 |
| 圖片 / 影片 | [Cloudinary](https://cloudinary.com) | 免費版 25GB，永久儲存 |

首次啟動後端會自動建立所有資料表，無需手動執行 SQL。

---

## 常用指令

```bash
# 安裝所有套件
npm run install:all

# 啟動後端（開發模式，含熱重載）
npm run dev:backend

# 啟動前端
npm run dev:frontend

# 啟動後端（正式模式）
npm run start:backend

# 填充示範資料（會清除現有資料）
node backend/seed-demo.js
```
