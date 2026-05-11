import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import SEOHead from '../components/SEOHead';

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get('/news').then((res) => setNews(res.data)).finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <SEOHead title="最新消息" />
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl text-temple-green-dark mb-2">最新消息</h1>
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-0.5 bg-temple-gold" />
          <span className="text-temple-gold text-xl">❖</span>
          <div className="w-16 h-0.5 bg-temple-gold" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">載入中...</div>
      ) : news.length === 0 ? (
        <div className="text-center py-20 text-gray-400">目前尚無消息</div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <Link
              key={item.id}
              to={`/news/${item.id}`}
              className="temple-card p-5 flex gap-4 items-start hover:border-temple-gold/60 block"
            >
              <div className="shrink-0 w-16 text-center bg-temple-green text-white rounded-sm py-1.5">
                <div className="text-xs leading-tight">{String(item.published_at).slice(0, 4)}</div>
                <div className="text-lg font-bold leading-tight">
                  {String(item.published_at).slice(5, 7)}/{String(item.published_at).slice(8, 10)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-medium text-temple-dark text-base">{item.title}</h2>
                <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{item.content}</p>
                <span className="text-xs text-temple-green mt-2 inline-block">閱讀全文 ›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
