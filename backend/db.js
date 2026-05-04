const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

// 資料庫檔案存放路徑
const DB_PATH = path.join(__dirname, 'temple.db');
const db = new Database(DB_PATH);

// 開啟外鍵約束和 WAL 模式（效能較好）
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDb() {
  // --- 建立所有資料表 ---

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS carousel (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      image_url TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      published_at DATE,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      start_date DATE,
      end_date DATE,
      location TEXT,
      image_url TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      id_number TEXT,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      activity_id INTEGER,
      participants INTEGER DEFAULT 1,
      notes TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (activity_id) REFERENCES activities(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // --- 建立預設管理員帳號（首次執行才建立）---
  const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!adminExists) {
    const hashed = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', hashed);
    console.log('✅ 預設管理員建立：帳號 admin / 密碼 admin123（請記得更改密碼）');
  }

  // --- 預設網站設定 ---
  const defaults = [
    ['site_name', '玄天上帝廟'],
    ['site_subtitle', '神恩浩蕩，庇佑四方'],
    ['phone', '02-XXXX-XXXX'],
    ['address', '台灣某市某區某路一號'],
    ['email', 'temple@example.com'],
    ['about_text', '本廟創建於民國XX年，主祀玄天上帝，香火鼎盛，信眾廣布四方。每逢神明誕辰，廟宇熱鬧非凡，為地方重要信仰中心。廟方長期致力於推廣傳統文化，舉辦各類宗教活動，促進社區凝聚力。'],
    ['founding_year', '民國XX年'],
    ['main_deity', '玄天上帝'],
    ['open_hours', '每日上午 06:00 - 晚上 09:00'],
  ];
  for (const [key, value] of defaults) {
    const exists = db.prepare('SELECT key FROM settings WHERE key = ?').get(key);
    if (!exists) {
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(key, value);
    }
  }

  // --- 示範輪播資料 ---
  const carouselCount = db.prepare('SELECT COUNT(*) as c FROM carousel').get().c;
  if (carouselCount === 0) {
    const slides = [
      ['神恩浩蕩', '玄天上帝庇佑四方，風調雨順', 'https://picsum.photos/seed/temple1/1200/500', 1],
      ['香火鼎盛', '虔誠禮拜，祈求平安吉祥', 'https://picsum.photos/seed/temple2/1200/500', 2],
      ['傳統文化', '傳承千年習俗，弘揚民間信仰', 'https://picsum.photos/seed/temple3/1200/500', 3],
    ];
    for (const [title, description, image_url, sort_order] of slides) {
      db.prepare('INSERT INTO carousel (title, description, image_url, sort_order) VALUES (?, ?, ?, ?)').run(title, description, image_url, sort_order);
    }
  }

  // --- 示範消息 ---
  const newsCount = db.prepare('SELECT COUNT(*) as c FROM news').get().c;
  if (newsCount === 0) {
    const items = [
      ['民國115年元宵節燈謎晚會', '本廟將於元宵節舉辦傳統燈謎晚會，歡迎闔家參與，猜燈謎贏好禮！活動時間為晚上七點至十點，設有兒童專區及長輩座位，敬請踴躍參加。', '2026-02-12'],
      ['玄天上帝聖誕祝壽大典公告', '農曆三月三日為玄天上帝聖誕，本廟將舉行盛大祝壽典禮，歡迎十方信眾共襄盛舉，同慶神明千秋聖壽，廟方備有平安符及壽桃分發。', '2026-03-20'],
      ['廟埕整修工程圓滿完工', '本廟廟埕整修工程已於本月圓滿完工，環境更加寬敞舒適，停車場亦同步擴建，歡迎信眾前來參拜，感謝各位善信長期支持。', '2026-04-01'],
      ['夏令營報名開始受理', '本廟青少年宗教文化夏令營即日起開放報名，名額有限，請儘早報名。活動內容包含傳統技藝、廟宇文化導覽、鼓藝體驗等豐富課程。', '2026-04-15'],
    ];
    for (const [title, content, published_at] of items) {
      db.prepare('INSERT INTO news (title, content, published_at) VALUES (?, ?, ?)').run(title, content, published_at);
    }
  }

  // --- 示範活動 ---
  const actCount = db.prepare('SELECT COUNT(*) as c FROM activities').get().c;
  if (actCount === 0) {
    const acts = [
      ['平安遶境活動', '一年一度的平安遶境活動，祈求地方平安、風調雨順。全程約三小時，設有隊伍報名，歡迎各宮廟社團共同參與。', '2026-06-15', '2026-06-15', '廟宇周邊地區'],
      ['青少年宗教文化夏令營', '針對國中小學生設計的宗教文化體驗活動，包含傳統技藝、廟宇文化導覽、北管鼓藝等課程，全程五天四夜。', '2026-07-01', '2026-07-05', '本廟活動中心'],
      ['中秋節祈福晚會', '中秋節特別安排祈福晚會，有傳統歌仔戲表演、焚香祈福、博餅活動等，歡迎闔家參與，共度佳節。', '2026-09-19', '2026-09-19', '廟前廣場'],
      ['冬至感恩祭典', '一年一度冬至感恩祭典，感謝玄天上帝一年來的庇佑，廟方備有湯圓免費發放，歡迎信眾踴躍參加。', '2026-12-22', '2026-12-22', '本廟正殿'],
    ];
    for (const [title, description, start_date, end_date, location] of acts) {
      db.prepare('INSERT INTO activities (title, description, start_date, end_date, location) VALUES (?, ?, ?, ?, ?)').run(title, description, start_date, end_date, location);
    }
  }

  console.log('✅ 資料庫初始化完成');
}

module.exports = { db, initDb };
