// ============================================================
// 【檔案說明】db.js — 資料庫連線設定與初始化
//
// 這個檔案做了以下幾件事：
//   1. 建立 PostgreSQL 連線池（Pool）
//   2. 定義 initDb() 函式：建立資料表、插入預設資料
//   3. 匯出 pool（給其他路由檔用來查詢）和 initDb（給 server.js 啟動時呼叫）
//
// 學習重點：
//   - 連線池（Pool）：預先建立多條資料庫連線，效能比每次請求都重新連接好很多
//   - async/await：讓非同步程式碼看起來像同步，更容易閱讀
//   - try/finally：確保資料庫連線一定會被釋放，即使出錯也不例外
//   - SQL 的 CREATE TABLE IF NOT EXISTS：只有在資料表不存在時才建立，安全地重複執行
//   - ON CONFLICT DO NOTHING / DO UPDATE：SQL 的「有就跳過 / 有就更新」語法
// ============================================================

// pg 是 Node.js 連接 PostgreSQL 的套件（package），
// Pool 是「連線池」類別：一次維護多條連線，避免每次查詢都重新建立連線（很慢）
const { Pool } = require('pg');

// bcrypt 是密碼雜湊（hash）套件。
// 雜湊是「單向加密」，把密碼轉成一串亂碼（hash），
// 無法從 hash 還原回原始密碼，只能用來「比對」。
// 這樣即使資料庫被盜，攻擊者也無法直接得知使用者密碼。
const bcrypt = require('bcryptjs');

