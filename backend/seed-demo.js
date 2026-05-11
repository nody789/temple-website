/**
 * 示範資料填充腳本
 * 執行方式：node seed-demo.js
 * 警告：會清除現有的 carousel / news / activities / registrations 資料後重新填充
 */
require('dotenv').config();
const { pool } = require('./db');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🔄 清除舊示範資料...');
    await client.query('DELETE FROM registrations');
    await client.query('DELETE FROM carousel');
    await client.query('DELETE FROM news');
    await client.query('DELETE FROM activities');

    // ── 輪播圖 ────────────────────────────────────────────
    console.log('📸 填充輪播圖...');
    const slides = [
      ['神恩浩蕩・庇佑四方', '南天母中壇元帥道場 歡迎您的蒞臨', 'https://picsum.photos/seed/temple_banner1/1600/700', 1],
      ['中壇元帥聖誕祝壽', '農曆九月九日盛大慶典，敬邀十方善信共襄盛舉', 'https://picsum.photos/seed/temple_banner2/1600/700', 2],
      ['平安遶境活動', '一年一度遶境祈福，守護地方平安', 'https://picsum.photos/seed/temple_banner3/1600/700', 3],
      ['傳承文化・薪火相傳', '深耕社區三十年，弘揚民間信仰與傳統文化', 'https://picsum.photos/seed/temple_banner4/1600/700', 4],
    ];
    for (const [title, description, image_url, sort_order] of slides) {
      await client.query(
        'INSERT INTO carousel (title, description, image_url, sort_order, active) VALUES ($1, $2, $3, $4, 1)',
        [title, description, image_url, sort_order]
      );
    }

    // ── 最新消息 ───────────────────────────────────────────
    console.log('📰 填充消息...');
    const newsItems = [
      [
        '【重要公告】114年中壇元帥聖誕慶典活動程序表',
        '本廟將於農曆九月九日（國曆10月10日）舉行中壇元帥聖誕盛大慶典。活動內容包含：早上8時三獻大禮、上午10時藝陣踩街遶境、下午2時歌仔戲公演、晚上7時平安晚宴。廟方誠摯邀請各地善信踴躍參加，共祝神明千秋聖壽。備有免費素食便當發放，數量有限，歡迎提前向廟方登記。',
        'https://picsum.photos/seed/news_ceremony/600/350',
        '2026-08-20',
      ],
      [
        '本廟環境整修圓滿完工・煥然一新歡迎參拜',
        '歷時三個月的廟宇整修工程已於本週圓滿完工。此次整修包含正殿屋頂翻新、廟埕地坪重鋪、廁所衛浴改善及無障礙設施設置。整修期間感謝各界善信耐心配合，如今廟宇煥然一新，環境更加舒適，誠摯歡迎信眾前來參拜。另，廟旁停車場已同步擴建，可容納車輛由原本20輛增至50輛。',
        'https://picsum.photos/seed/news_renovation/600/350',
        '2026-07-15',
      ],
      [
        '暑期青少年文化研習營・即日起開放報名',
        '本廟與社區協會合辦「傳統廟宇文化研習營」，對象為國中小學生，活動時間為8月1日至8月5日，為期五天四夜。課程內容涵蓋廟宇建築文化導覽、北管音樂入門、神明故事繪本創作、傳統糊紙藝術等。每位學員結業後將頒發結業證書。名額限30人，先到先得，即日起可至廟辦或電話報名。',
        'https://picsum.photos/seed/news_camp/600/350',
        '2026-06-30',
      ],
      [
        '點燈祈福活動・光明燈開放登記',
        '本廟每年農曆正月起開放信眾點燈祈福，光明燈一年份費用為新台幣600元，包含燈座刻字、年底謝燈儀式及平安符一份。今年另新增「平安水晶燈」及「合家平安燈」兩款選擇，歡迎信眾依需求選購。如有疑問請致電廟辦或親洽服務台。點燈後將每月誦經回向，為您祈求平安順遂。',
        'https://picsum.photos/seed/news_lamp/600/350',
        '2026-06-01',
      ],
      [
        '端午節平安粽義賣・善款用於弱勢關懷',
        '本廟將於端午節前夕舉辦平安粽義賣活動，由廟內媽媽教室志工手工製作傳統北部粽，一綁5顆定價200元，全素口味另有販售。義賣所得扣除食材成本後，全數捐入本廟社會關懷基金，用於資助轄區內低收入戶家庭。歡迎信眾踴躍訂購，感謝您的愛心支持。訂購電話請洽廟辦。',
        'https://picsum.photos/seed/news_dumpling/600/350',
        '2026-05-20',
      ],
      [
        '感謝各界善信捐款・香爐修繕計畫順利完成',
        '本廟正殿前鎮廟大香爐因使用年久出現龜裂，廟方於本年度啟動修繕計畫，感謝各界善信踴躍捐款，在短短兩個月內籌得修繕費用，工程已於上月圓滿完工。新香爐由傳統師傅手工打造，品質更勝以往。廟方將於下月初舉行安爐儀式，届時歡迎信眾共同見證。',
        'https://picsum.photos/seed/news_incense/600/350',
        '2026-04-10',
      ],
      [
        '清明掃墓季・特別加開祭祖消災法會',
        '清明時節，本廟特別加開「祭祖消災暨超薦先靈法會」，時間為清明節前後各三日，每日上午9時及下午2時各一場。欲超薦先靈之信眾請於三日前向廟辦登記，提供先靈姓名及往生日期。法會費用隨緣，廟方不收固定費用，請依個人能力護持。',
        'https://picsum.photos/seed/news_qingming/600/350',
        '2026-03-25',
      ],
      [
        '元宵節燈謎晚會・猜燈謎贏好禮',
        '本廟元宵節燈謎晚會今年邁入第十五屆，活動時間為元宵節當晚6時至9時30分，現場設有300道傳統燈謎，另備有兒童闖關遊戲區及傳統湯圓品嚐。獎品設有家電用品、禮卷及平安吉祥物等。活動全程免費，不需報名，歡迎闔家大小蒞臨參與，感受傳統節慶的熱鬧氣氛。',
        'https://picsum.photos/seed/news_lantern/600/350',
        '2026-02-05',
      ],
    ];
    for (const [title, content, image_url, published_at] of newsItems) {
      await client.query(
        'INSERT INTO news (title, content, image_url, published_at, active) VALUES ($1, $2, $3, $4, 1)',
        [title, content, image_url, published_at]
      );
    }

    // ── 活動 ───────────────────────────────────────────────
    console.log('📅 填充活動...');
    const { rows: actRows } = await client.query(`
      INSERT INTO activities (title, description, start_date, end_date, location, image_url, active) VALUES
      ($1,$2,$3,$4,$5,$6,1), ($7,$8,$9,$10,$11,$12,1), ($13,$14,$15,$16,$17,$18,1),
      ($19,$20,$21,$22,$23,$24,1), ($25,$26,$27,$28,$29,$30,1), ($31,$32,$33,$34,$35,$36,1)
      RETURNING id
    `, [
      '中壇元帥聖誕慶典',
      '農曆九月九日中壇元帥千秋聖誕，本廟舉行盛大慶典。活動包含三獻大禮、藝陣踩街、歌仔戲公演及平安晚宴。廟方備有平安符、壽桃、素食便當免費發放，名額有限先登記先得。歡迎十方善信共襄盛舉，一同為神明賀壽祈福。',
      '2026-10-10', '2026-10-10', '本廟全境',
      'https://picsum.photos/seed/act_birthday/600/350',

      '平安遶境祈福活動',
      '一年一度的地方平安遶境活動，出發時間為早上8時，從本廟正殿出發，繞行轄區主要街道，預計下午1時回廟安座。活動設有隊伍報名，歡迎各宮廟社團、陣頭踴躍參與，共同為地方祈求風調雨順、平安吉祥。報名截止日為活動前兩週。',
      '2026-09-12', '2026-09-12', '本廟轄區街道',
      'https://picsum.photos/seed/act_parade/600/350',

      '青少年廟宇文化研習營',
      '專為國中小學生設計的五天四夜文化體驗活動。課程內容涵蓋廟宇建築文化導覽、北管音樂入門體驗、神明故事繪本創作、傳統糊紙藝術工坊及社區服務學習等多元課程。活動費用每人2,500元（含住宿、餐點、材料費），名額限30人。結業後頒發研習證書，報名請洽廟辦。',
      '2026-08-01', '2026-08-05', '本廟活動中心',
      'https://picsum.photos/seed/act_camp/600/350',

      '中秋節祈福晚會暨歌仔戲公演',
      '中秋佳節特別安排祈福晚會，活動內容包含：月光祈福儀式、傳統歌仔戲公演（共三折）、博餅活動及現場烤肉區開放。廟方備有月餅及水果免費發放。博餅獎品設有電器、禮卷、廟方平安吊飾等多項好禮。歡迎闔家大小共度中秋佳節，感受傳統節慶溫馨氣氛。',
      '2026-09-25', '2026-09-25', '廟前廣場',
      'https://picsum.photos/seed/act_mooncake/600/350',

      '重陽敬老感恩活動',
      '九九重陽節，本廟特別舉辦敬老感恩活動，邀請轄區65歲以上長者免費參加。活動內容包含感恩祈福儀式、健康講座、傳統技藝展示及聯合午宴。廟方並備有敬老禮包（含補品、平安符及廟方月曆）致贈與會長者。如需安排接送服務，請於活動三日前向廟辦登記。',
      '2026-10-17', '2026-10-17', '本廟活動中心',
      'https://picsum.photos/seed/act_elders/600/350',

      '冬至感恩祭暨湯圓發放',
      '一年一度冬至感恩祭，感謝中壇元帥一年來對地方的庇佑。上午舉行感恩祭典，下午舉辦傳統技藝市集，設有糖葫蘆、傳統糕餅、香包等手工藝品展售。廟方備有手工湯圓（芝麻、花生兩種口味）免費發放，每人限領一份，發完為止。活動全程免費，歡迎信眾闔家蒞臨。',
      '2026-12-22', '2026-12-22', '廟前廣場及活動中心',
      'https://picsum.photos/seed/act_winter/600/350',
    ]);

    // 取得剛插入的活動 IDs
    const activityIds = actRows.map(r => r.id);

    // ── 示範報名資料 ───────────────────────────────────────
    console.log('📋 填充報名資料...');
    const registrations = [
      ['王大明', 'A123456789', '0912-345-678', 'wang@example.com', '台北市天母西路88號', 0, 2, '希望安排靠近主舞台的位置', 'confirmed'],
      ['李淑芬', null,          '0987-654-321', null,               '台北市士林區文林路55號', 0, 3, null, 'confirmed'],
      ['陳建宏', 'F234567890', '02-2881-2345', 'chen@example.com', '台北市天母東路22號', 0, 1, '需要輪椅席位', 'pending'],
      ['林美惠', null,          '0922-111-222', 'lin@example.com',  '新北市淡水區中正路1號', 1, 4, '全家一起報名', 'confirmed'],
      ['張志豪', 'H345678901', '0933-222-333', null,               '台北市北投區新市街15號', 1, 2, null, 'pending'],
      ['黃淑玲', null,          '0955-444-555', 'huang@example.com','台北市士林區大東路8號', 2, 1, '素食者，請準備素食便當', 'confirmed'],
      ['吳明達', 'D456789012', '0966-555-666', 'wu@example.com',   '台北市天母西路12號', 2, 5, null, 'confirmed'],
      ['劉家豪', null,          '0977-666-777', null,               '新北市三重區正義南路3號', 3, 2, '小朋友一起參加', 'pending'],
    ];
    for (let i = 0; i < registrations.length; i++) {
      const [name, id_number, phone, email, address, actIdx, participants, notes, status] = registrations[i];
      const activity_id = actIdx < activityIds.length ? activityIds[actIdx] : activityIds[0];
      await client.query(
        'INSERT INTO registrations (name, id_number, phone, email, address, activity_id, participants, notes, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [name, id_number, phone, email, address, activity_id, participants, notes, status]
      );
    }

    // ── 網站設定 ───────────────────────────────────────────
    console.log('⚙️  更新網站設定...');
    const settingsUpdates = [
      ['site_name', '南天母中壇元帥道場'],
      ['site_subtitle', '神恩浩蕩・庇佑四方・傳承文化'],
      ['main_deity', '中壇元帥（三太子）'],
      ['founding_year', '民國72年'],
      ['phone', '02-2871-XXXX'],
      ['email', 'service@nantianmu-temple.tw'],
      ['address', '台北市士林區天母西路 XX 號'],
      ['open_hours', '每日 06:00 – 21:00，農曆初一、十五延至 22:00'],
      ['about_text', '南天母中壇元帥道場創建於民國72年，主祀中壇元帥（三太子哪吒太子），配祀玄天上帝、地藏王菩薩及福德正神，香火鼎盛，信眾廣布北台灣各地。\n\n本廟由地方善信發起，歷經數十年的發展，從最初的簡陋草廟，逐步擴建為現今規模完善的廟宇，見證了天母地區的發展歷程。廟宇建築融合傳統閩南式風格與現代工法，雕梁畫棟、金碧輝煌，為地方重要信仰與文化地標。\n\n廟方長期致力於推廣傳統文化，每年舉辦多項宗教及社區活動，包含神明聖誕慶典、平安遶境、歌仔戲公演、青少年文化研習等，深獲地方居民支持與肯定。除宗教服務外，廟方亦積極投入社會關懷工作，設立急難救助基金，協助轄區弱勢家庭渡過難關。\n\n歡迎十方善信不分遠近，蒞臨本廟參拜祈福，感受中壇元帥的神恩浩蕩與庇佑。'],
      ['seo_title', '南天母中壇元帥道場 | 官方網站'],
      ['meta_description', '南天母中壇元帥道場官方網站。主祀中壇元帥（三太子），提供最新消息、活動報名、環境介紹等服務，歡迎十方善信蒞臨參拜。'],
      ['meta_keywords', '中壇元帥,三太子,哪吒,南天母,廟宇,天母,台北,道場,士林'],
    ];
    for (const [key, value] of settingsUpdates) {
      await client.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
        [key, value]
      );
    }

    console.log('\n✅ 示範資料填充完成！');
    console.log(`   輪播圖：${slides.length} 張`);
    console.log(`   最新消息：${newsItems.length} 則`);
    console.log(`   活動：6 場`);
    console.log(`   報名資料：${registrations.length} 筆`);
  } catch (err) {
    console.error('❌ 錯誤：', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
