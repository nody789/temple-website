import { useEffect, useState } from 'react';
import api from '../../api';

const emptyForm = { title: '', description: '', start_date: '', end_date: '', location: '', image_url: '', active: true };

export default function ActivitiesManager() {
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => api.get('/activities/all').then((r) => setActivities(r.data));
  useEffect(() => { load(); }, []);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/upload', fd);
      setForm((prev) => ({ ...prev, image_url: res.data.url }));
    } catch {
      showMsg('圖片上傳失敗', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/activities/${editId}`, form);
        showMsg('更新成功');
      } else {
        await api.post('/activities', form);
        showMsg('新增成功');
      }
      setForm(emptyForm);
      setEditId(null);
      load();
    } catch (err) {
      showMsg(err.response?.data?.message || '操作失敗', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      title: item.title,
      description: item.description || '',
      start_date: item.start_date || '',
      end_date: item.end_date || '',
      location: item.location || '',
      image_url: item.image_url || '',
      active: !!item.active,
    });
    setEditId(item.id);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!confirm('確定要刪除此活動？')) return;
    await api.delete(`/activities/${id}`);
    showMsg('刪除成功');
    load();
  };

  const inputClass = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-temple-red';

  return (
    <div className="space-y-6">
      {msg && (
        <div className={`p-3 rounded text-sm text-center ${msg.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {msg.text}
        </div>
      )}

      {/* 表單 */}
      <div className="bg-white rounded shadow-sm p-5">
        <h3 className="font-medium text-gray-700 mb-4">{editId ? '編輯活動' : '新增活動'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">活動名稱 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">開始日期</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">結束日期</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">活動地點</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} placeholder="活動舉辦地點" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">活動說明</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${inputClass} resize-y`}
              rows={4}
              placeholder="活動詳細說明..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">圖片（選填）</label>
            <div className="flex gap-2 flex-wrap">
              <input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={`${inputClass} flex-1`} placeholder="圖片網址" />
              <label className="shrink-0 cursor-pointer bg-gray-100 border border-gray-300 text-xs px-3 py-2 rounded hover:bg-gray-200">
                {uploading ? '上傳中...' : '📁 上傳'}
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="act-active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            <label htmlFor="act-active" className="text-sm text-gray-700">在前台顯示</label>
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="bg-temple-red text-white px-5 py-2 text-sm rounded hover:bg-temple-red-dark disabled:opacity-60">
              {saving ? '儲存中...' : editId ? '儲存修改' : '新增活動'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setForm(emptyForm); setEditId(null); }} className="border border-gray-300 px-5 py-2 text-sm rounded hover:bg-gray-50">
                取消
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 活動列表 */}
      <div className="bg-white rounded shadow-sm p-5">
        <h3 className="font-medium text-gray-700 mb-4">活動列表（共 {activities.length} 場）</h3>
        {activities.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">尚無活動</p>
        ) : (
          <div className="space-y-3">
            {activities.map((item) => (
              <div key={item.id} className="flex items-center gap-3 border border-gray-200 rounded p-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-700 text-sm">{item.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {item.start_date} {item.location && `· ${item.location}`} · {item.active ? '✅ 顯示' : '⏸️ 隱藏'}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => handleEdit(item)} className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded hover:bg-blue-100">編輯</button>
                  <button onClick={() => handleDelete(item.id)} className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded hover:bg-red-100">刪除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
