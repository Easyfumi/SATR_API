import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
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

// Добавляем интерцептор для обработки ошибок доступа
api.interceptors.response.use(
  response => response,
  error => {
    // Обрабатываем ошибку 403 (Forbidden - нет доступа)
    if (error.response && error.response.status === 403) {
      // Добавляем флаг в ошибку для удобной обработки на фронтенде
      error.isAccessDenied = true;
      error.accessDeniedMessage = error.response.data?.message || 'У вас нет прав для выполнения этого действия';
    }
    return Promise.reject(error);
  }
);

export default api;