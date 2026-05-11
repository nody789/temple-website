// ============================================================
// 【檔案說明】routes/settings.js — 網站設定 API 路由
//
// 提供以下 API 端點：
//   GET /api/settings      → 取得所有網站設定（公開，前台需要顯示網站名稱等資訊）
//   PUT /api/settings      → 批次更新網站設定（需登入）
//
// settings 資料表的設計模式：Key-Value（鍵值對）
//   不像 news、activities 是一筆記錄對應一個項目，
//   settings 用「一個 key 對應一個 value」的方式儲存各種設定，
//   例如：site_name = '南天母中壇元帥道場'
//   好處：彈性添加新設定，不需要修改資料表結構。
//
// 學習重點：
//   - 把資料庫的陣列轉換成 JavaScript 物件（key-value 格式）
//   - 資料庫事務（Transaction）：確保批次操作的原子性
//   - BEGIN / COMMIT / ROLLBACK：事務控制語句
//   - UPSERT（UPDATE + INSERT）：有就更新，沒有就新增
// ============================================================

// ── 載入必要模組 ─────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

// ============================================================
// GET /api/settings — 取得所有網站設定
//
// 公開 API（沒有 auth middleware），前台和後台都可以使用。
// 前台需要讀取 site_name、phone、address 等資訊顯示在頁面上。
//
// 回傳格式：把資料庫的列表轉成物件
//   資料庫格式（陣列）：
//     [{ key: 'site_name', value: '南天母...' }, { key: 'phone', value: '02-...' }]
//   轉換後（物件）：
//     { site_name: '南天母...', phone: '02-...' }
//   前端用物件格式更方便取值：settings.site_name
// ============================================================
router.get('/', async (req, res) => {
  try {
    // 只 SELECT key 和 value 兩個欄位就夠了（settings 資料表也只有這兩欄）
    const { rows } = await pool.query('SELECT key, value FROM settings');

    // 把陣列格式轉成物件格式：
    //   先宣告一個空物件 settings = {}
    //   用 for...of 迴圈逐筆取出每個 row，
    //   把 row.key 當成物件的屬性名稱，row.value 當成屬性值
    const settings = {};
    for (const row of rows) {
      settings[row.key] = row.value; // 例如：settings['site_name'] = '南天母...'
    }

    // 回傳的是物件，不是陣列
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ============================================================
// PUT /api/settings — 後台：批次更新所有網站設定
//
// 需要登入（auth middleware）。
// 一次更新多個設定值（前端把整份設定表單送過來）。
//
// 請求 body 預期格式（物件）：
//   {
//     "site_name": "新的網站名稱",
//     "phone": "02-XXXX-XXXX",
//     "address": "新地址",
//     ...
//   }
//
// 使用資料庫事務（Transaction）的原因：
//   假設要更新 10 個設定，第 7 個突然失敗了，
//   沒有事務的話：前 6 個已更新，後 4 個沒更新 → 資料不一致
//   有事務的話：全部成功才 COMMIT，任何一個失敗就 ROLLBACK（全部回復）
//   → 確保「要嘛全部成功，要嘛全部不變」（原子性，Atomicity）
// ============================================================
router.put('/', auth, async (req, res) => {
  // 手動取得一條資料庫連線（事務需要在同一條連線上執行）
  // 與一般的 pool.query() 不同，pool.connect() 讓我們控制連線的生命週期
  const client = await pool.connect();

  try {
    // BEGIN：開始一個資料庫事務
    // 之後的所有 SQL 操作都是「暫定的」，還沒有真正寫入資料庫
    await client.query('BEGIN');

    // Object.entries(req.body)：把物件轉成 [key, value] 陣列
    // 例如：{ site_name: 'ABC', phone: '02-...' }
    //   → [['site_name', 'ABC'], ['phone', '02-...']]
    for (const [key, value] of Object.entries(req.body)) {
      // UPSERT（Upsert = Update + Insert）：
      //   INSERT INTO settings (key, value) VALUES ($1, $2)
      //     先嘗試新增一筆記錄
      //   ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      //     如果 key 已存在（觸發唯一約束衝突），
      //     改為更新該 key 的 value
      //     EXCLUDED.value 指的是「原本打算插入的那個新值」
      //
      // 這讓我們不需要判斷 key 是否已存在，一條 SQL 就能處理新增和更新兩種情況
      await client.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
        [key, value]
      );
    }

    // COMMIT：確認事務，把所有暫定的變更真正寫入資料庫
    await client.query('COMMIT');

    res.json({ message: '設定更新成功' });
  } catch (err) {
    // 如果任何一個 SQL 操作失敗（拋出例外），執行 ROLLBACK
    // ROLLBACK：取消從 BEGIN 到現在所有的暫定變更，資料回復到 BEGIN 之前的狀態
    await client.query('ROLLBACK');
    res.status(500).json({ message: '伺服器錯誤' });
  } finally {
    // finally：無論成功或失敗都一定要執行
    // 把連線釋放回連線池（非常重要！如果不釋放，連線池會被耗盡）
    client.release();
  }
});

// ── 匯出路由 ─────────────────────────────────────────────────
module.exports = router;
