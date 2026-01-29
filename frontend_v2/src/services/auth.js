import axios from 'axios';

// Auth endpoints are mounted at /auth (without /api)
const authApi = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

export const signUp = async (userData) => {
  return authApi.post('/auth/signup', userData);
};

export const signIn = async (credentials) => {
  return authApi.post('/auth/signin', credentials);
};

