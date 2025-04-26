import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './components/AuthLayout';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AdminSidebar from './components/AdminSidebar';
import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import HomePage from './pages/HomePage';
import Profile from './user/Profile';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage'; 

// Основной лейаут для авторизованных пользователей
const MainLayout = () => {
  const { user } = useAuth(); // Получаем пользователя из контекста

  return (
    <>
      <Navbar />
      <Sidebar />
      {user?.roles?.includes('DIRECTOR') && <AdminSidebar />}
      <Outlet /> {/* Место для отображения дочерних компонентов */}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/signin" element={<AuthLayout><SignIn /></AuthLayout>} />
          <Route path="/signup" element={<AuthLayout><SignUp /></AuthLayout>} />

          {/* Защищенные маршруты */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<HomePage />} />
            <Route path="/users/profile" element={<Profile />} />
            <Route path="/users/all" element={<UsersPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />
          </Route>

          {/* Fallback для несуществующих маршрутов */}
          {/*     <Route path="*" element={<Navigate to="/" replace />} />   */}

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;