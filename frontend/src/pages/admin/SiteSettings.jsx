import { useEffect, useState } from 'react';
import api from '../../api';

export default function SiteSettings() {
  const [settings, setSettings] = useState({
    site_name: '',
    site_subtitle: '',
    main_deity: '',
    founding_year: '',
    phone: '',
    email: '',
    address: '',
    open_hours: '',
    about_text: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState(null);

  useEffect(() => {
    api.get('/settings')
      .then((r) => setSettings((prev) => ({ ...prev, ...r.data })))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', settings);
      setMsg({ text: '設定儲存成功', type: 'success' });
    } catch {
      setMsg({ text: '儲存失敗', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleChangePwd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/change-password', { oldPassword: oldPwd, newPassword: newPwd });
      setPwdMsg({ text: '密碼更新成功', type: 'success' });
      setOldPwd('');
      setNewPwd('');
    } catch (err) {
      setPwdMsg({ text: err.response?.data?.message || '更新失敗', type: 'error' });
    } finally {
      setTimeout(() => setPwdMsg(null), 3000);
    }
  };

  const inputClass = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-temple-red';
  const Field = ({ label, name, type = 'text', placeholder }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={settings[name] || ''}
        onChange={(e) => setSettings({ ...settings, [name]: e.target.value })}
        className={inputClass}
        placeholder={placeholder}
      />
    </div>
  );

  if (loading) return <div className="text-gray-400 text-center py-20">載入中...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      {msg && (
        <div className={`p-3 rounded text-sm text-center ${msg.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {msg.text}
        </div>
      )}

      {/* 網站基本設定 */}
      <form onSubmit={handleSave} className="bg-white rounded shadow-sm p-5 space-y-4">
        <h3 className="font-medium text-gray-700 border-b border-gray-200 pb-2">網站基本設定</h3>

        <Field label="廟名" name="site_name" placeholder="例：玄天上帝廟" />
        <Field label="副標語" name="site_subtitle" placeholder="例：神恩浩蕩，庇佑四方" />
        <Field label="主祀神明" name="main_deity" placeholder="例：玄天上帝" />
        <Field label="創建年份" name="founding_year" placeholder="例：民國50年" />

        <h4 className="font-medium text-gray-600 text-sm border-b border-gray-100 pb-1 pt-2">聯絡資訊</h4>
        <Field label="電話" name="phone" placeholder="例：02-1234-5678" />
        <Field label="電子郵件" name="email" type="email" placeholder="temple@example.com" />
        <Field label="地址" name="address" placeholder="完整通訊地址" />
        <Field label="開放時間" name="open_hours" placeholder="例：每日 06:00 - 21:00" />

        <h4 className="font-medium text-gray-600 text-sm border-b border-gray-100 pb-1 pt-2">本廟簡介文字</h4>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">簡介內容</label>
          <textarea
            value={settings.about_text || ''}
            onChange={(e) => setSettings({ ...settings, about_text: e.target.value })}
            className={`${inputClass} resize-y`}
            rows={6}
            placeholder="廟宇的歷史背景與介紹..."
          />
        </div>

        <button type="submit" disabled={saving} className="bg-temple-red text-white px-6 py-2 text-sm rounded hover:bg-temple-red-dark disabled:opacity-60">
          {saving ? '儲存中...' : '儲存設定'}
        </button>
      </form>

      {/* 更改密碼 */}
      <form onSubmit={handleChangePwd} className="bg-white rounded shadow-sm p-5 space-y-4">
        <h3 className="font-medium text-gray-700 border-b border-gray-200 pb-2">更改管理員密碼</h3>
        {pwdMsg && (
          <div className={`p-2 rounded text-sm ${pwdMsg.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {pwdMsg.text}
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">舊密碼</label>
          <input type="password" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">新密碼（至少 6 個字元）</label>
          <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className={inputClass} minLength={6} required />
        </div>
        <button type="submit" className="bg-gray-700 text-white px-6 py-2 text-sm rounded hover:bg-gray-800">
          更新密碼
        </button>
      </form>
    </div>
  );
}
