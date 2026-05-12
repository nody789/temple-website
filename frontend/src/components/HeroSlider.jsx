/**
 * 【檔案說明】components/HeroSlider.jsx — 首頁輪播圖元件
 *
 * 這個元件實作了首頁頂部的圖片輪播（Carousel/Slider）功能：
 *   - 從後端 API 取得輪播圖片列表
 *   - 每 5 秒自動切換到下一張
 *   - 提供左右箭頭按鈕手動切換
 *   - 底部顯示圓點指示目前是第幾張
 *
 * 圖片顯示方式：
 *   w-full h-auto — 圖片照原始比例顯示，不裁切、不變形
 *   CSS grid 疊加 — 多張圖片堆疊在同一格，透過 opacity 淡入淡出切換
 *   建議提供相同比例（橫幅，例如 1920×820）的圖片，確保切換時高度一致
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
   * setInterval(next, 5000)：每 5000 毫秒（5 秒）呼叫一次 next
   * return () => clearInterval(timer)：
   *   清理函式，元件卸載或依賴改變時執行，避免記憶體洩漏
   */
  useEffect(() => {
    if (slides.length <= 1) return; // 只有一張圖不需要輪播
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  // 載入中：顯示佔位高度，避免版面跳動
  if (slides.length === 0) {
    return (
      <div className="w-full min-h-[260px] md:min-h-[460px] bg-temple-green/10 flex items-center justify-center">
        <span className="text-temple-green/40 font-serif text-lg">載入中...</span>
      </div>
    );
  }

  /**
   * prev 函式 — 切換到上一張
   * (p - 1 + slides.length) % slides.length：處理「第一張再往前」邊界
   * 例如：slides.length = 3，current = 0 → (0-1+3) % 3 = 2（到最後一張）
   */
  const prev = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);

  return (
    /*
      輪播外框：
        relative w-full overflow-hidden → 讓內部 absolute 按鈕可以定位
        高度由內部圖片自然高度決定（w-full h-auto），不設固定高度
    */
    <div className="relative w-full overflow-hidden">

      {/*
        ── CSS grid 疊加技巧 ─────────────────────────────────────────
        問題：多張圖片互相切換時，若用 absolute inset-0 堆疊，
              父容器會沒有高度（absolute 元素不佔版面），按鈕也無法垂直置中。
        解法：用 CSS grid，讓所有圖片、遮罩、文字都放進「同一個格子」（gridArea: '1/1'）。
              grid 容器高度 = 最高的子元素高度，容器有正常高度。
              透過 opacity 切換顯示哪張圖（不裁切、不縮放、不跳版）。

        注意：建議所有輪播圖片使用相同比例（橫幅），
              若比例差異大，切換時容器高度可能有輕微變化。
      */}
      <div className="grid grid-cols-1 w-full">

        {/* ── 輪播圖片（每張都疊在 grid-area 1/1）────────────────── */}
        {slides.map((slide, idx) => (
          /*
            key={slide.id}：React 用來識別列表元素，資料更新時只重繪必要的 DOM
            style={{ gridArea: '1 / 1' }}：所有圖片疊在同一個格子
            transition-opacity duration-700：透明度淡入淡出，700ms
            opacity-100 / opacity-0：目前張完全不透明，其他張完全透明
          */
          <img
            key={slide.id}
            src={slide.image_url}
            alt={slide.title}
            style={{ gridArea: '1 / 1' }}
            // w-full h-auto：寬度撐滿，高度照圖片原始比例，完全不裁切
            className={`w-full h-auto block transition-opacity duration-700 ${
              idx === current ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {/* ── 漸層遮罩（也在 grid-area 1/1，撐滿整個格子高度）───── */}
        {/*
          pointer-events-none：讓點擊穿透遮罩，不阻擋圖片下方的互動
          z-10：確保遮罩在圖片上層，讓底部文字清晰可讀
          carousel-overlay：定義於 index.css，bottom-to-top 漸層暗色
        */}
        <div
          style={{ gridArea: '1 / 1' }}
          className="carousel-overlay z-10 pointer-events-none"
        />

        {/* ── 圖片上的文字標題（靠底部對齊）─────────────────────── */}
        {/*
          alignSelf: 'end'：在 grid 格子內靠底部對齊
          z-20：在遮罩（z-10）上層
          pointer-events-none：文字不阻擋使用者點擊
        */}
        <div
          style={{ gridArea: '1 / 1', alignSelf: 'end' }}
          className="relative z-20 text-center text-white px-4 pb-8 pointer-events-none"
        >
          {/*
            slides[current]?.title：取目前圖片的標題
            ?. 是可選串聯（Optional Chaining），避免 slides[current] 為 undefined 時報錯
          */}
          <h2 className="font-serif text-2xl md:text-4xl font-bold drop-shadow-lg">
            {slides[current]?.title}
          </h2>
          {/* 條件渲染：只有當目前圖片有 description 才顯示 */}
          {slides[current]?.description && (
            <p className="mt-2 text-sm md:text-base text-white/90 drop-shadow">
              {slides[current].description}
            </p>
          )}
        </div>
      </div>

      {/* ====== 左右切換按鈕和圓點指示（只有多張圖才顯示） ====== */}
      {/*
        這些元素是 absolute，定位在最外層 relative 容器內
        z-30：確保在遮罩（z-10）和文字（z-20）上層，可以點擊
      */}
      {slides.length > 1 && (
        <>
          {/* 左箭頭按鈕
              absolute left-3          → 絕對定位，距左側 12px
              top-1/2 -translate-y-1/2 → 垂直置中
              w-9 h-9                  → 寬高各 36px
              bg-black/40 hover:bg-black/60 → 半透明背景，懸停加深
              rounded-full             → 圓形按鈕
          */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 z-30 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition"
          >
            ‹
          </button>

          {/* 右箭頭按鈕 */}
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 z-30 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition"
          >
            ›
          </button>

          {/* 底部圓點指示器
              absolute bottom-3    → 距底部 12px
              flex justify-center  → 水平置中排列
              gap-2                → 圓點間距 8px
          */}
          <div className="absolute bottom-3 left-0 right-0 z-30 flex justify-center gap-2">
            {/*
              slides.map((_, idx) => ...)：
                _ 是圖片物件（這裡不需要，用底線表示「不使用」）
                idx 是索引，用來判斷這個圓點是否代表目前頁面
              bg-temple-gold w-5 → 當前頁面：金色 + 拉長成橫條
              bg-white/60        → 其他：白色半透明圓點
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
