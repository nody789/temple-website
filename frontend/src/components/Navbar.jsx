/**
 * 【檔案說明】components/Navbar.jsx — 頂部導覽列元件
 *
 * 這個元件實作了網站頂部的導覽列，包含：
 *   - 最頂端的金色資訊列（廟宇標語）
 *   - Logo 和廟宇名稱
 *   - 電腦版的水平選單
 *   - 手機版的漢堡選單（可展開/收合）
 *   - 滾動時自動加上陰影效果
 *   - 標示目前所在頁面（active 樣式）
 *
 * 使用的 React Hooks：
 *   - useState：管理選單是否展開（menuOpen）、是否已滾動（scrolled）
 *   - useEffect：掛載後監聽 scroll 事件
 */

// useState：管理元件內的可變狀態
// useEffect：掛載後執行副作用（事件監聽）
import { useState, useEffect } from 'react';

// Link：react-router-dom 的連結元件，不會重新載入頁面（SPA 導航）
//   與 <a href="..."> 的差別：Link 使用前端路由，不真正向伺服器請求新頁面
// useLocation：取得目前的 URL 路徑資訊
import { Link, useLocation } from 'react-router-dom';

// useSettings：從 SettingsContext 取得全站設定（廟名等）
import { useSettings } from '../context/SettingsContext';

/**
 * Navbar 元件
 * 不接收 props，所需資料都來自 Context 和瀏覽器 API
 */
