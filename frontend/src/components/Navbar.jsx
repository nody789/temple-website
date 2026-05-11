import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const settings = useSettings();
  const siteName = settings.site_name || '南天母中壇元帥道場';
  const location = useLocation();

  // 滾動時 navbar 加上背景陰影
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { to: '/', label: '首頁' },
    { to: '/about', label: '本廟簡介' },
    { to: '/environment', label: '環境介紹' },
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
      <div className="bg-temple-green-dark text-white text-sm py-1.5 px-4 text-center tracking-widest">
        虔誠信仰 · 傳承文化 · 守護平安
      </div>

      {/* 主導覽列 - 白底仿紙質風格 */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          {/* Logo / 廟名 */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-temple-gold rounded-full flex items-center justify-center text-white font-serif font-bold text-lg">
              廟
            </div>
            <span className="font-serif text-xl font-bold text-temple-green-dark tracking-wide hidden sm:block">
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
                      ? 'text-temple-gold border-b-2 border-temple-gold'
                      : 'text-temple-green hover:text-temple-gold'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* 手機版漢堡選單按鈕 */}
          <button
            className="md:hidden p-2 rounded text-temple-green hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="開啟選單"
          >
            <div className={`w-5 h-0.5 bg-temple-green mb-1 transition-transform ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-5 h-0.5 bg-temple-green mb-1 transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-temple-green transition-transform ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>

        {/* 手機版下拉選單 */}
        {menuOpen && (
          <div className="md:hidden bg-temple-cream px-4 pb-4 border-t border-gray-200">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block py-2.5 border-b border-gray-200 text-sm font-medium ${
                  isActive(link.to) ? 'text-temple-gold' : 'text-temple-green'
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
