/**
 * 【檔案說明】api/index.js — 全站共用的 HTTP 請求工具
 *
 * 這個檔案建立了一個「設定好的 axios 實例」，
 * 讓整個應用發送 API 請求時不需要每次都重複設定 baseURL、token 等。
 *
 * axios 是一個流行的 HTTP 請求套件，比原生 fetch 更方便：
 *   - 自動把回應 JSON 解析
 *   - 支援攔截器（interceptor）統一處理請求/回應
 *   - 更好的錯誤處理
 *
 * 攔截器（Interceptor）概念：
 *   就像一個「中間人」，在請求送出前 / 回應收到後，自動加工處理
 *   例如：每次請求前自動加上登入 token，不用每個地方手動帶
 */

import axios from 'axios';

/**
 * 建立一個客製化的 axios 實例（instance）
 *
 * 為什麼不直接用 axios.get(...)？
 *   因為 axios.create() 可以預設好 baseURL 和 timeout，
 *   之後只需要寫 api.get('/carousel') 而不是每次都寫完整網址
 */
const api = axios.create({
  /**
   * baseURL：所有請求的網址前綴
   * 設為 '/api' 表示：api.get('/carousel') 實際會請求 /api/carousel
   *
   * 為什麼用 /api 而不是完整的 http://localhost:3001？
   *   因為 vite.config.js 設定了 proxy，
   *   開發環境中 /api/* 請求會自動轉發到後端 Express 伺服器
   *   這樣前端就不會遇到跨域（CORS）問題
   */
  baseURL: '/api',
  /**
   * timeout：請求超過 10000 毫秒（10 秒）沒有回應就自動取消
   * 避免網路不好時讓使用者一直等待
   */
  timeout: 10000,
});

/**
 * 【請求攔截器】interceptors.request.use(...)
 *
 * 每一次呼叫 api.get() / api.post() 等，
 * 在請求真正送出去「之前」，會先經過這個函式處理。
 *
 * 這裡的用途：自動在請求的 Header 加上 JWT 登入 Token
 *
 * 什麼是 JWT Token？
 *   登入成功後，後端會回傳一組加密字串（token），
 *   之後每次 API 請求都要帶上它，讓後端知道「是誰在發請求」
 *
 * localStorage 是瀏覽器提供的本地儲存空間，
 * 關閉頁面後資料仍然存在（除非手動清除）
 */
api.interceptors.request.use((config) => {
  // 從瀏覽器本地儲存取得 token
  const token = localStorage.getItem('token');

  if (token) {
    /**
     * Bearer Token 是 HTTP Authorization 標頭的標準格式
     * 格式：Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
     * 後端收到請求後會驗證這個 token 是否有效
     */
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 一定要 return config，否則請求不會送出
  return config;
});

/**
 * 【回應攔截器】interceptors.response.use(成功處理, 失敗處理)
 *
 * 每次 API 回應收到後，會先經過這裡處理，再傳給呼叫端。
 *
 * 第一個參數（成功）：直接回傳 res，不做任何改動
 * 第二個參數（失敗）：根據錯誤狀態碼決定如何處理
 */
api.interceptors.response.use(
  // 成功時：直接回傳原始回應（res 是 axios 的 response 物件）
  (res) => res,

  // 失敗時：err 是錯誤物件，包含 err.response.status 等資訊
  (err) => {
    /**
     * HTTP 401 Unauthorized：token 無效或已過期
     *
     * err.response?.status 使用了「可選串聯」（Optional Chaining）語法
     * 等同於：err.response && err.response.status === 401
     * 目的是避免 err.response 不存在時（例如網路斷線）直接報錯
     *
     * 解決方式：發送一個自訂事件 'auth:logout'
     * AuthContext 監聽這個事件後會自動執行登出動作
     * 這樣 api/index.js 就不需要直接引用 AuthContext，保持低耦合
     */
    if (err.response?.status === 401) {
      // window.dispatchEvent：向瀏覽器發送自訂事件
      // 任何監聽 'auth:logout' 的地方都會收到通知
      window.dispatchEvent(new Event('auth:logout'));
    }

    /**
     * Promise.reject(err)：把錯誤繼續往外拋出
     * 讓呼叫 api.get(...).catch(...) 的地方能夠捕捉到這個錯誤
     */
    return Promise.reject(err);
  }
);

// 匯出這個設定好的 axios 實例，讓其他檔案可以 import api from '../api' 使用
export default api;
