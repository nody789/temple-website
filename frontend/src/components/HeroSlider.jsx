/**
 * 【檔案說明】components/HeroSlider.jsx — 首頁輪播圖元件
 *
 * 這個元件實作了首頁頂部的圖片輪播（Carousel/Slider）功能：
 *   - 從後端 API 取得輪播圖片列表
 *   - 每 5 秒自動切換到下一張
 *   - 提供左右箭頭按鈕手動切換
 *   - 底部顯示圓點指示目前是第幾張
 *
 * 使用的 React Hooks：
 *   - useState：記錄目前顯示第幾張（current）和圖片列表（slides）
 *   - useEffect：掛載後發 API 請求、設定自動換頁計時器
 *   - useCallback：快取 next 函式的參考，避免 useEffect 無限重觸
 */

// useState：管理元件內的可變狀態
// useEffect：在特定時機執行副作用（API 請求、計時器）
// useCallback：快取函式，讓 useEffect 的依賴比較正確
import { useState, useEffect, useCallback } from 'react';

// 共用的 API 工具（帶有 baseURL 和 token 攔截器）
import api from '../api';

/**
 * HeroSlider 元件
 * 不接收任何 props，所有資料都從 API 自行取得
 */
export default function HeroSlider() {

  /**
   * slides 狀態：存放從 API 取得的輪播圖片陣列
   * 每個 slide 物件包含 { id, image_url, title, description }
   * 初始值為空陣列 []（資料還沒載入）
   */
  const [slides, setSlides] = useState([]);

  /**
   * current 狀態：目前顯示的圖片索引（從 0 開始）
   * 例如：current = 0 表示顯示第一張圖
   */
  const [current, setCurrent] = useState(0);

  /**
   * useEffect：元件掛載後，向後端請求輪播圖片資料
   *
   * api.get('/carousel')：發送 GET /api/carousel 請求
   * .then((res) => setSlides(res.data))：成功時把圖片陣列存入 slides 狀態
   * .catch(() => {})：失敗時靜默忽略
   *
   * 依賴陣列 []：只在掛載時執行一次
   */
  useEffect(() => {
    api.get('/carousel').then((res) => setSlides(res.data)).catch(() => {});
  }, []);

  /**
   * useCallback Hook — 快取「切換到下一張」的函式
   *
   * 為什麼要用 useCallback？
   *   每次元件重新渲染，函式都會被重新建立（是全新的函式參考）。
   *   若把 next 放在 useEffect 的依賴陣列，每次渲染都會觸發 useEffect，
   *   導致計時器無限重設。
   *
   *   useCallback(fn, [deps])：只有當 deps 改變時，才重新建立函式。
   *   這樣 next 的函式參考就是穩定的，useEffect 才能正常運作。
   *
   * 邏輯：
   *   setCurrent 接收一個 updater function，prev 是目前最新的 current 值
   *   (prev + 1) % slides.length：下一張索引，到最後一張後循環回第一張
   *   例如：slides.length = 3，current = 2 → (2+1) % 3 = 0（回到第一張）
   *
   * 依賴陣列 [slides.length]：當圖片數量改變時，重新建立 next 函式
   */
  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  /**
   * useEffect：設定自動換頁計時器
   *
   * 依賴陣列 [next, slides.length]：
   *   當 next 函式或圖片數量改變時，重新設定計時器
   *
   * setInterval(next, 5000)：每 5000 毫秒（5 秒）呼叫一次 next
   * return () => clearInterval(timer)：
   *   這是「清理函式」（cleanup function），在元件卸載或依賴改變時執行，
   *   清除計時器，避免元件消失後仍繼續執行（記憶體洩漏）
   */
  useEffect(() => {
    // 只有一張圖（或沒圖）時不需要輪播
    if (slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer); // 元件卸載時清除計時器
  }, [next, slides.length]);

  /**
   * 載入中狀態：slides 還是空陣列時，顯示佔位區塊
   *
   * 條件渲染（Conditional Rendering）：
   *   元件可以根據狀態決定渲染什麼，甚至提早 return 不同的 JSX
   *
   * Tailwind class 說明：
   *   w-full             → 寬度 100%
   *   h-64               → 高度 256px（64 × 4px，Tailwind 以 4px 為單位）
   *   sm:h-80            → 螢幕寬 ≥ 640px 時高度 320px（sm: 是響應式斷點前綴）
   *   md:h-[460px]       → 螢幕寬 ≥ 768px 時高度 460px（方括號 = 任意值）
   *   lg:h-[560px]       → 螢幕寬 ≥ 1024px 時高度 560px
   *   xl:h-[640px]       → 螢幕寬 ≥ 1280px 時高度 640px
   *   bg-temple-green/10 → 背景色 temple-green，透明度 10%（/ 後面是透明度）
   *   flex               → 啟用 Flexbox 排版
   *   items-center       → Flex 子元素在垂直方向置中
   *   justify-center     → Flex 子元素在水平方向置中
   */
  if (slides.length === 0) {
    return (
      <div className="w-full h-[280px] sm:h-[420px] md:h-[580px] lg:h-[calc(100vh-96px)] bg-temple-green/10 flex items-center justify-center">
        {/*
          text-temple-green/40 → 文字顏色 temple-green，透明度 40%
          font-serif           → 使用 serif 字體（tailwind.config.js 定義的字體族）
          text-lg              → 字體大小 1.125rem（約 18px）
        */}
        <span className="text-temple-green/40 font-serif text-lg">載入中...</span>
      </div>
    );
  }

  /**
   * prev 函式 — 切換到上一張
   *
   * (p - 1 + slides.length) % slides.length：
   *   加上 slides.length 再取餘數，處理「第一張再往前」的邊界情況
   *   例如：slides.length = 3，current = 0 → (0-1+3) % 3 = 2（到最後一張）
   *   不需要 useCallback，因為 prev 不放在 useEffect 的依賴陣列裡
   */
  const prev = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);

  return (
    // relative       → 建立相對定位父容器，子元素可用 absolute 相對它定位
    // w-full         → 寬度 100%
    // overflow-hidden → 超出容器邊界的內容直接裁切（隱藏）
    // h-64 ~ xl:h-[640px] → 響應式高度（同上方說明）
    <div className="relative w-full overflow-hidden h-[280px] sm:h-[420px] md:h-[580px] lg:h-[calc(100vh-96px)]">

      {/* ====== 輪播圖片區 ====== */}
      {/*
        slides.map((slide, idx) => ...)：
          遍歷 slides 陣列，為每張圖片渲染一個 div
          map 的第二個參數 idx 是目前元素的索引（0, 1, 2...）
        key={slide.id}：
          React 渲染列表時需要唯一的 key，幫助它識別哪個元素對應哪個
          讓 React 在陣列更新時能高效地更新 DOM（不必全部重畫）
      */}
      {slides.map((slide, idx) => (
        // absolute        → 絕對定位，相對於父元素（relative 的 div）
        // inset-0         → top:0, right:0, bottom:0, left:0（撐滿父容器）
        // transition-opacity → 透明度變化時加上漸變動畫
        // duration-700    → 動畫持續 700 毫秒
        // opacity-100     → 完全不透明（目前顯示的那張）
        // opacity-0       → 完全透明（其他張，視覺上隱藏但仍在 DOM 裡）
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            idx === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/*
            w-full       → 寬度 100%
            h-full       → 高度 100%（撐滿父容器）
            object-cover → 圖片縮放方式：保持比例但裁切以填滿容器
                           類似 CSS background-size: cover 的效果
          */}
          <img
            src={slide.image_url}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          {/* 漸層遮罩：讓圖片上的白色文字更清楚可讀
              carousel-overlay 是自訂 CSS class，定義在 index.css */}
          <div className="absolute inset-0 carousel-overlay" />
        </div>
      ))}

      {/* ====== 圖片上的文字標題 ======
          absolute      → 絕對定位在輪播容器內
          bottom-8      → 距離底部 32px（8 × 4px）
          left-0 right-0 → 左右拉滿，配合 text-center 讓文字水平置中
          text-white    → 文字顏色為白色
          px-4          → 水平內距（padding-left 和 padding-right）各 16px
      */}
      <div className="absolute bottom-8 left-0 right-0 text-center text-white px-4">
        {/*
          font-serif      → 使用 serif 字體
          text-2xl        → 字體大小 1.5rem（24px）
          md:text-4xl     → 中型螢幕以上字體 2.25rem（36px）
          font-bold       → 粗體
          drop-shadow-lg  → 較大的文字陰影，讓白字在亮圖上更清楚
        */}
        <h2 className="font-serif text-2xl md:text-4xl font-bold drop-shadow-lg">
          {/* slides[current]?.title：取目前圖片的標題
              ?. 是可選串聯（Optional Chaining），避免 slides[current] 不存在時報錯 */}
          {slides[current]?.title}
        </h2>
        {/* 條件渲染：只有當目前圖片有 description 才顯示這段文字 */}
        {slides[current]?.description && (
          // mt-2          → 上方外距（margin-top）8px
          // text-sm       → 字體大小 0.875rem（14px）
          // md:text-base  → 中型螢幕以上字體 1rem（16px）
          // text-white/90 → 白色文字，透明度 90%
          // drop-shadow   → 較小的文字陰影
          <p className="mt-2 text-sm md:text-base text-white/90 drop-shadow">
            {slides[current].description}
          </p>
        )}
      </div>

      {/* ====== 左右切換按鈕和圓點指示（只有多張圖才顯示） ====== */}
      {slides.length > 1 && (
        <>
          {/* 左箭頭按鈕
              absolute left-3          → 絕對定位，距離左側 12px
              top-1/2 -translate-y-1/2 → 垂直置中（top 到 50% 再向上偏移自身高度的一半）
              w-9 h-9                  → 寬高各 36px
              bg-black/40              → 黑色背景，透明度 40%
              hover:bg-black/60        → 滑鼠懸停時透明度增到 60%
              text-white               → 文字（箭頭符號）白色
              rounded-full             → 圓角 9999px（圓形）
              flex items-center justify-center → 讓箭頭符號置中
              transition               → 屬性變化加上預設漸變動畫
          */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition"
          >
            ‹
          </button>

          {/* 右箭頭按鈕（right-3 改為靠右側 12px，其餘同左箭頭） */}
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition"
          >
            ›
          </button>

          {/* 底部圓點指示器
              absolute bottom-3    → 絕對定位，距底部 12px
              left-0 right-0       → 拉滿左右
              flex justify-center  → 水平置中排列所有圓點
              gap-2                → 圓點之間間距 8px
          */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {/*
              slides.map((_, idx) => ...)：
                _ 是圖片物件（這裡不需要，用底線命名表示「不使用」）
                idx 是索引，用來判斷這個圓點是否代表目前頁面
              點擊圓點時：setCurrent(idx) 直接跳到對應圖片
              w-2 h-2        → 寬高各 8px（小圓點）
              rounded-full   → 圓形
              transition-all → 所有屬性變化都加動畫
              bg-temple-gold w-5 → 當前頁面的圓點：金色 + 寬度拉長到 20px（橫條形）
              bg-white/60    → 其他圓點：白色半透明
            */}
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === current ? 'bg-temple-gold w-5' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
