import api from './api';

export const signUp = async (userData) => {
  try {
    return await api.post('/auth/signup', userData);
  } catch (error) {
    if (error.response?.status === 409) {
      error.response.data = { 
        message: error.response.data?.message || 'Email is already registered'
      };
    }
    throw error;
  }
};

export const signIn = async (credentials) => {
  try {
    return await api.post('/auth/signin', credentials);
  } catch (error) {
    // Добавляем обработку 401 ошибки
    if (error.response?.status === 401) {
      error.response.data = { message: 'Invalid email or password' };
    }
    throw error;
  }
};

export const getProfile = async () => {
  return api.get('/api/users/profile');
};