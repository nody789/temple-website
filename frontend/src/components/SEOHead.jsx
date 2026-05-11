/**
 * 【檔案說明】components/SEOHead.jsx — 頁面 SEO 標頭元件
 *
 * 這個元件負責動態設定每個頁面的 HTML <head> 內容，
 * 包含頁面標題（<title>）和各種 <meta> 標籤，以利搜尋引擎優化（SEO）。
 *
 * 使用 react-helmet-async 套件：
 *   它讓 React 元件能夠「寫入」HTML <head> 的內容，
 *   就像正常的 JSX 元件一樣，只是渲染的位置是 <head> 而不是 <body>。
 *
 * 使用方式（在任何頁面元件內）：
 *   <SEOHead title="最新消息" description="查看最新公告與消息" />
 *
 * Props 說明：
 *   @param {string} title - 頁面特定標題（選填，不填則只顯示網站名稱）
 *   @param {string} description - 頁面描述（選填，不填則使用後台設定的預設描述）
 *
 * og: 開頭的 meta 是 Open Graph 標籤，
 * 控制在 Facebook、LINE 等社群媒體分享時顯示的預覽內容
 */

// Helmet：react-helmet-async 的核心元件，內部放的 JSX 會被渲染到 <head>
import { Helmet } from 'react-helmet-async';

// useSettings：取得後台設定的自訂 Hook（廟名、SEO 描述等）
import { useSettings } from '../context/SettingsContext';

/**
 * SEOHead 元件
 *
 * 元件接收 props 的語法：function SEOHead({ title, description })
 * 這是「解構賦值」寫法，等同於：
 *   function SEOHead(props) {
 *     const title = props.title;
 *     const description = props.description;
 *   }
 *
 * @param {string} title - 頁面標題（可選）
 * @param {string} description - 頁面描述（可選）
 */
export default function SEOHead({ title, description }) {

  /**
   * useSettings()：從 SettingsContext 取得全站設定物件
   * 這裡不需要傳任何 props，直接呼叫 hook 就能取得資料
   * 這正是 Context 的優點：跨元件共享資料，不需 props 傳遞
   */
  const settings = useSettings();

  /**
   * 計算網站名稱：優先使用 SEO 標題，其次用一般網站名稱，最後用預設值
   * || 是「短路運算子」：左側為 falsy（空字串、null、undefined）才取右側的值
   */
  const siteName = settings.seo_title || settings.site_name || '南天母中壇元帥道場';

  /**
   * 組合頁面完整標題
   * 有頁面標題：「最新消息 | 南天母中壇元帥道場」
   * 沒有頁面標題：「南天母中壇元帥道場」（只顯示網站名稱）
   *
   * 三元運算子：條件 ? 為真時的值 : 為假時的值
   */
  const pageTitle = title ? `${title} | ${siteName}` : siteName;

  /**
   * 頁面描述：優先使用傳入的 description prop，其次用後台設定的預設描述
   */
  const pageDesc = description || settings.meta_description || '';

  /**
   * SEO 關鍵字：直接從後台設定取得（全站共用）
   */
  const keywords = settings.meta_keywords || '';

  return (
    /**
     * <Helmet>：react-helmet-async 元件
     * 內部的 JSX 標籤會被「注入」到 HTML 的 <head> 區塊
     * 頁面切換時，Helmet 會自動更新 <head> 的內容
     */
    <Helmet>
      {/* 設定瀏覽器頁籤和搜尋結果顯示的標題 */}
      <title>{pageTitle}</title>

      {/*
        && 短路運算子：左側為 true 才渲染右側的 JSX
        等同於：if (pageDesc) { 渲染 <meta> }
        這樣可以避免渲染沒有內容的 meta 標籤
      */}
      {pageDesc && <meta name="description" content={pageDesc} />}
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph 標籤：控制社群媒體分享時的預覽內容 */}
      <meta property="og:title" content={pageTitle} />
      {pageDesc && <meta property="og:description" content={pageDesc} />}
      <meta property="og:type" content="website" />
      {settings.site_name && <meta property="og:site_name" content={settings.site_name} />}
    </Helmet>
  );
}
