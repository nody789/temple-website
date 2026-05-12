/**
 * 【檔案說明】App.jsx — 整個應用的路由總表
 *
 * 這個元件定義了「網址 URL 對應哪個頁面元件」的規則。
 * 使用 react-router-dom 套件來管理前端路由（Single Page Application 的換頁機制）。
 *
 * 前端路由概念：
 *   傳統網站換頁 → 瀏覽器向伺服器請求新的 HTML 頁面
 *   SPA 前端路由 → 頁面不真正重新載入，React 根據 URL 切換要顯示的元件
 *
 * 結構分為兩大區塊：
 *   1. 前台頁面（有 Navbar 導覽列 + Footer 頁尾）
 *   2. 後台頁面（管理員介面，需要登入）
 */

// BrowserRouter：提供瀏覽器的 URL 歷史紀錄功能（HTML5 History API）
// Routes：包住所有 <Route>，負責比對目前 URL 決定顯示哪個頁面
// Route：定義一條路由規則，path 是網址，element 是對應的元件
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 共用的導覽列（頂部選單）和頁尾元件
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// ===== 前台頁面元件 =====
import Home from './pages/Home';             // 首頁
import About from './pages/About';           // 本廟簡介
import News from './pages/News';             // 最新消息列表
import NewsDetail from './pages/NewsDetail'; // 單篇消息內容（動態路由 :id）
import Activities from './pages/Activities'; // 活動訊息
import Register from './pages/Register';     // 線上報名
import Contact from './pages/Contact';       // 聯絡我們
import Environment from './pages/Environment'; // 環境介紹

// ===== 後台頁面元件 =====
import AdminLogin from './pages/admin/Login';           // 後台登入頁
import AdminLayout from './components/admin/AdminLayout'; // 後台整體版型（側欄 + 內容區）
import Dashboard from './pages/admin/Dashboard';         // 後台首頁
import CarouselManager from './pages/admin/CarouselManager';   // 輪播圖管理
import NewsManager from './pages/admin/NewsManager';           // 消息管理
import ActivitiesManager from './pages/admin/ActivitiesManager'; // 活動管理
import RegistrationList from './pages/admin/RegistrationList';   // 報名記錄
import SiteSettings from './pages/admin/SiteSettings';          // 網站設定

// ProtectedRoute：路由守衛元件，未登入時自動跳轉到登入頁
import ProtectedRoute from './components/admin/ProtectedRoute';

// ErrorBoundary：全域錯誤邊界，捕捉子元件樹的未處理錯誤，防止白畫面
import ErrorBoundary from './components/ErrorBoundary';

/**
 * App 元件：定義全站路由規則
 *
 * React 元件命名規則：
 *   - 必須大寫開頭（App、Home、Navbar）→ 才會被 React 當作元件處理
 *   - 小寫開頭（div、span、button）→ 被視為原生 HTML 標籤
 */
function App() {
  // ErrorBoundary 包住整個路由系統：
  // 任何頁面元件在渲染中拋出未捕捉的錯誤，
  // 都會被 ErrorBoundary 接住，顯示友善的錯誤畫面而非白畫面。
  // BrowserRouter：整個應用只需要一個，放在最外層，讓 React 偵測 URL 變化。
  return (
    <ErrorBoundary>
      <BrowserRouter>
      {/*
        Routes：像一個「路由比對容器」
        React Router 會從上到下比對 URL，找到符合的 Route 就渲染對應的 element
      */}
      <Routes>

        {/* ==============================
            前台頁面區域
            每個頁面都包含 Navbar（上方導覽）和 Footer（下方頁尾）
            <> ... </> 是 React Fragment，可以包住多個元件而不產生多餘的 DOM 節點
        ============================== */}

        {/* 首頁：網址為 / */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          }
        />

        {/* 本廟簡介：網址為 /about */}
        <Route path="/about" element={<><Navbar /><About /><Footer /></>} />

        {/* 最新消息列表：網址為 /news */}
        <Route path="/news" element={<><Navbar /><News /><Footer /></>} />

        {/*
          消息詳細頁面：網址為 /news/123（動態路由）
          :id 是動態參數，實際值可在 NewsDetail 元件內用 useParams() 取得
        */}
        <Route path="/news/:id" element={<><Navbar /><NewsDetail /><Footer /></>} />

        {/* 活動訊息：網址為 /activities */}
        <Route path="/activities" element={<><Navbar /><Activities /><Footer /></>} />

        {/* 環境介紹：網址為 /environment */}
        <Route path="/environment" element={<><Navbar /><Environment /><Footer /></>} />

        {/* 線上報名：網址為 /register */}
        <Route path="/register" element={<><Navbar /><Register /><Footer /></>} />

        {/* 聯絡我們：網址為 /contact */}
        <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />

        {/* ==============================
            後台頁面區域
            後台不需要前台的 Navbar 和 Footer
        ============================== */}

        {/* 後台登入頁：網址為 /admin/login，不需要登入就能進入 */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/*
          後台主要區域：網址為 /admin 及其子路由
          用 ProtectedRoute 包住 → 未登入時會自動跳轉到 /admin/login
          AdminLayout 提供側欄選單 + 頂部列的版型框架
        */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/*
            子路由（Nested Routes）：
            這些路由的內容會渲染在 AdminLayout 裡的 <Outlet /> 位置
            index 表示當 URL 剛好是 /admin 時顯示的預設頁面
          */}
          <Route index element={<Dashboard />} />                              {/* /admin */}
          <Route path="carousel" element={<CarouselManager />} />              {/* /admin/carousel */}
          <Route path="news" element={<NewsManager />} />                      {/* /admin/news */}
          <Route path="activities" element={<ActivitiesManager />} />          {/* /admin/activities */}
          <Route path="registrations" element={<RegistrationList />} />        {/* /admin/registrations */}
          <Route path="settings" element={<SiteSettings />} />                 {/* /admin/settings */}
        </Route>

        {/*
          404 萬用路由（catch-all）：
          當使用者輸入不存在的路徑時（例如 /xyz），
          * 會匹配所有未被上面 Route 處理的路徑，顯示 404 頁面。
          必須放在所有 Route 的最後面（React Router 由上往下匹配，先到先得）。
        */}
        <Route
          path="*"
          element={
            <>
              <Navbar />
              {/* 404 頁面：直接用 JSX 寫，不需要獨立元件 */}
              <main className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="text-center">
                  <div className="text-6xl mb-4">🙏</div>
                  <h1 className="font-serif text-3xl text-temple-green-dark mb-2">找不到頁面</h1>
                  <p className="text-gray-500 mb-6">您所尋找的頁面不存在，請確認網址是否正確。</p>
                  <a href="/" className="btn-primary inline-block">回到首頁</a>
                </div>
              </main>
              <Footer />
            </>
          }
        />

      </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

// export default：讓其他檔案可以 import App from './App' 取用這個元件
export default App;
