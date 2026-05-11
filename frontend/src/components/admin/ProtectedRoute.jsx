/**
 * 【檔案說明】components/admin/ProtectedRoute.jsx — 路由守衛元件
 *
 * 這個元件實作了「路由保護」機制：
 *   已登入 → 正常顯示被保護的頁面（children）
 *   未登入 → 自動跳轉到後台登入頁（/admin/login）
 *
 * 概念說明（Route Guard / Protected Route）：
 *   某些頁面只有登入的使用者才能看到（例如後台管理介面）。
 *   如果沒有保護機制，任何人只要知道 URL 就能直接訪問後台。
 *   ProtectedRoute 就是在路由層做的「門衛」，攔截未授權的訪問。
 *
 * 使用方式（在 App.jsx 中）：
 *   <Route
 *     path="/admin"
 *     element={
 *       <ProtectedRoute>      ← 保護外殼
 *         <AdminLayout />     ← 實際的後台頁面
 *       </ProtectedRoute>
 *     }
 *   />
 *
 * Props 說明：
 *   @param {ReactNode} children - 要被保護的元件（由父元件傳入）
 */

// Navigate：react-router-dom 的元件，渲染時立即執行路由跳轉
// 不同於 useNavigate（是 hook，在事件處理函式中呼叫）
// Navigate 是宣告式的（declarative），放在 JSX 裡就會跳轉
import { Navigate } from 'react-router-dom';

// useAuth：從 AuthContext 取得登入狀態
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute 元件
 *
 * Props 解構：{ children }
 *   children 是 React 特殊 prop，代表放在標籤之間的子元件
 *   例如：<ProtectedRoute><AdminLayout /></ProtectedRoute>
 *   這裡的 children 就是 <AdminLayout />
 *
 * @param {ReactNode} children - 要顯示的受保護頁面元件
 */
export default function ProtectedRoute({ children }) {

  /**
   * useAuth()：從 AuthContext 取得 isLoggedIn 狀態
   *
   * isLoggedIn 是 boolean：
   *   true  → 已登入（token 有效）
   *   false → 未登入（token 不存在或已過期）
   *
   * 解構賦值：只取出 isLoggedIn，忽略其他欄位（token、username 等）
   */
  const { isLoggedIn } = useAuth();

  /**
   * 三元運算子條件渲染：
   *   isLoggedIn 為 true  → 渲染 children（後台頁面）
   *   isLoggedIn 為 false → 渲染 <Navigate>（觸發跳轉）
   *
   * <Navigate to="/admin/login" replace />：
   *   to="/admin/login" → 跳轉到後台登入頁
   *   replace → 使用「取代」模式（不在瀏覽器歷史記錄中留下被攔截的頁面）
   *             這樣使用者登入後，按「上一頁」不會再回到被攔截的 URL
   *             而是會回到更早的頁面
   *
   * 為什麼用 children 而不是直接 import AdminLayout？
   *   保持 ProtectedRoute 的「通用性」，
   *   以後任何頁面都可以用 <ProtectedRoute> 包起來保護，不限於後台
   */
  return isLoggedIn ? children : <Navigate to="/admin/login" replace />;
}
