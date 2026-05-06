import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ news: 0, activities: 0, registrations: 0, carousel: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/news/all'),
      api.get('/activities/all'),
      api.get('/registration'),
      api.get('/carousel/all'),
    ]).then(([news, acts, regs, carousel]) => {
      setStats({
        news: news.data.length,
        activities: acts.data.length,
        registrations: regs.data.length,
        carousel: carousel.data.length,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: '輪播張數', value: stats.carousel, to: '/admin/carousel', icon: '🖼️', color: 'bg-blue-500' },
    { label: '消息則數', value: stats.news, to: '/admin/news', icon: '📰', color: 'bg-green-500' },
    { label: '活動場次', value: stats.activities, to: '/admin/activities', icon: '📅', color: 'bg-purple-500' },
    { label: '報名總數', value: stats.registrations, to: '/admin/registrations', icon: '📋', color: 'bg-temple-green' },
  ];

  return (
    <div>
      <h2 className="text-xl font-serif font-bold text-temple-dark mb-6">歡迎使用後台管理系統</h2>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="bg-white rounded shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
          >
            <div className={`${card.color} text-white rounded-full w-10 h-10 flex items-center justify-center text-lg`}>
              {card.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{card.value}</div>
              <div className="text-xs text-gray-500">{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded shadow-sm p-5">
        <h3 className="font-medium text-gray-700 mb-4">快速操作</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { to: '/admin/carousel', label: '管理輪播圖片', desc: '上傳/刪除首頁輪播', icon: '🖼️' },
            { to: '/admin/news', label: '發布最新消息', desc: '新增公告或消息', icon: '✏️' },
            { to: '/admin/activities', label: '新增活動', desc: '建立活動報名資訊', icon: '📅' },
            { to: '/admin/registrations', label: '查看報名', desc: '瀏覽線上報名記錄', icon: '👥' },
            { to: '/admin/settings', label: '網站設定', desc: '修改廟名、電話等', icon: '⚙️' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-start gap-3 p-3 border border-gray-200 rounded hover:border-temple-green/40 hover:bg-green-50/30 transition-colors"
            >
              <span className="text-xl mt-0.5">{item.icon}</span>
              <div>
                <div className="text-sm font-medium text-gray-700">{item.label}</div>
                <div className="text-xs text-gray-400">{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
