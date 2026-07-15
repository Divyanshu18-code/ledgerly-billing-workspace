import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    const workspaceId = localStorage.getItem('activeWorkspaceId');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (workspaceId && config.headers) {
      config.headers['x-workspace-id'] = workspaceId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Auto logout on 401 if refresh fails or is not available
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // If we are not on login/register pages, redirect to login
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
