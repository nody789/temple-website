/**
 * 【檔案說明】context/AuthContext.jsx — 全站登入狀態管理
 *
 * 這個檔案使用 React Context 來管理「登入/登出」的共用狀態。
 *
 * 為什麼需要 Context？
 *   如果沒有 Context，要把登入資訊傳給很深層的子元件，
 *   就必須透過 props 一層一層往下傳（稱為「props drilling」，很麻煩）。
 *   Context 讓任何元件都可以直接取用，不管它在元件樹的哪一層。
 *
 * 這個 Context 提供的資料：
 *   - token：JWT 登入憑證字串
 *   - username：目前登入的管理員名稱
 *   - login(token, username)：執行登入，儲存 token
 *   - logout()：執行登出，清除 token
 *   - isLoggedIn：布林值，true 表示目前已登入
 *
 * 使用方式（在任何子元件內）：
 *   import { useAuth } from '../context/AuthContext';
 *   const { isLoggedIn, login, logout } = useAuth();
 */

// createContext：建立一個 Context 物件
// useContext：在元件內「訂閱」某個 Context 的值
// useState：管理元件內部的狀態（會觸發重新渲染）
// useEffect：在特定時機執行副作用（例如：掛載時監聽事件）
import { createContext, useContext, useState, useEffect } from 'react';

/**
 * 建立 AuthContext
 * createContext(null) 的參數是「預設值」，
 * 當元件沒有被對應的 Provider 包住時才會用到
 * 正常情況下 Provider 會提供實際的值
 */
const AuthContext = createContext(null);

/**
 * 【工具函式】檢查 JWT Token 是否還有效（未過期）
 *
 * JWT（JSON Web Token）結構：三段以 . 分隔的字串
 *   header.payload.signature
 *   例如：eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2OTg3...eyJz...
 *
 * payload 是 Base64 編碼，解碼後是 JSON 物件，包含 exp（過期時間戳）
 *
 * @param {string} token - JWT 字串
 * @returns {boolean} - true 表示 token 有效，false 表示無效或已過期
 */
function isTokenValid(token) {
  // 沒有 token 直接回傳 false
  if (!token) return false;

  try {
    /**
     * token.split('.')[1]：取出 JWT 的第二段（payload）
     * atob(...)：將 Base64 字串解碼為普通字串
     * JSON.parse(...)：將 JSON 字串轉為 JavaScript 物件
     */
    const payload = JSON.parse(atob(token.split('.')[1]));

    /**
     * payload.exp 是過期時間，單位是「秒」（Unix timestamp）
     * Date.now() 是現在時間，單位是「毫秒」
     * 所以要把 exp 乘以 1000 換算成毫秒後比較
     *
     * 若現在時間 < 過期時間 → token 還有效 → 回傳 true
     */
    return payload.exp * 1000 > Date.now();
  } catch {
    // 任何解析錯誤（格式錯誤、不是合法 JWT 等）→ 視為無效
    return false;
  }
}

/**
 * AuthProvider — Context 的資料提供者元件
 *
 * 使用方式：把它包在應用的外層（已在 main.jsx 完成）
 * 被它包住的所有子元件都可以呼叫 useAuth() 取得登入資訊
 *
 * props.children 是 React 的特殊 prop，
 * 代表放在 <AuthProvider>...</AuthProvider> 標籤之間的所有子元件
 */
