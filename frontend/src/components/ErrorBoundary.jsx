/**
 * 【元件說明】ErrorBoundary.jsx — 全域錯誤邊界
 *
 * 什麼是 Error Boundary（錯誤邊界）？
 *   當「子元件樹」在渲染過程中發生未捕捉的 JavaScript 錯誤時，
 *   Error Boundary 會攔截這個錯誤，顯示一個友善的備用畫面，
 *   而不是讓整個網站變成白畫面（空白頁面，使用者不知道發生什麼事）。
 *
 * 為什麼要用 Class Component？
 *   Error Boundary 的核心是兩個特殊生命週期方法：
 *     - getDerivedStateFromError()
 *     - componentDidCatch()
 *   這兩個方法目前只能在 Class Component 中使用（React 的規定）。
 *   一般頁面用函式元件（function component）就好，
 *   但這個特殊元件是目前 React 唯一必須用 Class Component 的情況。
 *
 * Class Component vs Function Component 差異：
 *   Class Component：
 *     - 用 class 語法，繼承 React.Component
 *     - 狀態用 this.state，不用 useState
 *     - 生命週期用方法（componentDidMount 等），不用 useEffect
 *   Function Component：
 *     - 用 function 或箭頭函式
 *     - 狀態用 useState
 *     - 副作用用 useEffect
 */

// React 是 Class Component 的必要依賴（需要繼承 React.Component）
import React from 'react';

export default class ErrorBoundary extends React.Component {
  // constructor：Class Component 的初始化函式
  //   super(props)：呼叫父類別（React.Component）的 constructor，是必要步驟
  //   this.state：Class Component 的狀態物件（等同函式元件的 useState）
  constructor(props) {
    super(props);
    this.state = {
      hasError: false, // 是否發生過錯誤，初始值 false（正常狀態）
    };
  }

  // static getDerivedStateFromError(error)
  //   這是 React 的「靜態生命週期方法」。
  //   當任何子元件在渲染中拋出錯誤時，React 自動呼叫這個方法。
  //
  //   static：靜態方法，屬於類別本身，不是實例（不能用 this）
  //   回傳值：一個物件，會和現有的 this.state 合併 → 觸發重新渲染
  //
  //   這裡的作用：把 hasError 設為 true，讓 render() 改成顯示錯誤畫面
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  // componentDidCatch(error, info)
  //   錯誤被捕捉「之後」執行，適合用來記錄錯誤到外部監控服務。
  //   error：JavaScript 的 Error 物件（有 message、stack 等屬性）
  //   info.componentStack：出錯的 React 元件堆疊（方便除錯）
  //
  //   正式環境可在這裡把錯誤送到 Sentry、LogRocket 等監控服務
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] 捕捉到未處理的錯誤：', error, info.componentStack);
  }

  // render()：Class Component 的渲染函式，等同函式元件的 return
  //   this.state：讀取 Class Component 的狀態
  //   this.props：讀取傳入的 props
  render() {
    if (this.state.hasError) {
      // 有錯誤 → 顯示友善的錯誤備用畫面
      return (
        // min-h-screen：最小高度填滿整個視窗
        // flex items-center justify-center：讓內容在視窗正中央
        <div className="min-h-screen flex items-center justify-center bg-temple-cream px-4">
          <div className="text-center">
            {/* 觀音菩薩手勢 emoji 作為視覺提示 */}
            <div className="text-6xl mb-4">🙏</div>
            <h1 className="font-serif text-2xl text-temple-green-dark mb-2">頁面發生錯誤</h1>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              抱歉，系統發生了一些問題。請重新整理頁面，或聯絡網站管理員。
            </p>
            {/*
              onClick：點擊後執行 window.location.reload()
              reload() 會重新載入整個頁面，清除目前的 React 錯誤狀態
            */}
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              重新整理頁面
            </button>
          </div>
        </div>
      );
    }

    // 沒有錯誤 → 正常渲染子元件
    // this.props.children：包在 <ErrorBoundary> 裡面的所有子元件
    // 等同於函式元件的 { children } prop
    return this.props.children;
  }
}
