/**
 * 【檔案說明】components/admin/AdminLayout.jsx — 後台整體版型框架
 *
 * 這個元件是所有後台頁面的「外殼（Layout）」，提供：
 *   - 左側側欄（Sidebar）：顯示選單、管理員名稱、登出按鈕
 *   - 頂部列（Header）：顯示目前頁面名稱、手機版漢堡按鈕
 *   - 主要內容區：用 <Outlet /> 渲染子路由的頁面元件
 *   - 手機版覆蓋層：手機版側欄以抽屜（Drawer）形式覆蓋畫面
 *
 * 與前台不同，後台使用「側欄 + 主內容」的二欄式佈局（Dashboard 常見設計）。
 *
 * React Router 的 <Outlet /> 是什麼？
 *   在 App.jsx 中，後台路由使用了「巢狀路由（Nested Routes）」：
 *     <Route path="/admin" element={<AdminLayout />}>
 *       <Route path="news" element={<NewsManager />} />
 *       ...
 *     </Route>
 *   這時 AdminLayout 是父路由，<Outlet /> 就是子路由內容的渲染位置。
 *   當 URL 是 /admin/news 時，<Outlet /> 會渲染 <NewsManager />。
 *
 * 使用的 React Hooks：
 *   - useState：管理側欄是否展開（手機版）
 *   - useAuth：從 Context 取得登入資訊（管理員名稱、登出函式）
 *   - useNavigate：程式化導航（登出後跳轉到登入頁）
 *   - useLocation：取得目前路徑（判斷哪個選單項目 active）
 */

// useState：管理側欄開關狀態
import { useState } from 'react';

// Link：前端路由連結
// Outlet：子路由的渲染佔位元件
// useLocation：取得目前 URL 路徑
// useNavigate：程式化導航（執行跳頁動作）
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

// useAuth：從 AuthContext 取得 username 和 logout 函式
import { useAuth } from '../../context/AuthContext';

/**
 * 後台選單設定陣列
 * 把設定資料放在元件外面，避免每次渲染都重新建立陣列（效能優化）
 *
 * 每個物件包含：
 *   to：連結路徑
 *   label：顯示名稱
 *   icon：Emoji 圖示
 *   exact：是否精確比對路徑（只有首頁需要，避免 /admin 也匹配到 /admin/xxx）
 */
const menuItems = [
  { to: '/admin', label: '後台首頁', icon: '🏠', exact: true },
  { to: '/admin/carousel', label: '輪播管理', icon: '🖼️' },
  { to: '/admin/news', label: '消息管理', icon: '📰' },
  { to: '/admin/activities', label: '活動管理', icon: '📅' },
  { to: '/admin/registrations', label: '報名記錄', icon: '📋' },
  { to: '/admin/settings', label: '網站設定', icon: '⚙️' },
];

/**
 * AdminLayout 元件 — 後台版型框架
 */
