import axios from 'axios';

// 建立 axios 實例，所有 API 請求的基礎設定
const api = axios.create({
  baseURL: '/api',  // 會透過 vite.config.js 的 proxy 轉發到後端
  timeout: 10000,
});

// 請求攔截器：每次請求自動附上登入 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // token 存在瀏覽器的 localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 回應攔截器：如果 token 過期（401），自動登出
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      // 如果不在登入頁，跳轉到登入頁
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
