/**
 * 【頁面說明】Environment.jsx — 廟宇環境介紹頁
 *
 * 介紹廟宇各區域的環境，以圖文卡片格網呈現。
 * 資料完全是靜態的（寫死在元件外的陣列），不需要呼叫 API。
 *
 * 學習重點：
 *   - 靜態資料陣列：直接定義在元件函式外（不需要 useState）
 *   - useEffect 只執行捲頂端（不需要 useState，因為沒有資料要管理）
 *   - .map() 把靜態資料陣列轉成卡片清單
 *   - key={area.name}：靜態資料可用唯一名稱字串作 key
 */

// useEffect：進頁面時捲到頂端（這頁沒有 API 呼叫，不需要 useState）
import { useEffect } from 'react';
import SEOHead from '../components/SEOHead';

// ── 靜態資料陣列（定義在元件函式外）──────────────────────────────
// 這份資料不需要從 API 取得，直接寫死
// 定義在函式外的好處：每次元件重新渲染時，不會重新建立這個陣列
const areas = [
  {
    name: '正殿',
    description: '本廟正殿供奉主神玄天上帝金身，殿內雕梁畫棟，金碧輝煌，為信眾禮拜祈福之主要空間。殿前設有大型香爐，香火終年鼎盛。',
    img: 'https://picsum.photos/seed/env_hall/600/400',
  },
  {
    name: '廟前廣場',
    description: '廟前廣場寬敞舒適，可容納大型祭典活動。廣場設有石獅鎮守、花圃造景，環境清幽，為信眾聚集休憩之場所。',
    img: 'https://picsum.photos/seed/env_square/600/400',
  },
  {
    name: '後殿',
    description: '後殿供奉地藏王菩薩及諸位神明，環境莊嚴肅穆，定期舉辦法會與誦經活動，歡迎信眾參與。',
    img: 'https://picsum.photos/seed/env_rear/600/400',
  },
  {
    name: '文物展覽室',
    description: '展覽室收藏廟宇歷史文物、古匾額及珍貴器物，完整記錄本廟百年歷史沿革，是認識在地文化的最佳場所。',
    img: 'https://picsum.photos/seed/env_exhibit/600/400',
  },
  {
    name: '活動中心',
    description: '活動中心提供各類藝文活動、講座、研習課程之場地，並備有完善的廚房設備，定期舉辦社區共餐活動。',
    img: 'https://picsum.photos/seed/env_center/600/400',
  },
  {
    name: '停車場',
    description: '廟旁設有免費停車場，可容納小客車約30輛，前方亦有機車停放區，方便信眾前來禮拜。',
    img: 'https://picsum.photos/seed/env_parking/600/400',
  },
];

export default function Environment() {
  // useEffect：進頁面時捲到頂端
  // 注意：這個元件沒有任何 useState，因為資料是靜態的（areas 陣列）
  // [] 空陣列 → 只在掛載時執行一次
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    // max-w-5xl mx-auto px-4 py-12：最大寬 64rem，水平置中，內距
    <main className="max-w-5xl mx-auto px-4 py-12">
      <SEOHead title="環境介紹" />

      {/* 頁面標題 */}
      <div className="text-center mb-12">
        <h1 className="font-serif text-3xl text-temple-green-dark mb-2">環境介紹</h1>
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-0.5 bg-temple-gold" />
          <span className="text-temple-gold text-xl">❖</span>
          <div className="w-16 h-0.5 bg-temple-gold" />
        </div>
        <p className="text-sm text-gray-500 mt-4">歡迎參觀本廟各項設施，感受莊嚴清幽的宗教氛圍</p>
      </div>

      {/* ── 區域卡片格網 ──────────────────────────────────────────
          grid md:grid-cols-2：桌面版 2 欄，手機版單欄
          gap-8：格子間距 2rem
      */}
      <div className="grid md:grid-cols-2 gap-8">
        {/*
          .map() 將靜態資料陣列渲染成卡片：
            areas.map((area) => ...)：遍歷 areas 陣列裡的每個物件
            key={area.name}：靜態資料沒有數字 id，用 name 字串作 key
                             因為每個區域名稱都是唯一的，所以安全
        */}
        {areas.map((area) => (
          // overflow-hidden：讓圖片不超出卡片圓角
          <div key={area.name} className="temple-card overflow-hidden">
            {/* h-52 object-cover：固定高度 13rem，等比裁切填滿，視覺整齊 */}
            <img
              src={area.img}
              alt={area.name}
              className="w-full h-52 object-cover"
            />
            <div className="p-5">
              {/* flex items-center gap-2：菱形裝飾符號和標題並排置中 */}
              <h2 className="font-serif text-xl text-temple-green-dark mb-2 flex items-center gap-2">
                <span className="text-temple-gold text-sm">◆</span>
                {area.name}
              </h2>
              {/* leading-relaxed：行高 1.625，易讀 */}
              <p className="text-sm text-gray-600 leading-relaxed">{area.description}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
