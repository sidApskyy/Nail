import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    const originalUrl = original?.url || '';
    const isRefreshRequest = originalUrl.includes('/auth/refresh-token');

    if (error?.response?.status === 401 && isRefreshRequest) {
      refreshing = null;
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    if (error?.response?.status === 401 && !original?._retry) {
      original._retry = true;

      try {
        if (!refreshing) {
          refreshing = api.post('/auth/refresh-token');
        }
        const refreshRes = await refreshing;
        refreshing = null;

        const newToken = refreshRes.data?.data?.accessToken;
        if (!newToken) {
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }

        useAuthStore.getState().setAccessToken(newToken);
        return api(original);
      } catch (e) {
        refreshing = null;
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
