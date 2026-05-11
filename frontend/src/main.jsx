/**
 * 【檔案說明】main.jsx — React 應用程式的入口點
 *
 * 這是整個前端應用「最先被執行」的檔案。
 * 它負責把 React 應用掛載到 HTML 的 <div id="root"> 元素上，
 * 並且在最外層包上各種「Provider（提供者）」，讓全站元件都能使用共用資料。
 *
 * 概念速記：
 *   Provider = 像一個大水塔，把資料（水）往下層元件供應
 *   越外層的 Provider，越多元件可以取用它的資料
 */

// React 核心套件：所有 React 元件都需要它
import React from 'react';

// ReactDOM：負責把 React 元件「渲染」到真實的 HTML DOM 上
import ReactDOM from 'react-dom/client';

// HelmetProvider：提供 SEO 功能，讓各頁面可以動態設定 <title>、<meta> 等 HTML head 內容
import { HelmetProvider } from 'react-helmet-async';

// App：整個應用的根元件，包含所有頁面路由
import App from './App';

// 全域 CSS 樣式（Tailwind 的 base 樣式也在這裡引入）
import './index.css';

// AuthProvider：提供「登入狀態」給全站使用（誰登入了？token 是什麼？）
import { AuthProvider } from './context/AuthContext';

// SettingsProvider：提供「網站設定」給全站使用（廟名、電話、地址等）
import { SettingsProvider } from './context/SettingsContext';

/**
 * ReactDOM.createRoot：找到 HTML 中的 <div id="root">，建立 React 渲染根節點
 * .render(...)：把 JSX 元件樹渲染進去
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  /**
   * React.StrictMode：開發模式的輔助工具
   * - 不影響正式環境（production build 不會有額外行為）
   * - 在開發時會刻意執行某些副作用兩次，幫助你找出潛在問題
   */
  <React.StrictMode>
    {/*
      HelmetProvider 放最外層，讓任何頁面的 <Helmet> 元件都能生效
      用來管理 HTML <head> 裡的 <title>、<meta> 等 SEO 相關標籤
    */}
    <HelmetProvider>
      {/*
        AuthProvider：把「登入資訊（token、username、login、logout）」
        包進 React Context，子元件只需要 useAuth() 就能取得
        （不需要透過 props 一層層往下傳）
      */}
      <AuthProvider>
        {/*
          SettingsProvider：從後端 API 取得網站設定資料，
          包進 Context 供全站使用
          子元件只需要 useSettings() 就能取得廟名、地址等設定
        */}
        <SettingsProvider>
          {/* App 是根元件，包含所有頁面路由定義 */}
          <App />
        </SettingsProvider>
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);
