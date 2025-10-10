import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './services/ProtectedRoute';
import AuthLayout from './services/AuthLayout';
import Navbar from './navigation/Navbar';
import Sidebar from './navigation/Sidebar';
import AdminSidebar from './navigation/AdminSidebar';
import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import Profile from './pages/users/Profile';
import UsersPage from './pages/users/UsersPage';
import UserDetailPage from './pages/users/UserDetailPage'; 
import TaskListPage from './pages/tasks/TaskListPage';
import CreateTaskPage from './pages/tasks/CreateTaskPage'; 
import DeclarationPage from './pages/declaration/DeclarationPage'; 
import CertificatesPage from './pages/certificates/CertificatesPage'; 
import TaskDetailsPage from './pages/tasks/TaskDetailsPage'; 
import ContractListPage from './pages/contracts/ContractListPage';
import HomePage from './pages/HomePage';


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
          <Route path="/tasks" element={<TaskListPage />} />
          <Route path="/tasks/create" element={<CreateTaskPage />} />
          <Route path="/tasks/:id" element={<TaskDetailsPage />} />
          <Route path="/decl" element={<DeclarationPage />} /> 
          <Route path="/serts" element={<CertificatesPage />} /> 
          <Route path="api/contracts" element={<ContractListPage />} /> 
          </Route>

          {/* Fallback для несуществующих маршрутов */}
          {/*     <Route path="*" element={<Navigate to="/" replace />} />   */}

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;