export default function Navbar() {

  /**
   * menuOpen 狀態：手機版選單是否展開
   * false = 收合（預設）、true = 展開
   */
  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * scrolled 狀態：頁面是否已向下滾動超過 10px
   * false = 在頂部、true = 已滾動（會加上陰影）
   */
  const [scrolled, setScrolled] = useState(false);

  /**
   * useSettings：取得後台設定的廟宇名稱
   * settings 是一個物件，settings.site_name 可能是字串或 undefined（資料未載入時）
   */
  const settings = useSettings();

  /**
   * 廟宇名稱：優先使用後台設定值，若不存在則用預設名稱
   * || 運算子：左側為 falsy（undefined、null、空字串）時取右側的值
   */
  const siteName = settings.site_name || '南天母中壇元帥道場';

  /**
   * useLocation：取得目前 URL 的 location 物件
   * location.pathname 就是目前的路徑，例如 '/news' 或 '/about'
   * 用來判斷哪個選單項目是目前頁面（顯示 active 樣式）
   */
  const location = useLocation();

  /**
   * useEffect：掛載後監聽頁面滾動事件
   *
   * 依賴陣列 []：只在掛載時執行一次（加上監聽器）
   *
   * onScroll 函式：
   *   window.scrollY 是目前向下滾動的像素數
   *   > 10 表示滾動超過 10px 就設 scrolled 為 true
   *
   * 清理函式 return () => removeEventListener(...)：
   *   元件卸載時移除監聽器，避免記憶體洩漏
   */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /**
   * 導覽連結設定陣列
   * 每個物件包含：
   *   to：連結的路徑
   *   label：顯示的文字
   *
   * 把設定和 JSX 分開，讓渲染邏輯更乾淨（避免在 JSX 裡寫一堆重複的 <Link>）
   */
  const navLinks = [
    { to: '/', label: '首頁' },
    { to: '/about', label: '本廟簡介' },
    { to: '/environment', label: '環境介紹' },
    { to: '/news', label: '最新消息' },
    { to: '/activities', label: '活動訊息' },
    { to: '/register', label: '線上報名' },
    { to: '/contact', label: '聯絡我們' },
  ];

  /**
   * isActive 函式：判斷某個連結路徑是否是目前頁面
   *
   * 首頁（/）要精確比對，否則所有頁面都會符合 startsWith('/')
   * 其他頁面使用 startsWith，可以讓子路徑也顯示 active
   *   例如：to='/news' 且目前路徑是 '/news/123'，也會顯示為 active
   *
   * @param {string} path - 連結路徑
   * @returns {boolean} - true 表示目前在這個頁面
   */
  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    // sticky top-0  → 黏著定位，頁面往下滾動時導覽列固定在視窗頂部
    // z-50          → z-index: 50，確保在其他元素上方顯示
    // transition-shadow duration-300 → 陰影變化時有 300ms 漸變動畫
    // shadow-lg     → 滾動後顯示較大的陰影（由 scrolled 狀態動態加入）
    <header
      className={`sticky top-0 z-50 transition-shadow duration-300 ${
        scrolled ? 'shadow-lg' : ''
      }`}
    >
      {/* ====== 頂部金色資訊列 ======
          bg-temple-gold      → 背景色：自訂的金色（在 tailwind.config.js 定義）
          text-temple-dark    → 文字顏色：自訂的深色
          text-sm             → 字體大小 0.875rem（14px）
          py-1.5              → 上下內距各 6px（1.5 × 4px）
          px-4                → 左右內距各 16px
          text-center         → 文字水平置中
          tracking-widest     → 字距最寬（增加文字間距，適合中文口號）
          font-medium         → 字重 500（介於 normal 和 bold 之間）
      */}
      <div className="bg-temple-gold text-temple-dark text-sm py-1.5 px-4 text-center tracking-widest font-medium">
        虔誠信仰 · 傳承文化 · 守護平安
      </div>

      {/* ====== 主導覽列 ======
          bg-white        → 白色背景
          border-b        → 底部邊框線
          border-gray-200 → 邊框顏色：淺灰色
      */}
      <nav className="bg-white border-b border-gray-200">
        {/*
          max-w-6xl  → 最大寬度 72rem（1152px），讓內容在大螢幕不過度拉伸
          mx-auto    → 水平方向自動外距，讓容器水平置中
          px-4       → 左右內距各 16px
          flex       → 啟用 Flexbox 排版
          items-center → 垂直方向置中（讓 Logo 和選單對齊）
          justify-between → 兩端對齊（Logo 靠左，選單靠右）
          h-16       → 高度 64px（固定 Navbar 高度）
        */}
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">

          {/* ====== Logo / 廟名區塊 ======
              Link to="/"：點擊後返回首頁（使用前端路由，不重新載入）
              flex items-center → 讓 Logo 圖示和廟名水平對齊
              gap-3 → 圖示和廟名之間的間距 12px
          */}
          <Link to="/" className="flex items-center gap-3">
            {/*
              w-10 h-10      → 寬高各 40px（圓形 Logo）
              bg-temple-gold → 金色背景
              rounded-full   → 圓形
              flex items-center justify-center → 讓「廟」字置中
              text-white     → 白色文字
              font-serif     → serif 字體
              font-bold      → 粗體
              text-lg        → 字體大小 1.125rem（18px）
            */}
            <div className="w-10 h-10 bg-temple-gold rounded-full flex items-center justify-center text-white font-serif font-bold text-lg">
              廟
            </div>
            {/*
              font-serif            → serif 字體
              text-xl               → 字體大小 1.25rem（20px）
              font-bold             → 粗體
              text-temple-green-dark → 自訂的深綠色文字
              tracking-wide         → 適度加寬字距
              hidden sm:block       → 手機版隱藏（hidden），sm 以上才顯示（block）
                                      這讓小螢幕只顯示圓形 Logo，不顯示廟名文字
            */}
            <span className="font-serif text-xl font-bold text-temple-green-dark tracking-wide hidden sm:block">
              {siteName}
            </span>
          </Link>

          {/* ====== 電腦版水平選單 ======
              hidden md:flex → 手機版隱藏，md（768px）以上顯示為 flex 排列
              items-center   → 垂直置中
              gap-1          → 選單項目之間的間距 4px
          */}
          <ul className="hidden md:flex items-center gap-1">
            {/*
              navLinks.map：遍歷連結陣列，渲染每個選單項目
              key={link.to}：使用路徑作為唯一 key（路徑不重複）
            */}
            {navLinks.map((link) => (
              <li key={link.to}>
                {/*
                  className 說明：
                  px-3             → 左右內距 12px
                  py-2             → 上下內距 8px
                  text-sm          → 字體大小 14px
                  font-medium      → 字重 500
                  rounded-sm       → 小圓角
                  transition-colors duration-200 → 顏色變化有 200ms 動畫
                  border-b-2       → 底部邊框線寬 2px（active 時顯示）
                  hover:text-temple-gold → 滑鼠懸停時文字變金色
                */}
                <Link
                  to={link.to}
                  className={`px-3 py-2 text-sm font-medium rounded-sm transition-colors duration-200 ${
                    isActive(link.to)
                      ? 'text-temple-gold border-b-2 border-temple-gold'  // active 狀態：金色文字 + 底部金色邊框
                      : 'text-temple-green hover:text-temple-gold'         // 一般狀態：綠色文字，hover 變金色
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* ====== 手機版漢堡選單按鈕 ======
              md:hidden → md（768px）以上隱藏（電腦版不需要漢堡按鈕）
              p-2       → 內距 8px（增加點擊區域）
              rounded   → 輕微圓角
              text-temple-green → 圖示顏色
              hover:bg-gray-100 → hover 時淺灰色背景
          */}
          {/*
            onClick：點擊時切換 menuOpen 狀態（true ↔ false）
              !menuOpen 是邏輯非（NOT），反轉布林值
            aria-label：無障礙屬性，讓螢幕閱讀器知道這個按鈕的用途
          */}
          <button
            className="md:hidden p-2 rounded text-temple-green hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="開啟選單"
          >
            {/* 漢堡 icon 由三條線組成，每條線都是一個 div
                menuOpen 為 true 時，第一條和第三條旋轉形成 X（叉叉），第二條淡出 */}
            <div className={`w-5 h-0.5 bg-temple-green mb-1 transition-transform ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            {/*
              w-5           → 寬度 20px
              h-0.5         → 高度 2px（細線）
              bg-temple-green → 線條顏色：綠色
              mb-1          → 下方外距 4px（線條之間的間距）
              transition-transform → transform 變化加動畫
              rotate-45     → 旋轉 45 度（menuOpen 時，第一條線）
              translate-y-1.5 → 向下移動 6px（讓兩條旋轉的線在同一點相交）
            */}
            <div className={`w-5 h-0.5 bg-temple-green mb-1 transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            {/* opacity-0 → 完全透明（menuOpen 時中間線消失） */}
            <div className={`w-5 h-0.5 bg-temple-green transition-transform ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            {/* -rotate-45   → 旋轉 -45 度（menuOpen 時，第三條線）
                -translate-y-1.5 → 向上移動 6px */}
          </button>
        </div>

        {/* ====== 手機版下拉選單 ======
            menuOpen && (...)：條件渲染，只有 menuOpen 為 true 時才渲染
            md:hidden     → md 以上隱藏（電腦版不需要）
            bg-temple-cream → 自訂的米黃色背景
            px-4          → 左右內距 16px
            pb-4          → 下方內距 16px
            border-t border-gray-200 → 頂部分隔線
        */}
        {menuOpen && (
          <div className="md:hidden bg-temple-cream px-4 pb-4 border-t border-gray-200">
            {/*
              className 說明：
              block     → display: block，讓連結佔滿整行寬度（方便點擊）
              py-2.5    → 上下內距 10px
              border-b border-gray-200 → 每個選項下方有分隔線
              text-sm   → 字體大小 14px
              font-medium → 字重 500
              onClick={() => setMenuOpen(false)} → 點擊後關閉選單
            */}
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block py-2.5 border-b border-gray-200 text-sm font-medium ${
                  isActive(link.to) ? 'text-temple-gold' : 'text-temple-green'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
