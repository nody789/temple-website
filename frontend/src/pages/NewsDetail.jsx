/**
 * 【頁面說明】NewsDetail.jsx — 單篇消息詳細頁
 *
 * 根據 URL 中的 id 參數，向後端請求對應的單筆新聞資料並顯示。
 * 例如：使用者瀏覽 /news/5，這個頁面就會向後端請求 id = 5 的新聞。
 *
 * 學習重點：
 *   - useParams：從 URL 路由參數中取得動態段落值（如 id）
 *   - useState 管理三種狀態：item（資料）、loading（載入中）、error（錯誤）
 *   - useEffect 依賴陣列填入 [id]：當 id 改變時重新抓資料
 *   - 條件提前回傳（Early return）：loading 或 error 時直接 return 簡單訊息
 *   - 條件渲染：只有當圖片網址存在時才顯示圖片
 */

// useEffect、useState：React 核心 Hooks
import { useEffect, useState } from 'react';
// useParams：從 URL 路由中取得動態參數
// 例如路由定義是 /news/:id，則 useParams() 回傳 { id: '5' }（字串）
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import SEOHead from '../components/SEOHead';

export default function NewsDetail() {
  // useParams 解構取得 URL 的 id 參數
  // 若目前網址是 /news/42，則 id = '42'
  const { id } = useParams();

  // item：儲存單筆新聞物件，初始值為 null（尚未取得）
  const [item, setItem] = useState(null);
  // loading：是否正在載入，初始值 true
  const [loading, setLoading] = useState(true);
  // error：是否發生錯誤（如 id 不存在），初始值 false
  const [error, setError] = useState(false);

  // useEffect 依賴陣列填入 [id]（不是空陣列）：
  //   當使用者從 /news/1 切換到 /news/2 時，id 改變，
  //   useEffect 重新執行，向後端請求新的資料
  useEffect(() => {
    window.scrollTo(0, 0);
    api.get(`/news/${id}`)              // 用模板字串帶入動態 id
      .then((res) => setItem(res.data)) // 成功：儲存消息資料
      .catch(() => setError(true))      // 失敗：標記錯誤
      .finally(() => setLoading(false)); // 完成：關閉 loading
  }, [id]); // ← [id] 表示 id 一旦改變就重新執行

  // ── 條件提前回傳（Early return）──────────────────────────────
  // 在資料尚未準備好時，提前 return 簡單 UI，避免主要 JSX 中大量判斷
  // 這是 React 的常見寫法：先處理「特殊情況」，再處理「正常情況」

  // py-32：上下 padding 8rem（讓文字視覺上置中於畫面）
  if (loading) return <div className="text-center py-32 text-gray-400">載入中...</div>;
  if (error) return <div className="text-center py-32 text-gray-400">找不到此消息</div>;

  // 到這裡 loading = false 且 error = false，item 已有資料，可以正常渲染

  return (
    // max-w-3xl：最大寬度 48rem，適合長文閱讀
    <main className="max-w-3xl mx-auto px-4 py-12">
      {/*
        SEOHead：
          title={item.title} → 分頁標題改為這篇消息的標題
          description={item.content?.slice(0, 120)} → 取內文前 120 字作 meta description
          ?. 是「可選鏈」（Optional Chaining）：若 item.content 為 null 不會報錯
      */}
      <SEOHead title={item.title} description={item.content?.slice(0, 120)} />

      {/* 返回連結：hover:underline 懸停時顯示底線 */}
      <Link to="/news" className="text-sm text-temple-green hover:underline mb-6 inline-block">
        ‹ 返回消息列表
      </Link>

      {/* <article>：語義化標籤，代表這是一篇獨立的文章內容 */}
      <article className="temple-card p-6 md:p-8">
        {/* 發布日期 */}
        <div className="text-xs text-temple-green mb-2">
          {/*
            即時執行函式（IIFE）格式化日期：
            (() => { ... })()：定義並立刻執行函式，回傳格式化字串
            解構賦值：const [y, m, d] = '2024-12-25'.split('-')
            parseInt(m)：把字串轉整數，去掉前導零（'01' → 1）
          */}
          {(() => { const [y,m,d] = String(item.published_at).slice(0,10).split('-'); return `${y} 年 ${parseInt(m)} 月 ${parseInt(d)} 日`; })()}
        </div>
        {/* border-b border-temple-gold/30 pb-4：底部金色半透明分隔線 */}
        <h1 className="font-serif text-2xl text-temple-dark mb-4 border-b border-temple-gold/30 pb-4">
          {item.title}
        </h1>
        {/*
          條件渲染：只有圖片網址存在時才顯示圖片
          item.image_url && (...)：
            若 image_url 為非空字串（truthy）→ 渲染圖片
            若為 null / undefined / '' → 不渲染任何東西
        */}
        {item.image_url && (
          // max-h-80：最大高度 20rem（圖片不會過高）
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full max-h-80 object-cover rounded-sm mb-6 border border-temple-gold/20"
          />
        )}
        {/* leading-relaxed：行高 1.625；whitespace-pre-line：保留後台輸入的換行 */}
        <div className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">
          {item.content}
        </div>
      </article>
    </main>
  );
}
