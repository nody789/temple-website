import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

export default function NewsDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get(`/news/${id}`)
      .then((res) => setItem(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-32 text-gray-400">載入中...</div>;
  if (error) return <div className="text-center py-32 text-gray-400">找不到此消息</div>;

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link to="/news" className="text-sm text-temple-red hover:underline mb-6 inline-block">
        ‹ 返回消息列表
      </Link>

      <article className="temple-card p-6 md:p-8">
        <div className="text-xs text-temple-red mb-2">
          {new Date(item.published_at).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <h1 className="font-serif text-2xl text-temple-dark mb-4 border-b border-temple-gold/30 pb-4">
          {item.title}
        </h1>
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full max-h-80 object-cover rounded-sm mb-6 border border-temple-gold/20"
          />
        )}
        <div className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">
          {item.content}
        </div>
      </article>
    </main>
  );
}
