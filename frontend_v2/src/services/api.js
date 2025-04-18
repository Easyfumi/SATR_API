import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001',
  withCredentials: true, // Базовый URL вашего бэкенда
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавляем интерцептор для JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;