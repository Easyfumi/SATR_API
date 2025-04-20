import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './components/AuthLayout';
import Navbar from './components/Navbar';
import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import HomePage from './pages/HomePage';
import Profile from './user/Profile';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/signin" element={<AuthLayout><SignIn /></AuthLayout>} />
          <Route path="/signup" element={<AuthLayout><SignUp /></AuthLayout>} />
          
          <Route path="/" element={
            <ProtectedRoute>
              
                <Navbar />
              <Sidebar />
              <HomePage />
            
              
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Navbar />
              <Sidebar />
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;