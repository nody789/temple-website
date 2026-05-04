import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// 如果沒有登入，自動跳轉到登入頁
export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/admin/login" replace />;
}
