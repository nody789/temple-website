/**
 * 【元件說明】SkeletonCard.jsx — 載入中骨架屏元件
 *
 * 什麼是 Skeleton（骨架屏）？
 *   在資料還在從 API 載入的期間，顯示「和真實內容形狀相似的灰色佔位方塊」，
 *   讓使用者知道頁面正在載入，而不是看到空白或純文字「載入中...」。
 *
 * 為什麼比「載入中...」文字好？
 *   - 使用者對頁面結構有預期感，不會以為頁面壞掉
 *   - 動畫（animate-pulse）讓使用者感覺系統有在運作
 *   - 視覺上比純文字更接近商業級產品的品質
 *
 * animate-pulse：
 *   Tailwind 內建的動畫類別，讓元素以 2 秒為週期緩慢呼吸（亮→暗→亮）。
 *
 * Props：
 *   hasImage  (boolean，預設 true)  — 是否顯示圖片佔位區塊
 *   imageH    (string，預設 'h-44') — 圖片佔位區塊的高度（Tailwind class）
 *   lines     (number，預設 3)      — 文字行數佔位塊的數量
 */
export default function SkeletonCard({ hasImage = true, imageH = 'h-44', lines = 3 }) {
  return (
    // temple-card：自訂樣式（白底 + 金色邊框 + 圓角），定義在 index.css
    // overflow-hidden：讓圖片佔位塊貼合卡片圓角
    // animate-pulse：全卡片呼吸動畫
    <div className="temple-card overflow-hidden animate-pulse">

      {/* 圖片佔位區塊：只有 hasImage 為 true 時顯示 */}
      {hasImage && (
        // bg-gray-200：淡灰色佔位色
        // imageH：由 props 決定高度（預設 h-44 = 176px）
        <div className={`bg-gray-200 w-full ${imageH}`} />
      )}

      {/* 文字佔位區塊 */}
      <div className="p-5 space-y-3">
        {/* 日期/標籤列：較窄（1/3 寬） */}
        <div className="bg-gray-200 h-3 w-1/3 rounded" />
        {/* 標題列：較粗（h-5），3/4 寬 */}
        <div className="bg-gray-200 h-5 w-3/4 rounded" />
        {/*
          內文行：動態產生 lines 條
          Array.from({ length: lines })：建立長度為 lines 的陣列
          每行寬度稍微不同，視覺上更自然（不像整齊的方格）
          95% → 80% → 65%（越後面越短，像真實文字段落的感覺）
        */}
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-200 h-3 rounded"
            style={{ width: `${95 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * SkeletonNewsItem — 新聞列表專用的骨架屏（橫向列表樣式）
 *
 * 新聞列表的卡片是「左邊日期方塊 + 右邊文字」的橫向排版，
 * 和一般卡片不同，所以另外做一個骨架版本。
 */
export function SkeletonNewsItem() {
  return (
    <div className="temple-card p-5 flex gap-4 animate-pulse">
      {/* 日期方塊佔位（固定寬度） */}
      <div className="shrink-0 w-16 h-16 bg-gray-200 rounded-sm" />
      {/* 文字區塊 */}
      <div className="flex-1 space-y-3 pt-1">
        <div className="bg-gray-200 h-4 w-3/4 rounded" />
        <div className="bg-gray-200 h-3 w-full rounded" />
        <div className="bg-gray-200 h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}
