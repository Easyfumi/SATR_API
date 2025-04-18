import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { getProfile } from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await getProfile();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true); // Немедленно устанавливаем аутентификацию
    await checkAuth(); // Проверяем профиль в фоне
  }, [checkAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user,
      login,
      logout,
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);