import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get('/activities').then((res) => setActivities(res.data)).finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '日期待定';
    const d = new Date(dateStr);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl text-temple-red-dark mb-2">活動訊息</h1>
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-0.5 bg-temple-gold" />
          <span className="text-temple-gold text-xl">❖</span>
          <div className="w-16 h-0.5 bg-temple-gold" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">載入中...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-20 text-gray-400">目前尚無活動</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {activities.map((act) => (
            <div key={act.id} className="temple-card overflow-hidden">
              <img
                src={act.image_url || `https://picsum.photos/seed/act${act.id}/500/250`}
                alt={act.title}
                className="w-full h-44 object-cover"
              />
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-temple-red font-medium mb-2">
                  <span>📅</span>
                  <span>
                    {formatDate(act.start_date)}
                    {act.end_date && act.end_date !== act.start_date && ` ~ ${formatDate(act.end_date)}`}
                  </span>
                </div>
                <h2 className="font-serif text-lg font-bold text-temple-dark mb-2">{act.title}</h2>
                {act.location && (
                  <p className="text-xs text-gray-500 mb-2">📍 {act.location}</p>
                )}
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{act.description}</p>
                <Link
                  to="/register"
                  className="mt-4 inline-block text-sm text-temple-red font-medium hover:underline"
                >
                  立即報名 ›
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
