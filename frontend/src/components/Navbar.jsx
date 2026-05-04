import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [siteName, setSiteName] = useState('玄天上帝廟');
  const location = useLocation();

  // 讀取網站名稱
  useEffect(() => {
    api.get('/settings').then((res) => {
      if (res.data.site_name) setSiteName(res.data.site_name);
    }).catch(() => {});
  }, []);

  // 滾動時 navbar 加上背景陰影
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { to: '/', label: '首頁' },
    { to: '/about', label: '本廟簡介' },
    { to: '/news', label: '最新消息' },
    { to: '/activities', label: '活動訊息' },
    { to: '/register', label: '線上報名' },
    { to: '/contact', label: '聯絡我們' },
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow duration-300 ${
        scrolled ? 'shadow-lg' : ''
      }`}
    >
      {/* 頂部資訊列 */}
      <div className="bg-temple-red-dark text-white text-sm py-1.5 px-4 text-center">
        虔誠信仰 · 傳承文化 · 守護平安
      </div>

      {/* 主導覽列 */}
      <nav className="bg-temple-red text-white">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          {/* Logo / 廟名 */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-temple-gold rounded-full flex items-center justify-center text-temple-dark font-serif font-bold text-lg">
              廟
            </div>
            <span className="font-serif text-xl font-bold text-white tracking-wide hidden sm:block">
              {siteName}
            </span>
          </Link>

          {/* 電腦版選單 */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`px-3 py-2 text-sm font-medium rounded-sm transition-colors duration-200 ${
                    isActive(link.to)
                      ? 'bg-temple-gold text-temple-dark'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* 手機版漢堡選單按鈕 */}
          <button
            className="md:hidden p-2 rounded text-white hover:bg-white/20"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="開啟選單"
          >
            <div className={`w-5 h-0.5 bg-white mb-1 transition-transform ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-5 h-0.5 bg-white mb-1 transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-white transition-transform ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>

        {/* 手機版下拉選單 */}
        {menuOpen && (
          <div className="md:hidden bg-temple-red-dark px-4 pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block py-2.5 border-b border-white/10 text-sm font-medium ${
                  isActive(link.to) ? 'text-temple-gold-light' : 'text-white'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
