import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Footer() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get('/settings').then((res) => setSettings(res.data)).catch(() => {});
  }, []);

  return (
    <footer className="bg-temple-dark text-white">
      {/* 金色分隔線 */}
      <div className="h-1 bg-gradient-to-r from-transparent via-temple-gold to-transparent" />

      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 廟宇名稱 */}
        <div>
          <h3 className="font-serif text-xl font-bold text-temple-gold mb-3">
            {settings.site_name || '玄天上帝廟'}
          </h3>
          <p className="text-white/60 text-sm leading-relaxed">
            {settings.site_subtitle || '神恩浩蕩，庇佑四方'}
          </p>
          <p className="text-white/50 text-xs mt-3">
            創建於 {settings.founding_year || 'XX年'} · 主祀 {settings.main_deity || '玄天上帝'}
          </p>
        </div>

        {/* 快速連結 */}
        <div>
          <h4 className="font-medium text-temple-gold mb-3">快速連結</h4>
          <ul className="space-y-1.5 text-sm text-white/70">
            {[
              { to: '/about', label: '本廟簡介' },
              { to: '/news', label: '最新消息' },
              { to: '/activities', label: '活動訊息' },
              { to: '/register', label: '線上報名' },
              { to: '/contact', label: '聯絡我們' },
            ].map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-temple-gold transition-colors">
                  › {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 聯絡資訊 */}
        <div>
          <h4 className="font-medium text-temple-gold mb-3">聯絡資訊</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex gap-2">
              <span className="text-temple-gold shrink-0">📍</span>
              <span>{settings.address || '地址待設定'}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-temple-gold shrink-0">📞</span>
              <span>{settings.phone || '電話待設定'}</span>
            </li>
            {settings.email && (
              <li className="flex gap-2">
                <span className="text-temple-gold shrink-0">✉️</span>
                <span>{settings.email}</span>
              </li>
            )}
            {settings.open_hours && (
              <li className="flex gap-2">
                <span className="text-temple-gold shrink-0">🕐</span>
                <span>{settings.open_hours}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* 版權列 */}
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} {settings.site_name || '玄天上帝廟'} 版權所有 ·{' '}
        <Link to="/admin/login" className="hover:text-white/60 transition-colors">
          後台管理
        </Link>
      </div>
    </footer>
  );
}
