/**
 * 【檔案說明】components/admin/AdminToast.jsx — 後台操作結果通知元件
 *
 * 這個元件在畫面正中央顯示一個短暫的提示訊息（Toast / Snackbar），
 * 用來告知使用者操作是否成功或失敗。
 *
 * 例如：
 *   - 儲存成功 → 顯示綠色打勾的黑色訊息框
 *   - 刪除失敗 → 顯示紅色叉叉的錯誤訊息框
 *
 * Props 說明：
 *   @param {object|null} msg - 要顯示的訊息物件
 *     msg.type：'error' 表示錯誤，其他值（如 'success'）表示成功
 *     msg.text：要顯示的訊息文字
 *   若 msg 為 null 或 undefined，元件不渲染任何內容
 *
 * 父元件（如 NewsManager）負責：
 *   1. 維護 msg 狀態（useState）
 *   2. 操作後設定 msg → 顯示 Toast
 *   3. 幾秒後把 msg 設回 null → Toast 消失
 */

/**
 * AdminToast 元件
 *
 * Props 解構：{ msg }
 *   直接從 props 物件解構出 msg，等同於 props.msg
 *
 * @param {{ type: string, text: string }|null} msg - 訊息物件
 */
export default function AdminToast({ msg }) {

  /**
   * 條件渲染：若 msg 不存在，不渲染任何東西
   * !msg → msg 為 null、undefined 或空字串時為 true
   * return null → React 元件回傳 null 表示「不渲染任何 DOM」
   */
  if (!msg) return null;

  /**
   * 判斷是否為錯誤類型
   * msg.type === 'error' → 回傳布林值 true 或 false
   */
  const isError = msg.type === 'error';

  return (
    // className 說明：
    // fixed             → 固定定位（relative to 視窗，不隨頁面滾動）
    // top-1/2 left-1/2  → 放在視窗正中間（位置從中心點出發）
    // -translate-x-1/2 -translate-y-1/2 → 向左和向上各偏移自身寬/高的 50%
    //                       配合 top-1/2 + left-1/2 達到「完美置中」效果
    // z-50              → z-index: 50，顯示在其他內容最上方
    // flex items-center → Flex 排版，讓圖示和文字垂直對齊
    // gap-3             → 圖示和文字之間間距 12px
    // px-6              → 左右內距 24px
    // py-4              → 上下內距 16px
    // rounded-lg        → 圓角 8px
    // shadow-2xl        → 非常大的陰影，產生「浮起」的立體感
    // text-sm           → 字體大小 14px
    // font-medium       → 字重 500
    // modal-enter       → 自訂 CSS class（定義入場動畫，在 index.css）
    // 錯誤時：bg-red-600 text-white → 紅色背景、白色文字
    // 成功時：bg-gray-900 text-white border-l-4 border-green-400
    //        → 深色背景、白色文字、左側有 4px 綠色邊框
    <div
      className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl text-sm font-medium
        modal-enter
        ${isError
          ? 'bg-red-600 text-white'
          : 'bg-gray-900 text-white border-l-4 border-green-400'
        }`}
    >
      {/* 根據 isError 顯示不同的 SVG 圖示（三元運算子條件渲染） */}
      {isError ? (
        // 錯誤圖示：X 叉叉
        // w-5 h-5   → 寬高各 20px
        // shrink-0  → 防止圖示被 flex 壓縮（確保圖示永遠是正方形）
        // fill="none" stroke="currentColor" → 不填色，只用當前文字顏色描邊
        // strokeWidth={2} → 線條粗細 2px
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {/* M6 18L18 6M6 6l12 12 → 畫兩條交叉線，形成 X 圖案 */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        // 成功圖示：打勾符號
        // text-green-400 → 綠色（覆蓋父元素的 text-white）
        // strokeWidth={2.5} → 稍粗的線條，讓打勾更明顯
        <svg className="w-5 h-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          {/* M5 13l4 4L19 7 → 打勾路徑（短斜線 + 長斜線） */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}

      {/* 訊息文字 */}
      <span>{msg.text}</span>
    </div>
  );
}
