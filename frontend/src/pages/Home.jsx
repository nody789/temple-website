/**
 * 【頁面說明】Home.jsx — 網站首頁
 *
 * 負責展示：輪播圖、裝飾標語、本廟簡介、最新消息、近期活動、報名號召。
 *
 * 學習重點：
 *   - useState：儲存 API 取回的陣列資料（新聞、活動）
 *   - useEffect + 空陣列 []：頁面載入時只執行一次 API 請求
 *   - .map()：將陣列資料轉換成 JSX 卡片清單
 *   - Tailwind CSS：以工具類別快速撰寫響應式樣式
 */

// useEffect：「副作用」hook，元件渲染後執行（打 API、設定計時器等）
// useState：「狀態」hook，讓元件能夠記住會變動的資料
import { useEffect, useState } from 'react';
// Link：React Router 提供的連結元件，點擊後不重整頁面（SPA 導覽）
import { Link } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider';
import api from '../api';
// useSettings：自訂 Hook，從 SettingsContext 取得後台設定值（廟名、標語等）
import { useSettings } from '../context/SettingsContext';
import SEOHead from '../components/SEOHead';

export default function Home() {
  const settings = useSettings();

  // ── useState 宣告 ──────────────────────────────────────────────
  // useState([])：初始值為「空陣列」，資料尚未從 API 抓回
  // 語法：const [狀態值, 更新函式] = useState(初始值)
  const [news, setNews] = useState([]);
  const [activities, setActivities] = useState([]);

  // ── useEffect：頁面載入後執行一次 API 請求 ─────────────────────
  // 第二個參數是「依賴陣列」：
  //   [] 空陣列  → 只在元件第一次掛載（mount）時執行一次
  //   [someVar] → 每當 someVar 改變時重新執行
  //   省略不填  → 每次重新渲染都執行（通常不這樣做）
  useEffect(() => {
    // .then((res) => setNews(res.data))：成功後把資料存入 news 狀態
    // .catch(() => {})：失敗時靜默忽略
    api.get('/news?limit=4').then((res) => setNews(res.data)).catch(() => {});
    // .slice(0, 3)：只取陣列前 3 筆顯示在首頁
    api.get('/activities').then((res) => setActivities(res.data.slice(0, 3))).catch(() => {});
  }, []); // ← 空陣列，只執行一次

  // 格式化日期："2024-12-25T00:00:00" → "2024/12/25"
  // String(dateStr).slice(0, 10)：取前 10 字元 "YYYY-MM-DD"
  // .replace(/-/g, '/')：/g 是全域旗標，把所有 "-" 換成 "/"
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return String(dateStr).slice(0, 10).replace(/-/g, '/');
  };

  return (
    <main>
      <SEOHead />
      {/* 輪播圖 */}
      <HeroSlider />

      {/* ── 裝飾標語 ─────────────────────────────────────────────
          bg-temple-gold：自訂主題色（亮金色背景）
          text-center：文字置中
          py-4：上下 padding 各 1rem（py = padding-y = padding-top + padding-bottom）
          font-serif：使用襯線字體（更有古典廟宇感）
          tracking-widest：字距最寬（讓中文字間距更舒適）
      */}
      <div className="bg-temple-gold text-temple-dark text-center py-4 px-4">
        <p className="font-serif text-lg tracking-widest">
          {/* || 是「或」運算符：有設定就用設定值，否則用預設文字 */}
          ❖ {settings.site_subtitle || '神恩浩蕩，庇佑四方'} ❖
        </p>
      </div>

      {/* ── 本廟簡介 ──────────────────────────────────────────────
          max-w-6xl：最大寬度 72rem，防止在大螢幕上過寬
          mx-auto：左右 margin 自動 → 水平置中
          px-4 py-14：左右內距 1rem，上下內距 3.5rem
          grid：啟用 CSS Grid 排版
          md:grid-cols-2：768px 以上分成 2 欄（"md:" 是 Tailwind 響應式前綴）
          gap-8：格子間距 2rem
          items-center：垂直方向對齊到中間
      */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        {/* section-title：在 index.css 自訂的樣式類別 */}
        <h2 className="section-title">本廟簡介</h2>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            {/* w-full：寬度 100%；shadow-lg：較大陰影；border-temple-gold/30：金色邊框透明度 30% */}
            <img
              src="https://picsum.photos/seed/templeabout/600/400"
              alt="廟宇外觀"
              className="w-full rounded-sm shadow-lg border-4 border-temple-gold/30"
            />
          </div>
          {/* space-y-4：子元素之間的垂直間距 1rem */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl text-temple-green-dark">
              {settings.site_name || '玄天上帝廟'}
            </h3>
            {/* 裝飾用金色分隔線：w-16 寬 4rem、h-0.5 高 2px */}
            <div className="w-16 h-0.5 bg-temple-gold" />
            {/* leading-relaxed：行高 1.625（寬鬆，易讀）；text-justify：兩端對齊 */}
            <p className="text-gray-700 leading-relaxed text-justify">
              {settings.about_text || '載入中...'}
            </p>
            <p className="text-sm text-gray-500">
              🕐 開放時間：{settings.open_hours || '每日上午 06:00 - 晚上 09:00'}
            </p>
            {/* inline-block：讓連結可以設定 padding；btn-primary：自訂按鈕樣式 */}
            <Link to="/about" className="inline-block btn-primary mt-2">
              了解更多
            </Link>
          </div>
        </div>
      </section>

      {/* ── 傳統花紋分隔 ─────────────────────────────────────────
          bg-temple-cream-dark：自訂米色深色背景，與上下白色區塊形成視覺區隔
          flex：Flexbox；items-center：垂直置中；justify-center：水平置中
          gap-4：子元素間距 1rem
      */}
      <div className="bg-temple-cream-dark py-6">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-4 text-temple-gold">
          <span className="text-2xl">❧</span>
          {/* text-sm：字體 0.875rem；tracking-widest：最寬字距 */}
          <span className="text-sm text-temple-green tracking-widest">虔誠禮拜 · 祈求平安 · 傳承文化</span>
          <span className="text-2xl">❧</span>
        </div>
      </div>

      {/* ── 最新消息 ──────────────────────────────────────────────
          grid md:grid-cols-2：手機版單欄，桌面版 2 欄
      */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="section-title">最新消息</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {/*
            ── .map() 列表渲染 ────────────────────────────────────
            news.map((item) => (...))：
              把 news 陣列裡的每一個物件 item 轉換成一張 JSX 卡片
            key={item.id}：
              React 要求列表每個元素都要有唯一的 key，
              讓 React 在資料更新時能識別哪個元素改變了
          */}
          {news.map((item) => (
            <Link
              key={item.id}
              to={`/news/${item.id}`}
              className="temple-card p-4 flex gap-4 hover:border-temple-gold/60"
            >
              {/* 日期方塊
                  shrink-0：禁止縮小（flex 子元素預設可能被壓縮）
                  w-14：固定寬度 3.5rem
                  bg-temple-green text-white：綠底白字
              */}
              <div className="shrink-0 w-14 text-center bg-temple-green text-white rounded-sm py-1 px-2">
                {/* 顯示年份 */}
                <div className="text-xs">{formatDate(item.published_at).split('/')[0]}</div>
                {/* text-lg font-bold 讓月/日數字更醒目 */}
                <div className="text-lg font-bold leading-tight">
                  {formatDate(item.published_at).split('/')[1]}/{formatDate(item.published_at).split('/')[2]}
                </div>
              </div>
              {/* flex-1：佔滿剩餘空間；min-w-0：允許截斷（讓 truncate 生效） */}
              <div className="flex-1 min-w-0">
                {/* truncate：超過寬度時顯示省略號 "..." */}
                <h3 className="font-medium text-temple-dark truncate">{item.title}</h3>
                {/* line-clamp-2：最多顯示 2 行，超過則省略 */}
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.content}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link to="/news" className="btn-secondary">
            查看全部消息
          </Link>
        </div>
      </section>

      {/* ── 活動訊息 ──────────────────────────────────────────────
          bg-temple-cream-dark：米色深色背景，區隔上下區塊
          grid md:grid-cols-3：桌面版 3 欄卡片排列
      */}
      <section className="bg-temple-cream-dark py-14">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="section-title">近期活動</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* activities.map()：用 .map() 把活動陣列轉成卡片清單 */}
            {activities.map((act) => (
              // overflow-hidden：讓圖片不超出卡片圓角邊界
              <div key={act.id} className="temple-card overflow-hidden">
                {/* h-40 object-cover：固定高度 10rem，等比裁切填滿，不變形 */}
                <img
                  src={act.image_url || `https://picsum.photos/seed/act${act.id}/400/220`}
                  alt={act.title}
                  loading="lazy"
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="text-xs text-temple-green font-medium mb-1">
                    {formatDate(act.start_date)}
                    {/*
                      ── 條件渲染（&& 短路運算）────────────────────
                      act.end_date && act.end_date !== act.start_date && ` ~ ...`
                      → 結束日期存在「且」不等於開始日期，才顯示結束日期
                      → 若活動是單日，不顯示結束日期
                    */}
                    {act.end_date && act.end_date !== act.start_date && ` ~ ${formatDate(act.end_date)}`}
                  </div>
                  <h3 className="font-serif font-bold text-temple-dark">{act.title}</h3>
                  {/*
                    ── && 短路條件渲染 ────────────────────────────
                    act.location && <p>...</p>
                    → 若 act.location 有值（truthy），才渲染 <p>
                    → 若為 null / undefined / ''，不顯示任何東西
                  */}
                  {act.location && (
                    <p className="text-xs text-gray-500 mt-1">📍 {act.location}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/activities" className="btn-primary">
              全部活動
            </Link>
          </div>
        </div>
      </section>

      {/* ── 報名號召區塊 ─────────────────────────────────────────
          bg-temple-green：深綠色背景
          text-white/80：白色文字，透明度 80%（略帶透明，讓視覺有層次）
          text-2xl md:text-3xl：手機 1.5rem，桌面（md:）升至 1.875rem（響應式）
          btn-secondary：次要按鈕樣式（金色邊框款）
      */}
      <section className="bg-temple-green py-12 text-center text-white">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">參與活動 · 共結善緣</h2>
          <p className="text-white/80 mb-6">歡迎信眾踴躍參加廟宇各項活動，一同祈福平安</p>
          <Link to="/register" className="btn-secondary text-base px-8 py-3">
            立即線上報名
          </Link>
        </div>
      </section>
    </main>
  );
}
