import { useEffect, useState } from 'react';
import api from '../../api';

const STATUS_MAP = {
  pending: { label: '待確認', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: '已確認', color: 'bg-green-100 text-green-700' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-500' },
};

export default function RegistrationList() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');

  const load = () => {
    api.get('/registration').then((r) => setRecords(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    await api.put(`/registration/${id}/status`, { status });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('確定刪除此報名記錄？')) return;
    await api.delete(`/registration/${id}`);
    load();
  };

  // 從現有資料中取出不重複的活動列表
  const activityOptions = [
    ...new Map(
      records
        .filter((r) => r.activity_id)
        .map((r) => [r.activity_id, { id: r.activity_id, title: r.activity_title }])
    ).values(),
  ];

  const filtered = records.filter((r) => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchActivity = activityFilter === 'all'
      ? true
      : activityFilter === 'none'
        ? !r.activity_id
        : String(r.activity_id) === activityFilter;
    return matchStatus && matchActivity;
  });

  return (
    <div className="space-y-4">
      {/* 篩選列 */}
      <div className="bg-white rounded shadow-sm p-4 space-y-3">
        {/* 活動分類篩選 */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-600 font-medium shrink-0">篩選活動：</span>
          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="text-xs border border-gray-300 rounded px-3 py-1.5 text-gray-700 focus:outline-none focus:border-temple-green"
          >
            <option value="all">全部活動（{records.length}）</option>
            {activityOptions.map((act) => (
              <option key={act.id} value={String(act.id)}>
                {act.title}（{records.filter((r) => r.activity_id === act.id).length}）
              </option>
            ))}
            {records.some((r) => !r.activity_id) && (
              <option value="none">未指定活動（{records.filter((r) => !r.activity_id).length}）</option>
            )}
          </select>
        </div>

        {/* 狀態篩選 */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-600 font-medium shrink-0">篩選狀態：</span>
          {['all', 'pending', 'confirmed', 'cancelled'].map((s) => {
            const count = s === 'all'
              ? records.filter((r) => activityFilter === 'all' || (activityFilter === 'none' ? !r.activity_id : String(r.activity_id) === activityFilter)).length
              : records.filter((r) => {
                  const matchActivity = activityFilter === 'all' ? true : activityFilter === 'none' ? !r.activity_id : String(r.activity_id) === activityFilter;
                  return r.status === s && matchActivity;
                }).length;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                  statusFilter === s
                    ? 'bg-temple-green text-white border-temple-green'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s === 'all' ? `全部（${count}）` : `${STATUS_MAP[s].label}（${count}）`}
              </button>
            );
          })}
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded shadow-sm p-5">
        <h3 className="font-medium text-gray-700 mb-4">
          報名記錄（顯示 {filtered.length} / 共 {records.length} 筆）
        </h3>

        {loading ? (
          <div className="text-center py-10 text-gray-400">載入中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400">無符合記錄</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-500">
                  <th className="text-left py-2 pr-3">姓名</th>
                  <th className="text-left py-2 pr-3">電話</th>
                  <th className="text-left py-2 pr-3 hidden md:table-cell">報名活動</th>
                  <th className="text-left py-2 pr-3 hidden lg:table-cell">人數</th>
                  <th className="text-left py-2 pr-3 hidden lg:table-cell">報名時間</th>
                  <th className="text-left py-2 pr-3">狀態</th>
                  <th className="text-right py-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rec) => (
                  <tr key={rec.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5 pr-3 font-medium text-gray-700">{rec.name}</td>
                    <td className="py-2.5 pr-3 text-gray-600">{rec.phone}</td>
                    <td className="py-2.5 pr-3 text-gray-600 hidden md:table-cell">
                      {rec.activity_title || '—'}
                    </td>
                    <td className="py-2.5 pr-3 text-gray-600 hidden lg:table-cell">{rec.participants}</td>
                    <td className="py-2.5 pr-3 text-gray-400 text-xs hidden lg:table-cell">
                      {new Date(rec.created_at).toLocaleDateString('zh-TW')}
                    </td>
                    <td className="py-2.5 pr-3">
                      <select
                        value={rec.status}
                        onChange={(e) => handleStatus(rec.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_MAP[rec.status]?.color}`}
                      >
                        <option value="pending">待確認</option>
                        <option value="confirmed">已確認</option>
                        <option value="cancelled">已取消</option>
                      </select>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleDelete(rec.id)}
                        className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded hover:bg-red-100"
                      >
                        刪除
                      </button>
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
