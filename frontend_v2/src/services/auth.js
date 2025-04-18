import api from './api';

export const signUp = async (userData) => {
  return api.post('/auth/signup', userData);
};

export const signIn = async (credentials) => {
  return api.post('/auth/signin', credentials);
};

export const getProfile = async () => {
  return api.get('/api/users/profile');
};