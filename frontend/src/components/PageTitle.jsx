/**
 * 【元件說明】PageTitle.jsx — 頁面標題元件（可重用）
 *
 * 封裝各頁面共用的「大標題 + 金色裝飾分隔線」樣式。
 *
 * 為什麼要抽成獨立元件？
 *   這個標題區塊在 About、News、Activities、Contact、Environment 等
 *   7 個頁面裡重複出現，每次複製貼上有以下問題：
 *     1. 如果要修改樣式（例如換字體或改顏色），要改 7 個地方
 *     2. 容易不小心改到一個忘了改另一個，造成視覺不一致
 *   抽成元件後，只要改這一個檔案，所有頁面同步更新。
 *
 * Props（元件的輸入參數，類似函式的參數）：
 *   title    (string，必填) — 顯示在頁面上方的大標題
 *   sub      (string，選填) — 標題下方的說明文字（如「歡迎參觀...」）
 *   className (string，選填) — 外層 div 的額外 CSS 類別，預設 "mb-10"
 *                             用來讓各頁面自訂底部間距（mb-10 或 mb-12）
 *
 * 使用範例：
 *   <PageTitle title="最新消息" />
 *   <PageTitle title="環境介紹" sub="歡迎參觀本廟各項設施" className="mb-12" />
 */

// 接收 title、sub、className 三個 props
// className = 'mb-10'：JS 預設參數值，若父元件沒有傳 className 就用 "mb-10"
export default function PageTitle({ title, sub, className = 'mb-10' }) {
  return (
    // 外層 div 使用 text-center 讓內容置中
    // className 由父元件決定底部間距（mb-10 or mb-12）
    <div className={`text-center ${className}`}>

      {/* 大標題
          font-serif：襯線字體（更有廟宇古典感）
          text-3xl：字體大小 1.875rem（約 30px）
          text-temple-green-dark：深金色（tailwind.config.js 自訂色）
          mb-2：底部間距 0.5rem
      */}
      <h1 className="font-serif text-3xl text-temple-green-dark mb-2">{title}</h1>

      {/* 金色裝飾分隔線
          flex items-center justify-center：三個元素（線、菱形、線）並排且垂直置中
          gap-3：元素間距 0.75rem
      */}
      <div className="flex items-center justify-center gap-3">
        {/* w-16 h-0.5：寬 4rem、高 2px 的水平線 */}
        <div className="w-16 h-0.5 bg-temple-gold" />
        {/* ❖ 菱形裝飾符號 */}
        <span className="text-temple-gold text-xl">❖</span>
        <div className="w-16 h-0.5 bg-temple-gold" />
      </div>

      {/*
        選填說明文字：
        sub && <p>...</p>：只有 sub 有值時才渲染（&&短路條件渲染）
        sub 為 undefined 或 '' 時，整個 <p> 不會出現
      */}
      {sub && (
        <p className="text-sm text-gray-500 mt-4">{sub}</p>
      )}
    </div>
  );
}
