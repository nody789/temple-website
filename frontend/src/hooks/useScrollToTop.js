/**
 * 【Hook 說明】useScrollToTop.js — 進入頁面時自動捲到最頂端
 *
 * Custom Hook（自訂 Hook）是什麼？
 *   把可重用的邏輯「包裝」成一個函式，讓多個元件共享同一段邏輯，
 *   而不需要複製貼上。這是 React 組織邏輯的推薦方式。
 *
 * 為什麼要抽出來？
 *   7 個頁面都有這段幾乎一模一樣的程式碼：
 *     useEffect(() => { window.scrollTo(0, 0); }, []);
 *   複製貼上有維護問題，改成 Hook 後：
 *     - 每個頁面只需要寫一行：useScrollToTop()
 *     - 日後如果要改行為（例如加上滾動動畫），只改這一個檔案
 *
 * Hook 命名規則（React 的規定）：
 *   Custom Hook「一定要以 use 開頭」（useScrollToTop、useFormState 等）。
 *   這樣 React 才能識別它是 Hook，並確保 Hooks 的使用規則被正確遵守。
 *   - 不符合命名規則的函式，若在裡面使用 useEffect、useState，
 *     React 的 Lint 工具會警告甚至報錯。
 *
 * 使用方式（在任何頁面元件內）：
 *   import useScrollToTop from '../hooks/useScrollToTop';
 *
 *   export default function SomePage() {
 *     useScrollToTop(); // 一行搞定，不再需要寫 useEffect
 *     return <main>...</main>;
 *   }
 */

// 從 React 引入 useEffect Hook
import { useEffect } from 'react';

export default function useScrollToTop() {
  // useEffect：副作用 Hook
  //   第一個參數：要執行的函式（進頁面時捲到頂端）
  //   第二個參數：依賴陣列 []（空陣列 = 只在元件第一次掛載時執行一次）
  useEffect(() => {
    // window.scrollTo(x, y)：
    //   x = 0 → 水平方向不捲動（保持左邊）
    //   y = 0 → 垂直方向捲到最頂端（y=0 是頁面頂部）
    window.scrollTo(0, 0);
  }, []); // [] 空依賴陣列 → 只執行一次（進頁面時）
}
