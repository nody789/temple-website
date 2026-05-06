import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.username);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || '登入失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-temple-green flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo 區 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-temple-gold rounded-full mx-auto flex items-center justify-center text-2xl font-serif font-bold text-temple-dark mb-3">
            廟
          </div>
          <h1 className="font-serif text-2xl text-white font-bold">後台管理系統</h1>
          <p className="text-white/60 text-sm mt-1">請輸入管理員帳號密碼</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-sm shadow-xl p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded p-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">帳號</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-temple-green"
              placeholder="請輸入帳號"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密碼</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-temple-green"
              placeholder="請輸入密碼"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-temple-green text-white py-2.5 rounded text-sm font-medium hover:bg-temple-green-dark transition-colors disabled:opacity-60"
          >
            {loading ? '登入中...' : '登入'}
          </button>

          <p className="text-xs text-gray-400 text-center">預設帳號：admin / admin123</p>
        </form>
      </div>
    </div>
  );
}
