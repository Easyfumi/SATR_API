import axios from 'axios';

// Для Docker используем относительные пути (nginx проксирует /api к backend)
// Для локальной разработки можно использовать REACT_APP_API_URL
const getBaseURL = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  // Если URL не указан или пустой, используем относительный путь (для Docker)
  if (!envUrl || envUrl === '') {
    return '';
  }
  // Если указан полный URL, используем его (для локальной разработки)
  return envUrl;
};

const api = axios.create({
  baseURL: getBaseURL(),
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