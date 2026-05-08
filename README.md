# 公廟網站

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
後端會在 http://localhost:3001 執行，**首次啟動會自動建立所有資料表及示範資料**。

**終端機 2 — 前端：**
```bash
npm run dev:frontend
```
前端會在 http://localhost:5173 執行

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
- 首頁：輪播圖、廟宇簡介、最新消息、活動、報名入口
- 本廟簡介：廟宇介紹、建廟過程影片（可在後台設定）、入廟須知
- 最新消息：公告清單與詳細內容
- 活動訊息：活動列表
- 線上報名：線上報名表格
- 聯絡我們：地址、電話

### 後台（需登入）
- 輪播管理：上傳 / 刪除 / 排序首頁輪播圖片
- 消息管理：新增 / 編輯 / 刪除最新消息
- 活動管理：新增 / 編輯 / 刪除活動
- 報名記錄：查看所有線上報名，可更改審核狀態
- 網站設定：修改廟名、電話、地址、簡介文字、建廟過程影片、管理員密碼

---

## 資料夾結構

```
temple-website/
├── package.json          ← 根目錄（一鍵安裝 / 啟動腳本）
├── backend/              ← Node.js + Express API
│   ├── routes/           ← 各功能的 API 路由
│   ├── middleware/       ← 登入驗證
│   ├── db.js             ← PostgreSQL 連線與資料庫初始化
│   ├── server.js         ← 伺服器主程式
│   └── .env              ← 環境變數（不進 git）
└── frontend/             ← React + Vite + Tailwind
    └── src/
        ├── pages/        ← 各頁面元件
        ├── components/   ← 可重複使用元件
        ├── api/          ← 與後端溝通的 API 函式
        └── context/      ← 登入狀態管理
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
```