export function AuthProvider({ children }) {

  /**
   * useState Hook — 管理 token 狀態
   *
   * useState 的參數可以是一個「初始化函式」（lazy initializer）
   * 這樣只有第一次渲染時才執行，避免每次重新渲染都讀取 localStorage
   *
   * 初始化邏輯：
   *   1. 讀取 localStorage 中存的 token
   *   2. 如果 token 無效或已過期 → 清除儲存並回傳 null
   *   3. 如果 token 有效 → 直接用它初始化狀態（不需重新登入）
   *
   * useState 回傳一個陣列：
   *   [目前的值, 更新狀態的函式]
   */
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('token');
    if (!isTokenValid(stored)) {
      // token 無效：清除 localStorage 避免留下髒資料
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      return null; // 初始 token 狀態為 null（未登入）
    }
    return stored; // token 有效，直接使用
  });

  /**
   * 管理 username 狀態
   * 同樣使用 lazy initializer，從 localStorage 取得上次登入的使用者名稱
   */
  const [username, setUsername] = useState(() => localStorage.getItem('username'));

  /**
   * useEffect Hook — 監聽「強制登出」事件
   *
   * useEffect 的作用：
   *   在元件「掛載到畫面上之後」執行副作用（side effects）
   *   副作用包括：API 請求、事件監聽、操作 DOM、設定計時器等
   *
   * 語法：useEffect(執行函式, 依賴陣列)
   *   - 依賴陣列 []（空陣列）→ 只在元件「第一次」掛載時執行一次
   *
   * 這裡的目的：
   *   監聽 api/index.js 在 401 錯誤時觸發的 'auth:logout' 自訂事件
   *   當收到這個事件時，自動執行登出
   */
  useEffect(() => {
    // 定義事件處理函式
    const handleForceLogout = () => {
      logout();
    };

    // 在 window 上監聽自訂事件 'auth:logout'
    window.addEventListener('auth:logout', handleForceLogout);

    /**
     * 回傳的「清理函式」（cleanup function）
     * 當元件「卸載」時（從畫面移除）會自動執行
     * 目的：移除事件監聽，避免記憶體洩漏（memory leak）
     */
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依賴陣列：只在掛載時執行一次

  /**
   * login 函式 — 執行登入
   *
   * 做兩件事：
   *   1. 把 token 和 username 存進 localStorage（持久化，重開頁面仍有效）
   *   2. 更新 React 狀態（觸發重新渲染，UI 即時反映登入狀態）
   *
   * @param {string} newToken - 後端回傳的 JWT token
   * @param {string} newUsername - 登入的管理員名稱
   */
  const login = (newToken, newUsername) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', newUsername);
    setToken(newToken);       // 更新 token 狀態
    setUsername(newUsername); // 更新 username 狀態
  };

  /**
   * logout 函式 — 執行登出
   *
   * 做兩件事：
   *   1. 清除 localStorage 中的登入資料
   *   2. 把 React 狀態設為 null（觸發重新渲染，UI 反映未登入狀態）
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);    // 清除 token 狀態
    setUsername(null); // 清除 username 狀態
  };

  /**
   * Context.Provider：把資料「提供」給所有子元件
   *
   * value prop 是要共享的資料物件，所有 useAuth() 的呼叫者都能取到這些值：
   *   - token：JWT 字串（或 null）
   *   - username：管理員名稱（或 null）
   *   - login：登入函式
   *   - logout：登出函式
   *   - isLoggedIn：!!token 把 token 轉換成布林值
   *                 null → false（未登入）
   *                 "eyJ..." → true（已登入）
   */
  return (
    <AuthContext.Provider value={{ token, username, login, logout, isLoggedIn: !!token }}>
      {/* children 就是被 <AuthProvider> 包住的所有子元件 */}
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — 自訂 Hook（Custom Hook）
 *
 * 什麼是自訂 Hook？
 *   以 use 開頭的函式，內部使用了 React 內建的 hook（這裡是 useContext）
 *   目的是封裝常用邏輯，讓呼叫方更簡潔
 *
 * 為什麼要包裝 useContext？
 *   沒有這個 hook，每個要用 Auth 資料的元件都要寫：
 *     import { useContext } from 'react';
 *     import { AuthContext } from '../context/AuthContext';
 *     const auth = useContext(AuthContext);
 *
 *   有了 useAuth()，只需要：
 *     import { useAuth } from '../context/AuthContext';
 *     const { isLoggedIn } = useAuth();
 *
 * @returns {object} AuthContext 的 value（token、username、login、logout、isLoggedIn）
 */
export function useAuth() {
  return useContext(AuthContext);
}
