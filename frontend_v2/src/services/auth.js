import api from './api';

export const signUp = async (userData) => {
  return api.post('/auth/signup', userData);
};

export const signIn = async (credentials) => {
  return api.post('/auth/signin', credentials);
};

export const getProfile = async () => {
  return api.get('/users/profile');
};

export const getAllUsers = async () => {
  return api.get('/users/all');
};

export const getUserById = async (id) => {
  return api.get(`/users/${id}`); 
};