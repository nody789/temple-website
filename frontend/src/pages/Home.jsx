import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider';
import api from '../api';
import { useSettings } from '../context/SettingsContext';

export default function Home() {
  const settings = useSettings();
  const [news, setNews] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    api.get('/news?limit=4').then((res) => setNews(res.data)).catch(() => {});
    api.get('/activities').then((res) => setActivities(res.data.slice(0, 3))).catch(() => {});
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return String(dateStr).slice(0, 10).replace(/-/g, '/');
  };

  return (
    <main>
      {/* 輪播 */}
      <HeroSlider />

      {/* 裝飾標語 */}
      <div className="bg-temple-green-dark text-white text-center py-4 px-4">
        <p className="font-serif text-lg tracking-widest">
          ❖ {settings.site_subtitle || '神恩浩蕩，庇佑四方'} ❖
        </p>
      </div>

      {/* 本廟簡介 */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="section-title">本廟簡介</h2>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <img
              src="https://picsum.photos/seed/templeabout/600/400"
              alt="廟宇外觀"
              className="w-full rounded-sm shadow-lg border-4 border-temple-gold/30"
            />
          </div>
          <div className="space-y-4">
            <h3 className="font-serif text-2xl text-temple-green-dark">
              {settings.site_name || '玄天上帝廟'}
            </h3>
            <div className="w-16 h-0.5 bg-temple-gold" />
            <p className="text-gray-700 leading-relaxed text-justify">
              {settings.about_text || '載入中...'}
            </p>
            <p className="text-sm text-gray-500">
              🕐 開放時間：{settings.open_hours || '每日上午 06:00 - 晚上 09:00'}
            </p>
            <Link to="/about" className="inline-block btn-primary mt-2">
              了解更多
            </Link>
          </div>
        </div>
      </section>

      {/* 傳統花紋分隔 */}
      <div className="bg-temple-cream-dark py-6">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-4 text-temple-gold">
          <span className="text-2xl">❧</span>
          <span className="text-sm text-temple-green tracking-widest">虔誠禮拜 · 祈求平安 · 傳承文化</span>
          <span className="text-2xl">❧</span>
        </div>
      </div>

      {/* 最新消息 */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="section-title">最新消息</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {news.map((item) => (
            <Link
              key={item.id}
              to={`/news/${item.id}`}
              className="temple-card p-4 flex gap-4 hover:border-temple-gold/60"
            >
              <div className="shrink-0 w-14 text-center bg-temple-green text-white rounded-sm py-1 px-2">
                <div className="text-xs">{formatDate(item.published_at).split('/')[0]}</div>
                <div className="text-lg font-bold leading-tight">
                  {formatDate(item.published_at).split('/')[1]}/{formatDate(item.published_at).split('/')[2]}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-temple-dark truncate">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.content}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link to="/news" className="btn-secondary">
            查看全部消息
          </Link>
        </div>
      </section>

      {/* 活動訊息 */}
      <section className="bg-temple-cream-dark py-14">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="section-title">近期活動</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {activities.map((act) => (
              <div key={act.id} className="temple-card overflow-hidden">
                <img
                  src={act.image_url || `https://picsum.photos/seed/act${act.id}/400/220`}
                  alt={act.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="text-xs text-temple-green font-medium mb-1">
                    {formatDate(act.start_date)}
                    {act.end_date && act.end_date !== act.start_date && ` ~ ${formatDate(act.end_date)}`}
                  </div>
                  <h3 className="font-serif font-bold text-temple-dark">{act.title}</h3>
                  {act.location && (
                    <p className="text-xs text-gray-500 mt-1">📍 {act.location}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/activities" className="btn-primary">
              全部活動
            </Link>
          </div>
        </div>
      </section>

      {/* 報名號召 */}
      <section className="bg-temple-green py-12 text-center text-white">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">參與活動 · 共結善緣</h2>
          <p className="text-white/80 mb-6">歡迎信眾踴躍參加廟宇各項活動，一同祈福平安</p>
          <Link to="/register" className="btn-secondary text-base px-8 py-3">
            立即線上報名
          </Link>
        </div>
      </section>
    </main>
  );
}
