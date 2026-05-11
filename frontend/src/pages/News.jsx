/**
 * 【頁面說明】News.jsx — 最新消息列表頁
 *
 * 從後端 API 取得所有新聞消息，以列表形式呈現。
 *
 * 學習重點：
 *   - useState 管理「載入中」狀態（loading）與資料陣列（news）
 *   - useEffect 在頁面掛載後呼叫 API
 *   - 三層條件渲染：loading / 無資料 / 有資料
 *   - .map() 將新聞陣列渲染成卡片清單
 *   - Tailwind：space-y-4、line-clamp-2、shrink-0
 */

// useEffect：在元件掛載後執行副作用（呼叫 API）
// useState：管理狀態（新聞資料、是否載入中）
import { useEffect, useState } from 'react';
// Link：SPA 路由連結，點擊後不重整頁面
import { Link } from 'react-router-dom';
import api from '../api';
import SEOHead from '../components/SEOHead';

export default function News() {
  // news：儲存從 API 取得的新聞陣列，初始值為空陣列 []
  const [news, setNews] = useState([]);
  // loading：是否正在載入資料，初始值為 true（一開始就是載入中）
  // 用來決定要顯示「載入中...」文字還是實際內容
  const [loading, setLoading] = useState(true);

  // useEffect：元件掛載後執行一次
  // [] 空陣列 → 只執行一次
  useEffect(() => {
    window.scrollTo(0, 0); // 進入頁面時捲到最頂端
    api.get('/news')
      .then((res) => setNews(res.data)) // 成功：把資料存入 news
      .finally(() => setLoading(false)); // .finally() 一定會執行，關閉 loading
  }, []);

  // 格式化日期："2024-12-25" → "2024 年 12 月 25 日"
  // getMonth() 從 0 開始，所以要 +1
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  };

  return (
    // max-w-4xl：最大寬度 56rem；mx-auto px-4 py-12：置中與內距
    <main className="max-w-4xl mx-auto px-4 py-12">
      <SEOHead title="最新消息" />

      {/* 頁面標題 */}
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl text-temple-green-dark mb-2">最新消息</h1>
        {/* 裝飾分隔線：flex + items-center + justify-center 讓三元素水平置中並排 */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-0.5 bg-temple-gold" />
          <span className="text-temple-gold text-xl">❖</span>
          <div className="w-16 h-0.5 bg-temple-gold" />
        </div>
      </div>

      {/*
        ── 三層條件渲染（巢狀三元運算子）────────────────────────
        語法：條件A ? A成立 : (條件B ? B成立 : 都不成立)

        第一層：loading 為 true → 顯示「載入中...」
        第二層：news.length === 0 → 顯示「目前尚無消息」
        否則（有資料）→ 渲染新聞卡片清單

        這是 React 頁面「先判斷載入，再判斷資料是否為空」的常見模式
      */}
      {loading ? (
        // py-20：上下 padding 5rem，讓文字在視覺上置中
        <div className="text-center py-20 text-gray-400">載入中...</div>
      ) : news.length === 0 ? (
        <div className="text-center py-20 text-gray-400">目前尚無消息</div>
      ) : (
        // space-y-4：子元素之間垂直間距 1rem（比 grid 更適合單欄清單）
        <div className="space-y-4">
          {/*
            .map() 列表渲染：
              news.map((item) => ...)：把每筆新聞物件轉換成一個 <Link> 卡片
              key={item.id}：React 需要唯一 key 來追蹤列表元素
          */}
          {news.map((item) => (
            // flex gap-4 items-start：子元素並排、間距 1rem、頂部對齊
            // hover:border-temple-gold/60：懸停時邊框顏色改為金色（透明度60%）
            <Link
              key={item.id}
              to={`/news/${item.id}`}
              className="temple-card p-5 flex gap-4 items-start hover:border-temple-gold/60 block"
            >
              {/* 日期方塊：shrink-0 禁止縮小；w-16 固定寬度 4rem */}
              <div className="shrink-0 w-16 text-center bg-temple-green text-white rounded-sm py-1.5">
                {/* .slice(0, 4)：取前4碼 = 年份 */}
                <div className="text-xs leading-tight">{String(item.published_at).slice(0, 4)}</div>
                <div className="text-lg font-bold leading-tight">
                  {/* slice(5,7)：月份；slice(8,10)：日期 */}
                  {String(item.published_at).slice(5, 7)}/{String(item.published_at).slice(8, 10)}
                </div>
              </div>
              {/* flex-1：佔滿剩餘空間；min-w-0：允許縮小到 0（讓 truncate 生效） */}
              <div className="flex-1 min-w-0">
                <h2 className="font-medium text-temple-dark text-base">{item.title}</h2>
                {/* line-clamp-2：最多顯示 2 行，超過截斷並顯示 "..." */}
                <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{item.content}</p>
                <span className="text-xs text-temple-green mt-2 inline-block">閱讀全文 ›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
