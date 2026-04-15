import axios from 'axios';

const DEFAULT_API_URL = 'https://trackacademia-backend.onrender.com/api';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || DEFAULT_API_URL });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
