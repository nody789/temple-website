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
import PageTitle from '../components/PageTitle';
import useScrollToTop from '../hooks/useScrollToTop';
// SkeletonCard：載入中的骨架屏佔位元件，取代純文字「載入中...」
import SkeletonCard from '../components/SkeletonCard';

export default function Activities() {
  // activities：活動資料陣列，初始為空陣列
  const [activities, setActivities] = useState([]);
  // loading：是否正在向後端請求資料，初始值 true
  const [loading, setLoading] = useState(true);

  // useScrollToTop：進頁面時捲到最頂端（自訂 Hook）
  useScrollToTop();

  // useEffect：頁面掛載後執行一次（只負責 API 請求）
  useEffect(() => {
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

      {/* PageTitle：共用的頁面標題元件 */}
      <PageTitle title="活動訊息" />

      {/*
        ── 三層條件渲染（巢狀三元運算子）────────────────────────
        1. loading 為 true → 顯示「載入中...」
        2. activities.length === 0 → 顯示「目前尚無活動」
        3. 其餘情況 → 渲染活動卡片格網
      */}
      {loading ? (
        // 骨架屏：顯示 4 個佔位卡片，取代「載入中...」純文字
        // 格子數量和真實內容相同，讓使用者對頁面結構有預期感
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} imageH="h-44" lines={3} />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-20 text-gray-400">目前尚無活動</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {activities.map((act) => (
            <div key={act.id} className="temple-card overflow-hidden">
              {/*
                loading="lazy"：
                  瀏覽器的原生懶載入（Lazy Loading）屬性。
                  只有當圖片「快要進入可視區域」時才開始下載，
                  不會在頁面一開啟就把所有圖片全部下載，
                  大幅加快首次載入速度（尤其是有很多圖片的頁面）。
              */}
              <img
                src={act.image_url || `https://picsum.photos/seed/act${act.id}/500/250`}
                alt={act.title}
                loading="lazy"
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
