import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // Добавляем useAuth
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute'; // Добавляем импорт
import AuthLayout from './components/AuthLayout';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AdminSidebar from './components/AdminSidebar'; // Добавляем импорт
import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import HomePage from './pages/HomePage';
import Profile from './user/Profile';
import UsersPage from './pages/UsersPage'; // Добавляем импорт

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
            <Route path="/profile" element={<Profile />} />

            {/* Админские маршруты */}
            <Route element={<AdminRoute />}>
              <Route path="/users" element={<UsersPage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;