// ── 建立資料庫連線池 ─────────────────────────────────────────
// new Pool({ connectionString, ssl })：
//   connectionString：PostgreSQL 連線字串，格式像 postgresql://user:pass@host/dbname
//   ssl：是否啟用加密連線
//     - 正式環境（Render/Railway）需要 SSL，但自簽憑證需要 rejectUnauthorized: false
//     - 本機開發通常不需要 SSL，設為 false
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // 從環境變數讀取連線字串
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// ── initDb：初始化資料庫 ─────────────────────────────────────
// async function：宣告這是一個非同步函式，內部可以使用 await。
// await 讓程式「等待」非同步操作完成後再繼續，讓程式碼像同步一樣容易讀。
async function initDb() {

  // pool.connect()：從連線池借出一條資料庫連線（client）。
  // 用 await 等待取得連線後再繼續。
  const client = await pool.connect();

  try {
    // ── 建立 users 資料表 ─────────────────────────────────────
    // CREATE TABLE IF NOT EXISTS：如果資料表已存在就跳過，不會出錯。
    // 各欄位說明：
    //   id SERIAL PRIMARY KEY → 自動遞增的唯一識別碼（1, 2, 3...）
    //   username TEXT UNIQUE NOT NULL → 使用者名稱，不可重複，不能為空
    //   password TEXT NOT NULL → 儲存 bcrypt 雜湊後的密碼（不是明文！）
    //   created_at TIMESTAMP DEFAULT NOW() → 記錄建立時間，預設為當下時間
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // ── 建立 carousel 資料表（輪播圖）────────────────────────
    // sort_order INTEGER DEFAULT 0 → 排序順序，數字小的排前面
    // active INTEGER DEFAULT 1 → 1 = 啟用顯示，0 = 隱藏（軟刪除概念）
    await client.query(`
      CREATE TABLE IF NOT EXISTS carousel (
        id SERIAL PRIMARY KEY,
        title TEXT,
        description TEXT,
        image_url TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // ── 建立 news 資料表（最新消息）──────────────────────────
    // published_at DATE → 只記錄日期（不含時間），如 2026-01-01
    // image_url TEXT → 可以是 NULL（沒有配圖），所以沒有 NOT NULL
    await client.query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        published_at DATE,
        active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // ── 建立 activities 資料表（活動）────────────────────────
    // start_date、end_date → 活動的開始與結束日期
    // location → 活動地點
    await client.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        location TEXT,
        image_url TEXT,
        active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // ── 建立 registrations 資料表（活動報名）─────────────────
    // activity_id INTEGER REFERENCES activities(id)：
    //   外鍵（Foreign Key）約束，確保 activity_id 一定對應到 activities 資料表中存在的記錄。
    //   這是「關聯式資料庫」的核心概念：用 ID 連結不同資料表的資料。
    // status TEXT DEFAULT 'pending'：報名狀態，預設為「待處理」
    await client.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        id_number TEXT,
        phone TEXT NOT NULL,
        email TEXT,
        address TEXT,
        activity_id INTEGER REFERENCES activities(id),
        participants INTEGER DEFAULT 1,
        notes TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // ── 建立 settings 資料表（網站設定）─────────────────────
    // key TEXT PRIMARY KEY → 以設定名稱（key）作為主鍵，確保不重複
    // 這是 Key-Value 儲存模式：每一列就是一個「設定名稱 = 設定值」
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // ── 插入預設管理員帳號 ────────────────────────────────────
    // bcrypt.hash(password, saltRounds)：
    //   把明文密碼 'admin123' 進行雜湊，saltRounds=10 表示雜湊強度（越高越安全但越慢）。
    //   回傳的 hashed 是一串不可逆的雜湊字串，這才是存進資料庫的值。
    //
    // ON CONFLICT (username) DO NOTHING：
    //   若 username = 'admin' 已存在，就什麼都不做（不更新也不報錯）。
    //   確保每次啟動都不會重複建立管理員。
    const hashed = await bcrypt.hash('admin123', 10);
    await client.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING',
      ['admin', hashed]
      // $1、$2 是「參數化查詢」（Parameterized Query）佔位符，
      // 實際值在後面的陣列中依序對應。
      // 這樣能防止 SQL Injection（SQL 注入攻擊），是安全的最佳實踐。
    );

    // ── 插入預設網站設定 ─────────────────────────────────────
    // defaults 是一個二維陣列，每個元素是 [key, value] 的組合。
    const defaults = [
      ['site_name', '南天母中壇元帥道場'],
      ['site_subtitle', '神恩浩蕩，庇佑四方'],
      ['phone', '02-XXXX-XXXX'],
      ['address', '台灣某市某區某路一號'],
      ['email', 'temple@example.com'],
      ['about_text', '本廟創建於民國XX年，主祀中壇元帥，香火鼎盛，信眾廣布四方。每逢神明誕辰，廟宇熱鬧非凡，為地方重要信仰中心。廟方長期致力於推廣傳統文化，舉辦各類宗教活動，促進社區凝聚力。'],
      ['founding_year', '民國XX年'],
      ['main_deity', '中壇元帥'],
      ['open_hours', '每日上午 06:00 - 晚上 09:00'],
      ['intro_video_url', ''],
    ];

    // for...of 迴圈逐一取出每個 [key, value] 配對
    for (const [key, value] of defaults) {
      await client.query(
        // ON CONFLICT (key) DO NOTHING：key 已存在就跳過（不覆蓋使用者的自訂設定）
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
        [key, value]
      );
    }

    // ── 插入示範輪播資料（只有在資料表是空的時候才插入）────────
    // 先查詢 COUNT(*)：計算目前 carousel 資料表有幾筆資料
    // COUNT(*) AS c → 用 c 作為欄位別名，結果在 rows[0].c
    const { rows: carouselRows } = await client.query('SELECT COUNT(*) AS c FROM carousel');
    if (parseInt(carouselRows[0].c) === 0) {
      // 只有 0 筆資料時才插入示範資料，避免每次重啟都重複新增
      const slides = [
        ['神恩浩蕩', '玄天上帝庇佑四方，風調雨順', 'https://picsum.photos/seed/temple1/1200/500', 1],
        ['香火鼎盛', '虔誠禮拜，祈求平安吉祥', 'https://picsum.photos/seed/temple2/1200/500', 2],
        ['傳統文化', '傳承千年習俗，弘揚民間信仰', 'https://picsum.photos/seed/temple3/1200/500', 3],
      ];
      // 用解構賦值取出陣列中每個元素的對應欄位
      for (const [title, description, image_url, sort_order] of slides) {
        await client.query(
          'INSERT INTO carousel (title, description, image_url, sort_order) VALUES ($1, $2, $3, $4)',
          [title, description, image_url, sort_order]
        );
      }
    }

    // ── 插入示範消息（同樣只有空資料表才插入）────────────────
    const { rows: newsRows } = await client.query('SELECT COUNT(*) AS c FROM news');
    if (parseInt(newsRows[0].c) === 0) {
      const items = [
        ['民國115年元宵節燈謎晚會', '本廟將於元宵節舉辦傳統燈謎晚會，歡迎闔家參與，猜燈謎贏好禮！活動時間為晚上七點至十點，設有兒童專區及長輩座位，敬請踴躍參加。', '2026-02-12'],
        ['玄天上帝聖誕祝壽大典公告', '農曆三月三日為玄天上帝聖誕，本廟將舉行盛大祝壽典禮，歡迎十方信眾共襄盛舉，同慶神明千秋聖壽，廟方備有平安符及壽桃分發。', '2026-03-20'],
        ['廟埕整修工程圓滿完工', '本廟廟埕整修工程已於本月圓滿完工，環境更加寬敞舒適，停車場亦同步擴建，歡迎信眾前來參拜，感謝各位善信長期支持。', '2026-04-01'],
        ['夏令營報名開始受理', '本廟青少年宗教文化夏令營即日起開放報名，名額有限，請儘早報名。活動內容包含傳統技藝、廟宇文化導覽、鼓藝體驗等豐富課程。', '2026-04-15'],
      ];
      for (const [title, content, published_at] of items) {
        await client.query(
          'INSERT INTO news (title, content, published_at) VALUES ($1, $2, $3)',
          [title, content, published_at]
        );
      }
    }

    // ── 插入示範活動 ─────────────────────────────────────────
    const { rows: actRows } = await client.query('SELECT COUNT(*) AS c FROM activities');
    if (parseInt(actRows[0].c) === 0) {
      const acts = [
        ['平安遶境活動', '一年一度的平安遶境活動，祈求地方平安、風調雨順。全程約三小時，設有隊伍報名，歡迎各宮廟社團共同參與。', '2026-06-15', '2026-06-15', '廟宇周邊地區'],
        ['青少年宗教文化夏令營', '針對國中小學生設計的宗教文化體驗活動，包含傳統技藝、廟宇文化導覽、北管鼓藝等課程，全程五天四夜。', '2026-07-01', '2026-07-05', '本廟活動中心'],
        ['中秋節祈福晚會', '中秋節特別安排祈福晚會，有傳統歌仔戲表演、焚香祈福、博餅活動等，歡迎闔家參與，共度佳節。', '2026-09-19', '2026-09-19', '廟前廣場'],
        ['冬至感恩祭典', '一年一度冬至感恩祭典，感謝玄天上帝一年來的庇佑，廟方備有湯圓免費發放，歡迎信眾踴躍參加。', '2026-12-22', '2026-12-22', '本廟正殿'],
      ];
      for (const [title, description, start_date, end_date, location] of acts) {
        await client.query(
          'INSERT INTO activities (title, description, start_date, end_date, location) VALUES ($1, $2, $3, $4, $5)',
          [title, description, start_date, end_date, location]
        );
      }
    }

    console.log('✅ 資料庫初始化完成');

  } finally {
    // finally 區塊：無論 try 區塊成功或失敗，這裡一定會執行。
    // client.release()：把這條資料庫連線還回連線池，供下一個請求使用。
    // 如果忘記 release，連線池會被耗盡，之後的查詢就會卡住等待連線。
    client.release();
  }
}

// ── 匯出給其他檔案使用 ───────────────────────────────────────
// module.exports 是 Node.js 的模組匯出語法。
// 其他檔案用 const { pool } = require('./db') 就能取得 pool，
// 用 const { initDb } = require('./db') 就能取得 initDb 函式。
module.exports = { pool, initDb };
