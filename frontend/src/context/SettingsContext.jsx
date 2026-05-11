/**
 * 【檔案說明】context/SettingsContext.jsx — 全站網站設定管理
 *
 * 這個 Context 從後端 API 取得網站設定（廟名、電話、地址、SEO 標題等），
 * 並透過 React Context 讓所有元件都能讀取，不需要每個元件各自發 API 請求。
 *
 * 提供的資料（settings 物件）包含後端 /api/settings 回傳的欄位，例如：
 *   - settings.site_name：網站名稱（如「南天母中壇元帥道場」）
 *   - settings.site_subtitle：副標題
 *   - settings.address：地址
 *   - settings.phone：電話
 *   - settings.email：電子郵件
 *   - settings.open_hours：開放時間
 *   - settings.facebook_url：Facebook 連結
 *   - settings.seo_title：SEO 頁面標題
 *   - settings.meta_description：SEO 描述
 *   - settings.meta_keywords：SEO 關鍵字
 *   - settings.founding_year：創建年份
 *   - settings.main_deity：主祀神明
 *
 * 使用方式（在任何子元件內）：
 *   import { useSettings } from '../context/SettingsContext';
 *   const settings = useSettings();
 *   // 然後就能用 settings.site_name 等
 */

// createContext：建立 Context 物件
// useContext：訂閱 Context 的值
// useState：管理元件內部的可變狀態
// useEffect：元件掛載後執行副作用（這裡用來發 API 請求）
import { createContext, useContext, useState, useEffect } from 'react';

// 引入共用的 API 工具（已設定好 baseURL 和 token 攔截器）
import api from '../api';

/**
 * 建立 SettingsContext
 * 預設值是空物件 {}，表示設定資料還沒載入時，所有屬性都是 undefined
 * 元件通常用「|| '預設文字'」來處理這種情況，例如：
 *   settings.site_name || '南天母中壇元帥道場'
 */
const SettingsContext = createContext({});

/**
 * SettingsProvider — 設定資料的提供者元件
 *
 * 放在 main.jsx 的外層，讓全站都能取用網站設定。
 * 只會發一次 API 請求（元件掛載時），結果共享給所有子元件。
 *
 * @param {ReactNode} children - 被包住的所有子元件
 */
export function SettingsProvider({ children }) {

  /**
   * useState Hook — 管理設定資料的狀態
   *
   * 初始值是空物件 {}
   * 等 API 回傳資料後，呼叫 setSettings 更新為真實設定
   *
   * 狀態更新 → React 重新渲染元件 → 子元件取到最新的 settings
   */
  const [settings, setSettings] = useState({});

  /**
   * useEffect Hook — 元件掛載後向後端取得網站設定
   *
   * 依賴陣列為 []（空陣列）→ 只在元件「第一次」掛載時執行一次
   * 這樣不會在每次重新渲染時都重複發 API 請求
   *
   * api.get('/settings')：向 /api/settings 發送 GET 請求
   * .then((res) => setSettings(res.data))：成功時把回傳的設定資料存入 state
   * .catch(() => {})：失敗時靜默忽略（頁面仍能顯示，只是用 || 後的預設值）
   */
  useEffect(() => {
    api.get('/settings').then((res) => setSettings(res.data)).catch(() => {});
  }, []); // 空依賴陣列：只執行一次

  /**
   * SettingsContext.Provider：把 settings 物件提供給所有子元件
   *
   * value 直接是 settings 物件（不是包一層，這樣取用更方便）
   * 子元件呼叫 useSettings() 會直接拿到這個 settings 物件
   */
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * useSettings — 自訂 Hook
 *
 * 封裝 useContext(SettingsContext)，讓子元件更方便取用設定資料
 *
 * 使用範例：
 *   const settings = useSettings();
 *   console.log(settings.site_name); // 'XXX道場'（或 undefined 若尚未載入）
 *
 * @returns {object} 網站設定物件
 */
export function useSettings() {
  return useContext(SettingsContext);
}
