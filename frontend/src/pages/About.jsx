import { useEffect, useState } from 'react';
import api from '../api';

function getVideoType(url) {
  if (!url) return null;
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return 'direct';
  return null;
}

function toYouTubeEmbed(url) {
  if (url.includes('youtube.com/embed/')) return url;
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const watchMatch = url.match(/[?&]v=([^?&]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  return url;
}

export default function About() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get('/settings').then((res) => setSettings(res.data)).catch(() => {});
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      {/* 頁面標題 */}
      <div className="text-center mb-12">
        <h1 className="font-serif text-3xl text-temple-green-dark mb-2">本廟簡介</h1>
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-0.5 bg-temple-gold" />
          <span className="text-temple-gold text-xl">❖</span>
          <div className="w-16 h-0.5 bg-temple-gold" />
        </div>
      </div>

      {/* 廟宇照片 */}
      <div className="grid md:grid-cols-2 gap-4 mb-12">
        <img
          src="https://picsum.photos/seed/temple_main/600/400"
          alt="廟宇正面"
          className="w-full h-56 object-cover rounded-sm shadow-md border-2 border-temple-gold/30"
        />
        <img
          src="https://picsum.photos/seed/temple_hall/600/400"
          alt="正殿內部"
          className="w-full h-56 object-cover rounded-sm shadow-md border-2 border-temple-gold/30"
        />
      </div>

      {/* 建廟過程影片（有填網址才顯示） */}
      {getVideoType(settings.intro_video_url) && (
        <section className="temple-card p-6 md:p-8 mb-8">
          <h2 className="font-serif text-xl text-temple-green mb-4 border-b border-temple-gold/30 pb-2">
            建廟過程
          </h2>
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            {getVideoType(settings.intro_video_url) === 'youtube' ? (
              <iframe
                className="absolute inset-0 w-full h-full rounded-sm"
                src={toYouTubeEmbed(settings.intro_video_url)}
                title="建廟過程影片"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                className="absolute inset-0 w-full h-full rounded-sm"
                src={settings.intro_video_url}
                controls
                preload="metadata"
              />
            )}
          </div>
        </section>
      )}

      {/* 簡介文字 */}
      <section className="temple-card p-6 md:p-8 mb-8">
        <h2 className="font-serif text-xl text-temple-green mb-4 border-b border-temple-gold/30 pb-2">
          廟宇歷史
        </h2>
        <p className="text-gray-700 leading-relaxed text-justify whitespace-pre-line">
          {settings.about_text || '載入中...'}
        </p>
      </section>

      {/* 基本資訊 */}
      <section className="temple-card p-6 md:p-8 mb-8">
        <h2 className="font-serif text-xl text-temple-green mb-4 border-b border-temple-gold/30 pb-2">
          基本資訊
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: '廟名', value: settings.site_name },
            { label: '主祀神明', value: settings.main_deity },
            { label: '創建年份', value: settings.founding_year },
            { label: '開放時間', value: settings.open_hours },
            { label: '地址', value: settings.address },
            { label: '電話', value: settings.phone },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-2">
              <dt className="shrink-0 text-sm font-medium text-temple-green-dark w-20">{label}</dt>
              <dd className="text-sm text-gray-700">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 入廟須知 */}
      <section className="temple-card p-6 md:p-8">
        <h2 className="font-serif text-xl text-temple-green mb-4 border-b border-temple-gold/30 pb-2">
          入廟須知
        </h2>
        <ul className="space-y-2 text-sm text-gray-700">
          {[
            '請著整齊服裝，勿穿著暴露或破損衣物入廟',
            '廟內請保持安靜，勿高聲喧嘩嬉戲',
            '禁止在廟內飲食（供品除外）',
            '請勿隨意觸碰神像及祭祀器具',
            '拍照前請先徵得廟方人員同意',
            '廟內嚴禁吸菸及飲酒',
            '寵物請繫牽繩並注意清潔，避免進入主殿',
            '請依禮俗順序禮拜，勿搶先或插隊',
            '如需問事或點光明燈，請向服務人員詢問',
            '廟內嚴禁賭博及一切不法行為',
          ].map((item, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="shrink-0 text-temple-gold">◆</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
