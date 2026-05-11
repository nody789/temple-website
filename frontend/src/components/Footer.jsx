/**
 * 【檔案說明】components/Footer.jsx — 頁尾元件
 *
 * 這個元件渲染網站底部的頁尾，包含：
 *   - 廟宇名稱和副標題
 *   - 快速連結（各頁面入口）
 *   - 聯絡資訊（地址、電話、電子信箱、開放時間、Facebook）
 *   - 版權資訊和後台管理入口
 *
 * 所有動態內容（廟名、地址等）都從後台設定（SettingsContext）讀取，
 * 若設定尚未載入，則顯示預設文字。
 *
 * Props：無（資料全部來自 Context）
 */

// Link：react-router-dom 的前端路由連結元件
import { Link } from 'react-router-dom';

// useSettings：從 SettingsContext 取得全站設定（廟名、地址等）
import { useSettings } from '../context/SettingsContext';

/**
 * Footer 元件
 */
export default function Footer() {

  /**
   * useSettings()：取得後台設定物件
   * 包含 site_name、address、phone、email 等欄位
   * 若後台 API 尚未回應，settings 是空物件 {}，各欄位為 undefined
   * 因此下方都用 settings.xxx || '預設值' 提供備用顯示
   */
  const settings = useSettings();

  return (
    // bg-temple-dark → 深色背景（自訂的深褐/深色，定義於 tailwind.config.js）
    // text-white     → 預設文字顏色為白色
    <footer className="bg-temple-dark text-white">

      {/* ====== 頂部金色裝飾分隔線 ======
          h-1                → 高度 4px（細線）
          bg-gradient-to-r   → 背景漸層方向：從左到右
          from-transparent   → 左側起點：透明
          via-temple-gold    → 中間：金色
          to-transparent     → 右側終點：透明
          效果：產生中間金色、兩側淡出的漸層細線裝飾
      */}
      <div className="h-1 bg-gradient-to-r from-transparent via-temple-gold to-transparent" />

      {/* ====== 三欄式內容區 ======
          max-w-6xl mx-auto → 最大寬度限制並水平置中
          px-4              → 左右內距 16px
          py-10             → 上下內距 40px
          grid              → 啟用 CSS Grid 排版
          grid-cols-1       → 預設（手機版）：一欄
          md:grid-cols-3    → md（768px）以上：三欄平均分配
          gap-8             → 欄位之間的間距 32px
      */}
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* ====== 第一欄：廟宇名稱與簡介 ====== */}
        <div>
          {/*
            font-serif     → serif 字體
            text-xl        → 字體大小 1.25rem（20px）
            font-bold      → 粗體
            text-temple-gold → 金色文字（讓標題在深色背景上突出）
            mb-3           → 下方外距 12px（與下方內容的間距）
          */}
          <h3 className="font-serif text-xl font-bold text-temple-gold mb-3">
            {settings.site_name || '南天母中壇元帥道場'}
          </h3>
          {/*
            text-white/60  → 白色文字，透明度 60%（偏灰白，不像主標題那麼搶眼）
            text-sm        → 字體大小 14px
            leading-relaxed → 行高較寬鬆，提高可讀性
          */}
          <p className="text-white/60 text-sm leading-relaxed">
            {settings.site_subtitle || '神恩浩蕩，庇佑四方'}
          </p>
          {/*
            text-white/50 → 白色文字，透明度 50%（更淡，次要資訊）
            text-xs       → 字體大小 0.75rem（12px）
            mt-3          → 上方外距 12px
          */}
          <p className="text-white/50 text-xs mt-3">
            創建於 {settings.founding_year || 'XX年'} · 主祀 {settings.main_deity || '玄天上帝'}
          </p>
        </div>

        {/* ====== 第二欄：快速連結 ====== */}
        <div>
          {/*
            font-medium    → 字重 500
            text-temple-gold → 金色標題
            mb-3           → 下方外距 12px
          */}
          <h4 className="font-medium text-temple-gold mb-3">快速連結</h4>
          {/*
            space-y-1.5    → 子元素之間的垂直間距 6px
                             （等同於幫每個 <li> 加上 margin-top: 6px，第一個除外）
            text-sm        → 字體大小 14px
            text-white/70  → 白色文字，透明度 70%
          */}
          <ul className="space-y-1.5 text-sm text-white/70">
            {/* 使用陣列直接定義連結，map 渲染每個連結項目 */}
            {[
              { to: '/about', label: '本廟簡介' },
              { to: '/environment', label: '環境介紹' },
              { to: '/news', label: '最新消息' },
              { to: '/activities', label: '活動訊息' },
              { to: '/register', label: '線上報名' },
              { to: '/contact', label: '聯絡我們' },
            ].map((link) => (
              <li key={link.to}>
                {/*
                  hover:text-temple-gold → 滑鼠懸停時文字變金色
                  transition-colors      → 顏色變化加動畫
                */}
                <Link to={link.to} className="hover:text-temple-gold transition-colors">
                  › {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ====== 第三欄：聯絡資訊 ====== */}
        <div>
          <h4 className="font-medium text-temple-gold mb-3">聯絡資訊</h4>
          {/*
            space-y-2 → 子元素之間垂直間距 8px
            text-sm   → 字體大小 14px
            text-white/70 → 白色半透明文字
          */}
          <ul className="space-y-2 text-sm text-white/70">
            {/*
              每個聯絡資訊項目用 flex gap-2 排版
              flex     → 水平排列圖示和文字
              gap-2    → 圖示和文字之間間距 8px
              shrink-0 → 防止圖示被壓縮（flex 排版中防止圖示縮小）
            */}
            <li className="flex gap-2">
              <span className="text-temple-gold shrink-0">📍</span>
              <span>{settings.address || '地址待設定'}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-temple-gold shrink-0">📞</span>
              <span>{settings.phone || '電話待設定'}</span>
            </li>
            {/* 電子郵件：只有當後台有設定才顯示（conditions rendering） */}
            {settings.email && (
              <li className="flex gap-2">
                <span className="text-temple-gold shrink-0">✉️</span>
                <span>{settings.email}</span>
              </li>
            )}
            {/* 開放時間：同上，有設定才顯示 */}
            {settings.open_hours && (
              <li className="flex gap-2">
                <span className="text-temple-gold shrink-0">🕐</span>
                <span>{settings.open_hours}</span>
              </li>
            )}
            {/* Facebook 連結：有設定才顯示 */}
            {settings.facebook_url && (
              <li className="flex gap-2 pt-1">
                {/*
                  <a> 而非 <Link>：外部連結要用原生 <a>，Link 只用於站內路由
                  target="_blank"        → 在新分頁開啟
                  rel="noopener noreferrer" → 安全性設定，防止新分頁的頁面存取原始頁面
                  hover:text-[#1877F2]   → hover 時變成 Facebook 品牌藍色（任意顏色值）
                  transition-colors      → 顏色變化加動畫
                  group                  → 標記為 group，讓子元素可用 group-hover: 觸發
                */}
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/70 hover:text-[#1877F2] transition-colors group"
                >
                  {/*
                    w-4 h-4    → SVG 圖示寬高 16px
                    shrink-0   → 防止圖示被壓縮
                    fill-current → SVG 填充顏色使用當前文字顏色（會跟著 hover 變色）
                  */}
                  <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                  </svg>
                  <span className="text-sm">Facebook 粉絲專頁</span>
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* ====== 版權列 ======
          border-t border-white/10 → 頂部邊框線，白色透明度 10%（若隱若現的分隔線）
          py-4                     → 上下內距 16px
          text-center              → 文字置中
          text-xs                  → 字體大小 12px（很小的次要資訊）
          text-white/40            → 白色文字，透明度 40%（很淡）
      */}
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        {/* new Date().getFullYear()：取得目前年份（動態，不需要每年手動更新） */}
        © {new Date().getFullYear()} {settings.site_name || '南天母中壇元帥道場'} 版權所有 ·{' '}
        {/*
          {' '} 是 JSX 中插入空白字元的方式
          直接在 JSX 的文字節點和表達式之間寫空格有時會被忽略，用 {' '} 確保有空格
          hover:text-white/60 → hover 時文字稍微明顯一些
          transition-colors   → 顏色變化加動畫
        */}
        <Link to="/admin/login" className="hover:text-white/60 transition-colors">
          後台管理
        </Link>
      </div>
    </footer>
  );
}
