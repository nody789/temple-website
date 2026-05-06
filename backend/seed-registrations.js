const { db } = require('./db');

// 取得所有活動 ID
const activities = db.prepare('SELECT id, title FROM activities WHERE active = 1 ORDER BY id ASC').all();

if (activities.length === 0) {
  console.log('❌ 尚無活動資料，請先啟動 server 讓資料庫初始化後再執行此腳本');
  process.exit(1);
}

const insert = db.prepare(
  'INSERT INTO registrations (name, id_number, phone, email, address, activity_id, participants, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
);

const seedMany = db.transaction(() => {
  for (const act of activities) {
    insert.run('王小明', 'A123456789', '0912345678', 'ming@example.com', '台北市中正區重慶南路一段1號', act.id, 2, '希望安排靠近舞台的座位', 'confirmed');
    insert.run('李美華', null,          '0987654321', null,               '新北市板橋區文化路一段1號', act.id, 1, null, 'pending');
    console.log(`  ✅ 活動「${act.title}」已新增 2 筆報名`);
  }
});

seedMany();
console.log(`\n✅ 共為 ${activities.length} 個活動各新增 2 筆報名記錄`);
