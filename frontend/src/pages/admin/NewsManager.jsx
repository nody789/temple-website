import { useEffect, useState } from 'react';
import api from '../../api';
import AdminToast from '../../components/admin/AdminToast';

const emptyForm = { title: '', content: '', image_url: '', published_at: new Date().toISOString().split('T')[0], active: true };

export default function NewsManager() {
  const [news, setNews] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => api.get('/news/all').then((r) => setNews(r.data));
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
        await api.put(`/news/${editId}`, form);
        showMsg('更新成功');
      } else {
        await api.post('/news', form);
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
      content: item.content,
      image_url: item.image_url || '',
      published_at: item.published_at || '',
      active: !!item.active,
    });
    setEditId(item.id);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!confirm('確定要刪除此消息？')) return;
    await api.delete(`/news/${id}`);
    showMsg('刪除成功');
    load();
  };

  const inputClass = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-temple-green';

  return (
    <div className="space-y-6">
      <AdminToast msg={msg} />

      {/* 表單 */}
      <div className="bg-white rounded shadow-sm p-5">
        <h3 className="font-medium text-gray-700 mb-4">{editId ? '編輯消息' : '新增消息'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">標題 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              placeholder="消息標題"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">發布日期</label>
            <input
              type="date"
              value={form.published_at}
              onChange={(e) => setForm({ ...form, published_at: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">內容 *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className={`${inputClass} resize-y`}
              rows={6}
              placeholder="消息內容..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">圖片（選填）</label>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className={`${inputClass} flex-1`}
                placeholder="圖片網址"
              />
              <label className="shrink-0 cursor-pointer bg-gray-100 border border-gray-300 text-xs px-3 py-2 rounded hover:bg-gray-200">
                {uploading ? '上傳中...' : '📁 上傳'}
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="news-active"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            <label htmlFor="news-active" className="text-sm text-gray-700">在前台顯示</label>
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="bg-temple-green text-white px-5 py-2 text-sm rounded hover:bg-temple-green-dark disabled:opacity-60">
              {saving ? '儲存中...' : editId ? '儲存修改' : '新增消息'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setForm(emptyForm); setEditId(null); }} className="border border-gray-300 px-5 py-2 text-sm rounded hover:bg-gray-50">
                取消
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 消息列表 */}
      <div className="bg-white rounded shadow-sm p-5">
        <h3 className="font-medium text-gray-700 mb-4">消息列表（共 {news.length} 則）</h3>
        {news.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">尚無消息</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-500">
                  <th className="text-left py-2 pr-4">標題</th>
                  <th className="text-left py-2 pr-4 hidden sm:table-cell">日期</th>
                  <th className="text-left py-2 pr-4 hidden sm:table-cell">狀態</th>
                  <th className="text-right py-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {news.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5 pr-4">
                      <div className="font-medium text-gray-700 truncate max-w-xs">{item.title}</div>
                      <div className="text-xs text-gray-400 truncate">{item.content.substring(0, 50)}...</div>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-500 hidden sm:table-cell">{item.published_at}</td>
                    <td className="py-2.5 pr-4 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${item.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {item.active ? '顯示中' : '已隱藏'}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex gap-1.5 justify-end">
                        <button onClick={() => handleEdit(item)} className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded hover:bg-blue-100">
                          編輯
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded hover:bg-red-100">
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
