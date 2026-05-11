import { useEffect, useState } from 'react';
import api from '../../api';
import AdminToast from '../../components/admin/AdminToast';

const emptyForm = { title: '', description: '', image_url: '', sort_order: 0, active: true };

export default function CarouselManager() {
  const [slides, setSlides] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => api.get('/carousel/all').then((r) => setSlides(r.data));
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
      showMsg('圖片上傳成功');
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
        await api.put(`/carousel/${editId}`, form);
        showMsg('更新成功');
      } else {
        await api.post('/carousel', form);
        showMsg('新增成功');
      }
      setForm(emptyForm);
      setEditId(null);
      load();
    } catch {
      showMsg('操作失敗', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (slide) => {
    setForm({ title: slide.title, description: slide.description, image_url: slide.image_url, sort_order: slide.sort_order, active: !!slide.active });
    setEditId(slide.id);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!confirm('確定要刪除這張輪播嗎？')) return;
    await api.delete(`/carousel/${id}`);
    showMsg('刪除成功');
    load();
  };

  const inputClass = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-temple-green';

  return (
    <div className="space-y-6">
      <AdminToast msg={msg} />

      {/* 新增/編輯表單 */}
      <div className="bg-white rounded shadow-sm p-5">
        <h3 className="font-medium text-gray-700 mb-4">{editId ? '編輯輪播' : '新增輪播'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">標題</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
                placeholder="輪播標題（選填）"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">排序（數字越小越前面）</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">說明文字（選填）</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
              placeholder="顯示在圖片下方的說明"
            />
          </div>

          {/* 圖片上傳區 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">圖片 *</label>
            <div className="flex gap-2 items-start flex-wrap">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className={inputClass}
                  placeholder="圖片網址，或使用下方上傳"
                  required
                />
              </div>
              <label className="shrink-0 cursor-pointer bg-gray-100 border border-gray-300 text-gray-700 text-xs px-3 py-2 rounded hover:bg-gray-200">
                {uploading ? '上傳中...' : '📁 上傳圖片'}
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            </div>
            {form.image_url && (
              <img src={form.image_url} alt="預覽" className="mt-2 h-32 object-cover rounded border border-gray-200" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            <label htmlFor="active" className="text-sm text-gray-700">啟用此輪播</label>
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="bg-temple-green text-white px-5 py-2 text-sm rounded hover:bg-temple-green-dark disabled:opacity-60">
              {saving ? '儲存中...' : editId ? '儲存修改' : '新增輪播'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setForm(emptyForm); setEditId(null); }} className="border border-gray-300 px-5 py-2 text-sm rounded hover:bg-gray-50">
                取消
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 輪播列表 */}
      <div className="bg-white rounded shadow-sm p-5">
        <h3 className="font-medium text-gray-700 mb-4">輪播列表（共 {slides.length} 張）</h3>
        {slides.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">尚無輪播，請新增</p>
        ) : (
          <div className="space-y-3">
            {slides.map((slide) => (
              <div key={slide.id} className="flex items-center gap-3 border border-gray-200 rounded p-3">
                <img
                  src={slide.image_url}
                  alt={slide.title}
                  className="w-20 h-12 object-cover rounded shrink-0"
                  onError={(e) => { e.target.src = 'https://placehold.co/80x48?text=圖片'; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-700 truncate">{slide.title || '（無標題）'}</div>
                  <div className="text-xs text-gray-400">排序：{slide.sort_order} · {slide.active ? '✅ 啟用' : '⏸️ 停用'}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleEdit(slide)} className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded hover:bg-blue-100">
                    編輯
                  </button>
                  <button onClick={() => handleDelete(slide.id)} className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded hover:bg-red-100">
                    刪除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
