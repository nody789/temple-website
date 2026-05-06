import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Activities from './pages/Activities';
import Register from './pages/Register';
import Contact from './pages/Contact';
import Environment from './pages/Environment';
import AdminLogin from './pages/admin/Login';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import CarouselManager from './pages/admin/CarouselManager';
import NewsManager from './pages/admin/NewsManager';
import ActivitiesManager from './pages/admin/ActivitiesManager';
import RegistrationList from './pages/admin/RegistrationList';
import SiteSettings from './pages/admin/SiteSettings';
import ProtectedRoute from './components/admin/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 前台頁面：有 Navbar 和 Footer */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          }
        />
        <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
        <Route path="/news" element={<><Navbar /><News /><Footer /></>} />
        <Route path="/news/:id" element={<><Navbar /><NewsDetail /><Footer /></>} />
        <Route path="/activities" element={<><Navbar /><Activities /><Footer /></>} />
        <Route path="/environment" element={<><Navbar /><Environment /><Footer /></>} />
        <Route path="/register" element={<><Navbar /><Register /><Footer /></>} />
        <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />

        {/* 後台：登入頁 */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* 後台：受保護的頁面（未登入會跳轉到登入頁）*/}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="carousel" element={<CarouselManager />} />
          <Route path="news" element={<NewsManager />} />
          <Route path="activities" element={<ActivitiesManager />} />
          <Route path="registrations" element={<RegistrationList />} />
          <Route path="settings" element={<SiteSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
