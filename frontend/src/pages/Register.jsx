import { useEffect, useState } from 'react';
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

    try {
      const payload = {
        ...form,
        activity_id: form.activity_id ? parseInt(form.activity_id) : null,
        participants: parseInt(form.participants),
      };
      const res = await api.post('/registration', payload);
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
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl text-temple-green-dark mb-2">線上報名</h1>
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-0.5 bg-temple-gold" />
          <span className="text-temple-gold text-xl">❖</span>
          <div className="w-16 h-0.5 bg-temple-gold" />
        </div>
        <p className="text-sm text-gray-500 mt-4">請填寫以下表格，廟方人員將儘快與您聯繫確認報名。</p>
      </div>

      {status === 'success' && (
        <div className="bg-green-50 border border-green-300 text-green-700 rounded-sm p-4 mb-6 text-center">
          ✅ {message}
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-sm p-4 mb-6 text-center">
          ❌ {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="temple-card p-6 md:p-8 space-y-5">
        {/* 姓名 */}
        <div>
          <label className={labelClass}>
            姓名 <span className="text-temple-green">*</span>
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
            聯絡電話 <span className="text-temple-green">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className={inputClass}
            placeholder="例：0912345678 或 02-12345678"
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
                {act.start_date ? ` (${act.start_date})` : ''}
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
          className="w-full btn-primary py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? '提交中...' : '確認送出報名'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          * 標示為必填欄位。填寫個人資料即表示同意廟方僅將其用於活動聯繫。
        </p>
      </form>
    </main>
  );
}
