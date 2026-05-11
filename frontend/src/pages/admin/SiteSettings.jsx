import { useEffect, useState } from 'react';
import api from '../../api';
import AdminToast from '../../components/admin/AdminToast';

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
    intro_video_url: '',
    seo_title: '',
    meta_description: '',
    meta_keywords: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [videoUploading, setVideoUploading] = useState(false);
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

  const inputClass = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-temple-green';
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
      <AdminToast msg={msg} />

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

        <h4 className="font-medium text-gray-600 text-sm border-b border-gray-100 pb-1 pt-2">SEO 搜尋引擎設定</h4>
        <Field
          label="瀏覽器標題（SEO Title）"
          name="seo_title"
          placeholder="例：南天母中壇元帥道場 | 官方網站"
        />
        <p className="text-xs text-gray-400 -mt-3">留空時自動使用廟名。建議格式：廟名 | 官方網站</p>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            網站描述（Meta Description）
            <span className="text-gray-400 font-normal ml-1">{(settings.meta_description || '').length}/160</span>
          </label>
          <textarea
            value={settings.meta_description || ''}
            onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
            className={`${inputClass} resize-none`}
            rows={3}
            maxLength={160}
            placeholder="搜尋引擎結果頁顯示的網站說明，建議 50–160 字..."
          />
        </div>
        <Field
          label="關鍵字（Meta Keywords，以逗號分隔）"
          name="meta_keywords"
          placeholder="例：中壇元帥,三太子,廟宇,天母,台北"
        />

        <h4 className="font-medium text-gray-600 text-sm border-b border-gray-100 pb-1 pt-2">建廟過程影片</h4>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            影片網址（留空則不顯示影片區塊）
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={settings.intro_video_url || ''}
              onChange={(e) => setSettings({ ...settings, intro_video_url: e.target.value })}
              className={`${inputClass} flex-1`}
              placeholder="貼上 YouTube 網址，或上傳影片後自動填入"
            />
            <label className="shrink-0 cursor-pointer bg-gray-100 border border-gray-300 text-gray-600 text-xs px-3 py-2 rounded hover:bg-gray-200 flex items-center">
              {videoUploading ? '上傳中...' : '上傳影片'}
              <input
                type="file"
                accept=".mp4,.webm,.mov"
                className="hidden"
                disabled={videoUploading}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setVideoUploading(true);
                  try {
                    const form = new FormData();
                    form.append('image', file);
                    const r = await api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
                    setSettings((prev) => ({ ...prev, intro_video_url: r.data.url }));
                  } catch {
                    alert('影片上傳失敗');
                  } finally {
                    setVideoUploading(false);
                    e.target.value = '';
                  }
                }}
              />
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            支援 YouTube 網址 或 直接上傳 MP4 / WebM / MOV（最大 200MB）。
          </p>
        </div>

        <button type="submit" disabled={saving} className="bg-temple-green text-white px-6 py-2 text-sm rounded hover:bg-temple-green-dark disabled:opacity-60">
          {saving ? '儲存中...' : '儲存設定'}
        </button>
      </form>

      {/* 更改密碼 */}
      <form onSubmit={handleChangePwd} className="bg-white rounded shadow-sm p-5 space-y-4">
        <h3 className="font-medium text-gray-700 border-b border-gray-200 pb-2">更改管理員密碼</h3>
        <AdminToast msg={pwdMsg} />
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
