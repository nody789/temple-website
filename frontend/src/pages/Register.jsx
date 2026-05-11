/**
 * 【頁面說明】Register.jsx — 線上報名頁
 *
 * 包含一個完整的報名表單，功能：
 *   1. 從後端取得活動清單，填入下拉選單
 *   2. 表單欄位：姓名、電話、身分證、Email、地址、活動、人數、備註
 *   3. 送出後呼叫後端 API，成功顯示 Modal 彈窗，失敗顯示錯誤訊息
 *
 * 學習重點：
 *   - 多個 useState 管理不同狀態（表單資料、送出狀態、成功/失敗）
 *   - 受控元件（Controlled Component）：input 的 value 綁定 state
 *   - handleChange：通用的表單欄位更新函式（利用 [name] 動態屬性）
 *   - handleSubmit：async/await 非同步送出表單
 *   - Tailwind：fixed inset-0、z-50、disabled:opacity-60、animate-spin
 */

// useEffect、useState：React Hooks
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import SEOHead from '../components/SEOHead';

export default function Register() {
  // ── useState 宣告所有狀態變數 ─────────────────────────────────

  // activities：從 API 取得的活動清單（填入下拉選單）
  const [activities, setActivities] = useState([]);

  // form：表單所有欄位的值，用一個物件統一管理
  // 初始值為各欄位的預設值（空字串或 1）
  const [form, setForm] = useState({
    name: '',         // 姓名
    id_number: '',    // 身分證字號
    phone: '',        // 聯絡電話
    email: '',        // 電子郵件
    address: '',      // 聯絡地址
    activity_id: '',  // 選擇的活動 id
    participants: 1,  // 報名人數，預設 1 人
    notes: '',        // 備註
  });

  // status：送出結果狀態，'success' | 'error' | null
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  // message：來自後端的訊息文字
  const [message, setMessage] = useState('');
  // submitting：是否正在送出中（防止重複點擊）
  const [submitting, setSubmitting] = useState(false);
  // 送出成功後要在 Modal 中顯示的確認資訊（form 清空前先存起來）
  const [submittedName, setSubmittedName] = useState('');
  const [submittedActivity, setSubmittedActivity] = useState('');
  const [submittedParticipants, setSubmittedParticipants] = useState(1);

  // 格式化日期，只取 YYYY-MM-DD
  const formatDate = (d) => {
    if (!d) return '';
    return String(d).slice(0, 10); // 只取 YYYY-MM-DD
  };

  // useEffect：頁面載入後取得活動清單（空陣列 → 只執行一次）
  useEffect(() => {
    window.scrollTo(0, 0);
    api.get('/activities').then((res) => setActivities(res.data)).catch(() => {});
  }, []);

  // ── handleChange：通用的表單欄位更新函式 ──────────────────────
  // 受控元件（Controlled Component）的核心：
  //   - 每個 <input> 的 value 都綁定到 form 狀態
  //   - 使用者輸入 → onChange 觸發 handleChange → 更新 form 狀態 → React 重新渲染
  const handleChange = (e) => {
    const { name, value } = e.target; // name：input 的 name 屬性；value：新輸入值
    // setForm 更新 form 狀態：
    //   (prev) => ({ ...prev, [name]: value })：
    //   ...prev 展開保留所有現有欄位；[name]: value 用動態屬性名覆蓋對應欄位
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ── handleSubmit：非同步送出表單 ──────────────────────────────
  // async：宣告為非同步函式，裡面可以使用 await
  const handleSubmit = async (e) => {
    e.preventDefault(); // 阻止表單的預設行為（防止頁面重整）
    setSubmitting(true);
    setStatus(null);

    const selectedActivity = activities.find((a) => String(a.id) === String(form.activity_id));

    try {
      const payload = {
        ...form,
        activity_id: form.activity_id ? parseInt(form.activity_id) : null, // 字串轉整數，空字串轉 null
        participants: parseInt(form.participants),
      };
      // await：等待 API 回應，成功繼續，失敗拋錯到 catch
      const res = await api.post('/registration', payload);
      setSubmittedName(form.name);
      setSubmittedActivity(selectedActivity?.title || ''); // ?. 可選鏈，避免 undefined 報錯
      setSubmittedParticipants(parseInt(form.participants));
      setStatus('success');
      setMessage(res.data.message);
      // 清空表單，讓使用者可以繼續填寫下一筆
      setForm({ name: '', id_number: '', phone: '', email: '', address: '', activity_id: '', participants: 1, notes: '' });
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || '提交失敗，請稍後再試');
    } finally {
      setSubmitting(false); // 無論成功失敗都關閉「送出中」狀態
    }
  };

  // ── 共用樣式字串 ───────────────────────────────────────────────
  // 把常用 Tailwind class 存成變數，避免重複撰寫
  // inputClass：w-full(100%) border(邊框) rounded-sm(圓角) px-3 py-2(內距)
  //             focus:outline-none(移除預設focus外框) focus:border-temple-green(focus時綠色邊框)
  //             transition-colors(顏色平滑過渡)
  const inputClass = 'w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-temple-green transition-colors';
  // labelClass：block(佔整行) text-sm font-medium(小字中粗) mb-1(下間距)
  const labelClass = 'block text-sm font-medium text-temple-dark mb-1';

  return (
    // max-w-2xl：最大寬 42rem（表單不需要太寬）
    <main className="max-w-2xl mx-auto px-4 py-12">
      <SEOHead title="線上報名" />

      {/* ── 報名成功 Modal 彈窗 ──────────────────────────────────
          條件渲染：status === 'success' 時才顯示
          fixed inset-0：固定定位，覆蓋整個畫面（上下左右都是 0）
          z-50：z-index 50，確保在最上層
          bg-black/60：黑色遮罩，透明度 60%
          backdrop-blur-sm：背景輕微模糊（毛玻璃感）
      */}
      {status === 'success' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          {/* shadow-2xl：最大陰影；overflow-hidden：圓角裁切頂部裝飾條 */}
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full overflow-hidden modal-enter">
            {/* 頂部金色漸層裝飾條
                h-1.5：高度 0.375rem（細線）
                bg-gradient-to-r from-...-via-...-to-...：三色漸層
            */}
            <div className="h-1.5 bg-gradient-to-r from-temple-gold-dark via-temple-gold to-temple-gold-light" />

            <div className="px-8 pt-7 pb-8 text-center">
              {/* 成功打勾圖示
                  rounded-full：完全圓形；flex items-center justify-center：內容置中
              */}
              <div className="w-20 h-20 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  {/* M5 13l4 4L19 7：SVG 路徑，畫出 ✓ 勾勾 */}
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="font-serif text-2xl text-temple-green-dark font-bold mb-1">報名成功</h2>
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="w-10 h-px bg-temple-gold" />
                <span className="text-temple-gold text-base">❖</span>
                <div className="w-10 h-px bg-temple-gold" />
              </div>

              {/* 報名資訊確認卡片
                  text-left：覆蓋外層 text-center，讓資訊靠左對齊
                  flex justify-between：兩端對齊（label 靠左，值靠右）
              */}
              <div className="bg-temple-cream rounded-sm border border-temple-gold/30 text-left px-4 py-3 space-y-2 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">報名者</span>
                  <span className="font-semibold text-temple-dark">{submittedName}</span>
                </div>
                {/* submittedActivity && (...)：只有選了活動才顯示 */}
                {submittedActivity && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">報名活動</span>
                    {/* max-w-[180px]：限制活動名稱最大寬度，避免過長 */}
                    <span className="font-medium text-temple-dark text-right max-w-[180px]">{submittedActivity}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">報名人數</span>
                  <span className="font-medium text-temple-dark">{submittedParticipants} 人</span>
                </div>
              </div>

              <p className="text-gray-400 text-xs leading-relaxed mb-6">
                廟方人員將儘快與您聯繫確認報名<br />感謝您的支持與參與，祝福平安如意
              </p>

              {/* flex gap-3：兩個按鈕並排，間距 0.75rem；flex-1：平分寬度 */}
              <div className="flex gap-3">
                {/* 繼續報名：setStatus(null) 把 status 清除，關閉 Modal */}
                <button
                  onClick={() => setStatus(null)}
                  className="flex-1 border border-temple-gold text-temple-green py-2.5 text-sm rounded-sm hover:bg-temple-gold/5 transition-colors font-medium"
                >
                  繼續報名
                </button>
                <Link
                  to="/"
                  className="flex-1 btn-primary py-2.5 text-sm text-center rounded-sm font-medium"
                >
                  返回首頁
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 頁面標題 */}
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl text-temple-green-dark mb-2">線上報名</h1>
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-0.5 bg-temple-gold" />
          <span className="text-temple-gold text-xl">❖</span>
          <div className="w-16 h-0.5 bg-temple-gold" />
        </div>
        <p className="text-sm text-gray-500 mt-4">請填寫以下表格，廟方人員將儘快與您聯繫確認報名。</p>
      </div>

      {/* ── 錯誤訊息（status === 'error' 才顯示）──────────────── */}
      {status === 'error' && (
        // bg-red-50：淡紅色背景；flex items-center gap-2：圖示和文字並排置中
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-sm p-4 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{message}</span>
        </div>
      )}

      {/* ── 報名表單 ──────────────────────────────────────────────
          onSubmit={handleSubmit}：表單送出時執行 handleSubmit
          space-y-5：表單欄位之間垂直間距 1.25rem
      */}
      <form onSubmit={handleSubmit} className="temple-card p-6 md:p-8 space-y-5">

        {/* 姓名（必填）
            受控元件：value={form.name} + onChange={handleChange}
            name="name"：必須與 form 物件屬性名稱一致
            required：HTML 原生必填驗證
        */}
        <div>
          <label className={labelClass}>
            姓名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={inputClass}
            placeholder="請輸入您的姓名"
            required
          />
        </div>

        {/* 電話（必填）：type="tel" 手機版會彈出數字鍵盤 */}
        <div>
          <label className={labelClass}>
            聯絡電話 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className={inputClass}
            placeholder="例：0912-345-678 或 02-1234-5678"
            required
          />
        </div>

        {/* 身分證字號（選填）：maxLength={10} 限制最多 10 字元 */}
        <div>
          <label className={labelClass}>身分證字號（選填）</label>
          <input
            type="text"
            name="id_number"
            value={form.id_number}
            onChange={handleChange}
            className={inputClass}
            placeholder="若活動需要身份確認，請填寫"
            maxLength={10}
          />
        </div>

        {/* Email（選填）：type="email" 瀏覽器會驗證 Email 格式 */}
        <div>
          <label className={labelClass}>電子郵件（選填）</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={inputClass}
            placeholder="example@email.com"
          />
        </div>

        {/* 地址（選填） */}
        <div>
          <label className={labelClass}>聯絡地址（選填）</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className={inputClass}
            placeholder="請輸入您的聯絡地址"
          />
        </div>

        {/* 報名活動下拉選單（選填）
            <select> 受控元件寫法同 input
            .map() 從 activities 陣列產生 <option>
        */}
        <div>
          <label className={labelClass}>報名活動（選填）</label>
          <select
            name="activity_id"
            value={form.activity_id}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">-- 請選擇活動 --</option>
            {activities.map((act) => (
              <option key={act.id} value={act.id}>
                {act.title}
                {act.start_date ? ` (${formatDate(act.start_date)})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* 報名人數：type="number" min/max 限制輸入範圍 */}
        <div>
          <label className={labelClass}>報名人數</label>
          <input
            type="number"
            name="participants"
            value={form.participants}
            onChange={handleChange}
            className={inputClass}
            min={1}
            max={20}
          />
        </div>

        {/* 備註（選填）：<textarea> 多行輸入；resize-none 禁止調整大小 */}
        <div>
          <label className={labelClass}>備註（選填）</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className={`${inputClass} resize-none`}
            rows={3}
            placeholder="如有特殊需求或問題，請在此說明"
          />
        </div>

        {/* 送出按鈕
            disabled={submitting}：送出中時禁用（防止重複送出）
            disabled:opacity-60：禁用時半透明（Tailwind disabled 變體）
            disabled:cursor-not-allowed：禁用時顯示禁止游標
        */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-primary py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {/*
            三元運算子：送出中顯示旋轉動畫，否則顯示一般文字
            animate-spin：Tailwind 內建旋轉動畫
          */}
          {submitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              提交中...
            </>
          ) : '確認送出報名'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          * 標示為必填欄位。填寫個人資料即表示同意廟方僅將其用於活動聯繫。
        </p>
      </form>
    </main>
  );
}
