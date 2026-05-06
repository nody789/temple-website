import { useEffect, useState } from 'react';
import api from '../api';

export default function Contact() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get('/settings').then((res) => setSettings(res.data)).catch(() => {});
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl text-temple-green-dark mb-2">聯絡我們</h1>
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-0.5 bg-temple-gold" />
          <span className="text-temple-gold text-xl">❖</span>
          <div className="w-16 h-0.5 bg-temple-gold" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 聯絡資訊 */}
        <div className="space-y-4">
          <div className="temple-card p-6">
            <h2 className="font-serif text-lg text-temple-green mb-4 border-b border-temple-gold/30 pb-2">
              基本資訊
            </h2>
            <ul className="space-y-4">
              {[
                { icon: '🏛️', label: '廟名', value: settings.site_name },
                { icon: '📍', label: '地址', value: settings.address },
                { icon: '📞', label: '電話', value: settings.phone },
                { icon: '✉️', label: 'Email', value: settings.email },
                { icon: '🕐', label: '開放時間', value: settings.open_hours },
              ].map(({ icon, label, value }) => value && (
                <li key={label} className="flex gap-3">
                  <span className="text-lg shrink-0 mt-0.5">{icon}</span>
                  <div>
                    <span className="text-xs text-temple-green-dark font-medium block">{label}</span>
                    <span className="text-sm text-gray-700">{value}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="temple-card p-6">
            <h2 className="font-serif text-lg text-temple-green mb-4 border-b border-temple-gold/30 pb-2">
              交通指引
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <p className="font-medium text-temple-dark mb-1">🚌 公車</p>
                <p className="text-gray-600">搭乘往 XX 方向公車，於 XX 站下車步行約 X 分鐘</p>
              </div>
              <div>
                <p className="font-medium text-temple-dark mb-1">🚗 開車</p>
                <p className="text-gray-600">導航至廟宇地址即可，廟旁設有停車場</p>
              </div>
              <div>
                <p className="font-medium text-temple-dark mb-1">🚇 捷運</p>
                <p className="text-gray-600">搭乘至 XX 站後，轉乘公車或計程車前往</p>
              </div>
            </div>
          </div>
        </div>

        {/* 地圖（示意） */}
        <div>
          <div className="temple-card overflow-hidden h-full min-h-64">
            {/* 實際使用可替換成 Google Maps iframe */}
            <div className="bg-gray-100 h-64 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="text-sm">Google 地圖</p>
                <p className="text-xs mt-1">{settings.address || '地址待設定'}</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600">
                如需導航，請以「{settings.site_name || '玄天上帝廟'}」搜尋 Google Maps
              </p>
              <a
                href={`https://maps.google.com/maps?q=${encodeURIComponent(settings.address || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-temple-green hover:underline"
              >
                在 Google Maps 中開啟 ›
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
