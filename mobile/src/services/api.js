import axios from 'axios';
import { API_BASE_URL } from '../constants/config';
import { getToken, clearAuth } from '../utils/storage';

const api = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await clearAuth();
    }
    return Promise.reject(err);
  }
);

export default api;
