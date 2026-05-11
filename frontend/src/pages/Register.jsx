import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState({
    name: '',
    id_number: '',
    phone: '',
    email: '',
    address: '',
    activity_id: '',
    participants: 1,
    notes: '',
  });
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [submittedActivity, setSubmittedActivity] = useState('');
  const [submittedParticipants, setSubmittedParticipants] = useState(1);

  const formatDate = (d) => {
    if (!d) return '';
    return String(d).slice(0, 10); // 只取 YYYY-MM-DD
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get('/activities').then((res) => setActivities(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    const selectedActivity = activities.find((a) => String(a.id) === String(form.activity_id));

    try {
      const payload = {
        ...form,
        activity_id: form.activity_id ? parseInt(form.activity_id) : null,
        participants: parseInt(form.participants),
      };
      const res = await api.post('/registration', payload);
      setSubmittedName(form.name);
      setSubmittedActivity(selectedActivity?.title || '');
      setSubmittedParticipants(parseInt(form.participants));
      setStatus('success');
      setMessage(res.data.message);
      setForm({ name: '', id_number: '', phone: '', email: '', address: '', activity_id: '', participants: 1, notes: '' });
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || '提交失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-temple-green transition-colors';
  const labelClass = 'block text-sm font-medium text-temple-dark mb-1';

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">

      {/* ── 報名成功 Modal ── */}
      {status === 'success' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full overflow-hidden modal-enter">
            {/* 金色頂部裝飾條 */}
            <div className="h-1.5 bg-gradient-to-r from-temple-gold-dark via-temple-gold to-temple-gold-light" />

            <div className="px-8 pt-7 pb-8 text-center">
              {/* 成功圖示 */}
              <div className="w-20 h-20 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="font-serif text-2xl text-temple-green-dark font-bold mb-1">報名成功</h2>
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="w-10 h-px bg-temple-gold" />
                <span className="text-temple-gold text-base">❖</span>
                <div className="w-10 h-px bg-temple-gold" />
              </div>

              {/* 報名資訊卡 */}
              <div className="bg-temple-cream rounded-sm border border-temple-gold/30 text-left px-4 py-3 space-y-2 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">報名者</span>
                  <span className="font-semibold text-temple-dark">{submittedName}</span>
                </div>
                {submittedActivity && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">報名活動</span>
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

              <div className="flex gap-3">
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

      {/* ── 頁面標題 ── */}
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl text-temple-green-dark mb-2">線上報名</h1>
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-0.5 bg-temple-gold" />
          <span className="text-temple-gold text-xl">❖</span>
          <div className="w-16 h-0.5 bg-temple-gold" />
        </div>
        <p className="text-sm text-gray-500 mt-4">請填寫以下表格，廟方人員將儘快與您聯繫確認報名。</p>
      </div>

      {/* 錯誤訊息 */}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-sm p-4 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{message}</span>
        </div>
      )}

      {/* ── 報名表單 ── */}
      <form onSubmit={handleSubmit} className="temple-card p-6 md:p-8 space-y-5">

        {/* 姓名 */}
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

        {/* 電話 */}
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

        {/* 身分證 */}
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

        {/* Email */}
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

        {/* 地址 */}
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

        {/* 報名活動 */}
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

        {/* 報名人數 */}
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

        {/* 備註 */}
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-primary py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
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
