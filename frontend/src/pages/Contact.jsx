/**
 * 【頁面說明】Contact.jsx — 聯絡我們頁
 *
 * 展示廟宇的聯絡資訊和交通指引，分左右兩欄：
 *   左欄：基本資訊卡（廟名、地址、電話、Email、開放時間）+ 交通指引卡
 *   右欄：地圖示意區（可替換為 Google Maps iframe）
 *
 * 學習重點：
 *   - useEffect 進頁面時捲到頂端
 *   - useSettings 取得後台設定的聯絡資訊
 *   - .map() 渲染聯絡資訊項目（含 && 過濾空值）
 *   - Tailwind Grid 兩欄排版、space-y-4 縱向間距
 */

// useEffect：用於執行捲到頂端的副作用
import { useEffect } from 'react';
// useSettings：取得廟宇設定值（廟名、地址、電話等）
import { useSettings } from '../context/SettingsContext';
import SEOHead from '../components/SEOHead';

export default function Contact() {
  // useSettings()：從 SettingsContext 讀取全域設定物件
  const settings = useSettings();

  // useEffect：進入頁面時捲到最頂端
  // [] 空陣列 → 只執行一次（元件掛載時）
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    // max-w-4xl：最大寬 56rem；mx-auto px-4 py-12：置中與內距
    <main className="max-w-4xl mx-auto px-4 py-12">
      <SEOHead title="聯絡我們" />

      {/* 頁面標題 */}
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl text-temple-green-dark mb-2">聯絡我們</h1>
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-0.5 bg-temple-gold" />
          <span className="text-temple-gold text-xl">❖</span>
          <div className="w-16 h-0.5 bg-temple-gold" />
        </div>
      </div>

      {/* ── 主要內容區：兩欄 Grid ──────────────────────────────────
          grid md:grid-cols-2：桌面版分成兩欄，手機版單欄
          gap-8：欄間距 2rem
      */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* 左欄：space-y-4 讓兩個卡片之間有間距 */}
        <div className="space-y-4">
          {/* 基本資訊卡片 */}
          <div className="temple-card p-6">
            <h2 className="font-serif text-lg text-temple-green mb-4 border-b border-temple-gold/30 pb-2">
              基本資訊
            </h2>
            {/* space-y-4：清單項目間距 1rem */}
            <ul className="space-y-4">
              {/*
                .map() 渲染聯絡資訊項目：
                  先建立物件陣列，再 .map() 轉成 JSX
                  回呼函式回傳 value && (<li>...)：
                    若 value 為空（null/undefined/''），不顯示該行
                    只有 value 有內容才顯示 → 後台沒填就不出現空行
              */}
              {[
                { icon: '🏛️', label: '廟名', value: settings.site_name },
                { icon: '📍', label: '地址', value: settings.address },
                { icon: '📞', label: '電話', value: settings.phone },
                { icon: '✉️', label: 'Email', value: settings.email },
                { icon: '🕐', label: '開放時間', value: settings.open_hours },
              ].map(({ icon, label, value }) => value && (
                <li key={label} className="flex gap-3">
                  {/* shrink-0 mt-0.5：icon 不縮小，微調垂直對齊 */}
                  <span className="text-lg shrink-0 mt-0.5">{icon}</span>
                  <div>
                    {/* block：讓 label 佔整行（獨立顯示） */}
                    <span className="text-xs text-temple-green-dark font-medium block">{label}</span>
                    <span className="text-sm text-gray-700">{value}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* 交通指引卡片 */}
          <div className="temple-card p-6">
            <h2 className="font-serif text-lg text-temple-green mb-4 border-b border-temple-gold/30 pb-2">
              交通指引
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <p className="font-medium text-temple-dark mb-1">🚌 公車</p>
                <p className="text-gray-600">搭乘往 XX 方向公車，於 XX 站下車步行約 X 分鐘</p>
              </div>
              <div>
                <p className="font-medium text-temple-dark mb-1">🚗 開車</p>
                <p className="text-gray-600">導航至廟宇地址即可，廟旁設有停車場</p>
              </div>
              <div>
                <p className="font-medium text-temple-dark mb-1">🚇 捷運</p>
                <p className="text-gray-600">搭乘至 XX 站後，轉乘公車或計程車前往</p>
              </div>
            </div>
          </div>
        </div>

        {/* 右欄：地圖
            h-full min-h-64：撐滿左欄高度，最小 16rem
        */}
        <div>
          <div className="temple-card overflow-hidden h-full min-h-64">
            {/* 地圖佔位區（實際部署時可替換為 Google Maps <iframe>）
                bg-gray-100 h-64：淡灰背景，高度 16rem
                flex items-center justify-center：內容置中
            */}
            <div className="bg-gray-100 h-64 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="text-sm">Google 地圖</p>
                <p className="text-xs mt-1">{settings.address || '地址待設定'}</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600">
                如需導航，請以「{settings.site_name || '玄天上帝廟'}」搜尋 Google Maps
              </p>
              {/*
                encodeURIComponent()：把地址中的中文、空格等轉成 URL 安全編碼（空格 → %20）
                target="_blank"：在新分頁開啟
                rel="noopener noreferrer"：安全性設定，防止新分頁存取 window.opener
              */}
              <a
                href={`https://maps.google.com/maps?q=${encodeURIComponent(settings.address || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-temple-green hover:underline"
              >
                在 Google Maps 中開啟 ›
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
