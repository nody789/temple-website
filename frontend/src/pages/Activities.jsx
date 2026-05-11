/**
 * 【頁面說明】Activities.jsx — 活動訊息列表頁
 *
 * 從後端 API 取得所有活動資料，以卡片格網（Grid）形式呈現。
 *
 * 學習重點：
 *   - useState 管理活動資料（activities）與 loading 狀態
 *   - useEffect 進入頁面後向 API 發送請求
 *   - 三元運算子多層條件（loading / 無資料 / 有資料）
 *   - && 短路條件渲染（只有地點存在才顯示）
 *   - Tailwind：overflow-hidden、object-cover、line-clamp-3
 */

// useEffect、useState：React Hooks
import { useEffect, useState } from 'react';
// Link：SPA 路由連結
import { Link } from 'react-router-dom';
import api from '../api';
import SEOHead from '../components/SEOHead';

export default function Activities() {
  // activities：活動資料陣列，初始為空陣列
  const [activities, setActivities] = useState([]);
  // loading：是否正在向後端請求資料，初始值 true
  const [loading, setLoading] = useState(true);

  // useEffect：頁面掛載後執行一次（空依賴陣列）
  useEffect(() => {
    window.scrollTo(0, 0);
    api.get('/activities')
      .then((res) => setActivities(res.data)) // 成功：儲存活動陣列
      .finally(() => setLoading(false));       // 完成：關閉 loading
  }, []);

  // 格式化日期："2024-12-25T00:00:00" → "2024/12/25"
  // 若無日期（null / undefined），回傳 '日期待定'
  const formatDate = (dateStr) => {
    if (!dateStr) return '日期待定';
    return String(dateStr).slice(0, 10).replace(/-/g, '/');
  };

  return (
    // max-w-5xl mx-auto px-4 py-12：最大寬 64rem，水平置中，內距
    <main className="max-w-5xl mx-auto px-4 py-12">
      <SEOHead title="活動訊息" />

      {/* 頁面標題 */}
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl text-temple-green-dark mb-2">活動訊息</h1>
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-0.5 bg-temple-gold" />
          <span className="text-temple-gold text-xl">❖</span>
          <div className="w-16 h-0.5 bg-temple-gold" />
        </div>
      </div>

      {/*
        ── 三層條件渲染（巢狀三元運算子）────────────────────────
        1. loading 為 true → 顯示「載入中...」
        2. activities.length === 0 → 顯示「目前尚無活動」
        3. 其餘情況 → 渲染活動卡片格網
      */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">載入中...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-20 text-gray-400">目前尚無活動</div>
      ) : (
        // grid md:grid-cols-2：手機單欄，桌面版 2 欄；gap-6：格子間距 1.5rem
        <div className="grid md:grid-cols-2 gap-6">
          {/*
            .map() 列表渲染：
              activities.map((act) => ...)：遍歷每筆活動物件 act
              key={act.id}：以活動 id 作為唯一 key
          */}
          {activities.map((act) => (
            // overflow-hidden：讓圖片不超出卡片圓角邊界
            <div key={act.id} className="temple-card overflow-hidden">
              {/* h-44 object-cover：固定高度 11rem，等比裁切填滿，不變形 */}
              <img
                src={act.image_url || `https://picsum.photos/seed/act${act.id}/500/250`}
                alt={act.title}
                className="w-full h-44 object-cover"
              />
              <div className="p-5">
                {/* flex items-center gap-2：圖示和日期文字水平並排、垂直置中 */}
                <div className="flex items-center gap-2 text-xs text-temple-green font-medium mb-2">
                  <span>📅</span>
                  <span>
                    {formatDate(act.start_date)}
                    {/*
                      && 短路條件渲染：
                      act.end_date && act.end_date !== act.start_date && ` ~ ...`
                      → 結束日期存在「且」不等於開始日期，才顯示結束日期
                    */}
                    {act.end_date && act.end_date !== act.start_date && ` ~ ${formatDate(act.end_date)}`}
                  </span>
                </div>
                <h2 className="font-serif text-lg font-bold text-temple-dark mb-2">{act.title}</h2>
                {/*
                  && 短路條件渲染：
                  act.location && <p>...</p>
                  → 若 act.location 有值（truthy），才渲染 <p>
                */}
                {act.location && (
                  <p className="text-xs text-gray-500 mb-2">📍 {act.location}</p>
                )}
                {/* line-clamp-3：活動簡介最多顯示 3 行，超過截斷加省略號 */}
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{act.description}</p>
                {/* hover:underline：懸停時顯示底線 */}
                <Link
                  to="/register"
                  className="mt-4 inline-block text-sm text-temple-green font-medium hover:underline"
                >
                  立即報名 ›
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
