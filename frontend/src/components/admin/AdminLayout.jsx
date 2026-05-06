import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { to: '/admin', label: '後台首頁', icon: '🏠', exact: true },
  { to: '/admin/carousel', label: '輪播管理', icon: '🖼️' },
  { to: '/admin/news', label: '消息管理', icon: '📰' },
  { to: '/admin/activities', label: '活動管理', icon: '📅' },
  { to: '/admin/registrations', label: '報名記錄', icon: '📋' },
  { to: '/admin/settings', label: '網站設定', icon: '⚙️' },
];

export default function AdminLayout() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (item) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

  const Sidebar = () => (
    <aside className="w-56 bg-temple-dark text-white h-full flex flex-col shrink-0">
      {/* 後台標題 */}
      <div className="p-4 border-b border-white/10">
        <div className="font-serif text-temple-gold font-bold">廟宇後台管理</div>
        <div className="text-xs text-white/50 mt-0.5">管理員：{username}</div>
      </div>

      {/* 選單 */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded text-sm transition-colors ${
              isActive(item)
                ? 'bg-temple-green text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* 底部：登出 + 前台連結 */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <span>🌐</span>
          <span>查看前台</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-white/60 hover:bg-red-600/30 hover:text-white transition-colors"
        >
          <span>🚪</span>
          <span>登出</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* 電腦版側欄 */}
      <div className="hidden md:flex md:flex-col h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* 手機版側欄覆蓋層 */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="flex flex-col h-full">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* 主要內容 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 頂部列 */}
        <header className="bg-white shadow-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button
            className="md:hidden p-1 text-gray-500"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <h1 className="font-medium text-gray-700 text-sm">
            {menuItems.find((m) => isActive(m))?.label || '後台管理'}
          </h1>
        </header>

        {/* 頁面內容 */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