export default function AdminLayout() {

  /**
   * useAuth：取得登入資訊
   * username → 目前登入的管理員名稱（顯示在側欄頂部）
   * logout   → 登出函式（清除 token 和 username）
   *
   * 這裡使用「解構賦值」從 useAuth() 回傳的物件中直接取出需要的屬性
   */
  const { username, logout } = useAuth();

  /**
   * useNavigate：取得導航函式
   * navigate('/admin/login') 會把使用者導向登入頁
   * 比 <Link> 更適合在「事件處理函式中」執行導航
   */
  const navigate = useNavigate();

  /**
   * useLocation：取得目前 URL 的 location 物件
   * location.pathname → 目前路徑字串，例如 '/admin/news'
   * 用來判斷哪個選單項目是 active 狀態
   */
  const location = useLocation();

  /**
   * sidebarOpen 狀態：手機版側欄是否展開
   * false = 收起（預設）、true = 展開（顯示側欄覆蓋層）
   */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /**
   * handleLogout：執行登出的處理函式
   *
   * 流程：
   *   1. 呼叫 logout()（從 AuthContext 取得）→ 清除 token、username
   *   2. 呼叫 navigate('/admin/login') → 跳轉到登入頁
   *
   * 為什麼不直接用 <Link>？
   *   因為登出需要先執行 logout() 再導航，是有邏輯的動作，不是單純的連結
   */
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  /**
   * isActive 函式：判斷某個選單項目是否是目前頁面
   *
   * item.exact = true（後台首頁）：精確比對，只有剛好是 /admin 才 active
   * 其他：使用 startsWith，/admin/news/123 也會讓 /admin/news 項目是 active
   *
   * @param {object} item - 選單項目物件
   * @returns {boolean} - true 表示目前在這個頁面
   */
  const isActive = (item) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

  /**
   * Sidebar 是一個定義在 AdminLayout 內部的「元件中的元件」
   *
   * 為什麼把 Sidebar 定義在內部？
   *   因為它需要用到 AdminLayout 的狀態（sidebarOpen、setSidebarOpen）
   *   和函式（isActive、handleLogout），這樣不需要另外傳 props。
   *
   * 注意：這樣的元件每次 AdminLayout 重新渲染都會重新建立 Sidebar 函式，
   *       對效能有一點影響，但這裡元件夠簡單，不需要特別優化。
   */
  const Sidebar = () => (
    // w-56      → 側欄寬度 224px（56 × 4px）
    // bg-temple-dark → 深色背景
    // text-white     → 白色文字
    // h-full         → 高度撐滿父容器
    // flex flex-col  → 垂直 Flex，讓選單、內容、底部各自佔位
    // shrink-0       → 防止側欄被 Flex 壓縮
    <aside className="w-56 bg-temple-dark text-white h-full flex flex-col shrink-0">

      {/* ====== 側欄頂部：後台標題 ======
          p-4               → 內距 16px
          border-b border-white/10 → 底部邊框，白色透明度 10%
      */}
      <div className="p-4 border-b border-white/10">
        {/*
          font-serif    → serif 字體
          text-temple-gold → 金色文字
          font-bold     → 粗體
        */}
        <div className="font-serif text-temple-gold font-bold">廟宇後台管理</div>
        {/*
          text-xs    → 字體大小 12px（很小）
          text-white/50 → 白色文字，透明度 50%（灰白色）
          mt-0.5     → 上方外距 2px
        */}
        <div className="text-xs text-white/50 mt-0.5">管理員：{username}</div>
      </div>

      {/* ====== 選單列表 ======
          flex-1    → 佔用剩餘所有空間（讓底部按鈕推到最底）
          p-3       → 內距 12px
          space-y-1 → 子元素之間垂直間距 4px
      */}
      <nav className="flex-1 p-3 space-y-1">
        {/*
          className 說明：
          flex items-center → 水平排列，垂直置中
          gap-2.5           → 圖示和文字間距 10px
          px-3 py-2.5       → 左右內距 12px，上下內距 10px
          rounded           → 輕微圓角
          text-sm           → 字體 14px
          transition-colors → 顏色變化加動畫
          hover:bg-white/10 → hover 時白色背景（透明度 10%），產生亮起效果
          onClick           → 點擊選單項目後關閉手機版側欄
        */}
        {menuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded text-sm transition-colors ${
              isActive(item)
                ? 'bg-temple-green text-white'           // active：綠色背景
                : 'text-white/70 hover:bg-white/10 hover:text-white' // 一般：半透明，hover 時亮起
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* ====== 側欄底部：查看前台 + 登出 ======
          p-3                    → 內距 12px
          border-t border-white/10 → 頂部邊框線（分隔選單和底部按鈕）
          space-y-1              → 子元素間距 4px
      */}
      <div className="p-3 border-t border-white/10 space-y-1">
        {/* 查看前台按鈕：在新分頁開啟前台
            target="_blank" → 在新分頁開啟
            text-white/60   → 白色文字，透明度 60%（比較淡）
            hover:bg-white/10 hover:text-white → hover 時亮起
        */}
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <span>🌐</span>
          <span>查看前台</span>
        </Link>

        {/* 登出按鈕
            w-full       → 寬度 100%（撐滿側欄寬度）
            hover:bg-red-600/30 → hover 時出現紅色半透明背景（視覺提示這是危險操作）
        */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-white/60 hover:bg-red-600/30 hover:text-white transition-colors"
        >
          <span>🚪</span>
          <span>登出</span>
        </button>
      </div>
    </aside>
  );

  return (
    // min-h-screen → 最小高度為視窗高度（確保背景色撐滿整個頁面）
    // flex         → 水平排列（側欄在左，主內容在右）
    // bg-gray-100  → 淺灰色背景（主內容區的底色）
    <div className="min-h-screen flex bg-gray-100">

      {/* ====== 電腦版側欄 ======
          hidden md:flex md:flex-col → 手機版隱藏，md 以上顯示為垂直 flex
          h-screen   → 高度等於視窗高度
          sticky top-0 → 黏著在視窗頂部，頁面滾動時側欄不跟著滾動
      */}
      <div className="hidden md:flex md:flex-col h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* ====== 手機版側欄覆蓋層（Drawer）======
          只有 sidebarOpen 為 true 時才渲染
          md:hidden → md 以上隱藏（電腦版不需要）
          fixed inset-0 → 固定定位，覆蓋整個視窗（inset-0 = 上下左右都是 0）
          z-50      → 顯示在最上層
          flex      → 水平排列（左側側欄 + 右側半透明遮罩）
      */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* 側欄內容 */}
          <div className="flex flex-col h-full">
            <Sidebar />
          </div>
          {/* 右側半透明黑色遮罩
              flex-1        → 佔用剩餘空間
              bg-black/50   → 黑色背景，透明度 50%（半透明遮罩）
              點擊遮罩關閉側欄
          */}
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* ====== 主要內容區 ======
          flex-1      → 佔用側欄以外的所有剩餘空間
          flex flex-col → 垂直排列（頂部列 + 主內容）
          min-w-0     → 防止 flex 子元素撐破父容器（處理長內容溢出問題）
      */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ====== 頂部列 ======
            bg-white  → 白色背景
            shadow-sm → 輕微陰影，與主內容區區隔
            px-4 py-3 → 內距
            flex items-center gap-3 → 水平排列並垂直置中
            sticky top-0 z-10 → 黏著頂部，z-index:10 讓它在內容上方
        */}
        <header className="bg-white shadow-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          {/* 手機版漢堡按鈕（只在 md 以下顯示）
              md:hidden → md 以上隱藏
              p-1       → 小內距
              text-gray-500 → 灰色圖示
          */}
          <button
            className="md:hidden p-1 text-gray-500"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          {/* 目前頁面名稱：從 menuItems 中找到 active 的項目顯示其 label
              find：陣列方法，找到第一個符合條件的元素
              ?. 可選串聯：若找不到符合項目，避免報錯
              || '後台管理'：找不到時的備用文字
          */}
          <h1 className="font-medium text-gray-700 text-sm">
            {menuItems.find((m) => isActive(m))?.label || '後台管理'}
          </h1>
        </header>

        {/* ====== 頁面主要內容 ======
            flex-1      → 佔用頂部列以下的所有空間
            p-4 md:p-6  → 手機版內距 16px，md 以上 24px
            overflow-auto → 內容溢出時可以滾動（避免影響外層版型）
        */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {/*
            <Outlet />：React Router 的佔位元件
            這裡會渲染目前 URL 對應的子路由頁面
            例如：URL 是 /admin/news → 這裡渲染 <NewsManager />
            URL 是 /admin → 渲染 <Dashboard />
          */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
