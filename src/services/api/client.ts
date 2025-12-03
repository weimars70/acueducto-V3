import axios from 'axios';
import { API_URL } from '../../config/environment';
import { useAuthStore } from '../../stores/auth';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Agregar empresaId a todas las peticiones
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.empresaId) {
        // Para peticiones GET, agregar empresaId a los params
        if (config.method === 'get') {
          config.params = {
            ...config.params,
            empresaId: user.empresaId
          };
        }
        // Para peticiones POST, PUT, PATCH, agregar empresaId al body
        else if (['post', 'put', 'patch'].includes(config.method || '')) {
          if (config.data && typeof config.data === 'object') {
            config.data = {
              ...config.data,
              empresaId: user.empresaId
            };
          }
        }
      }
    } catch (e) {
      console.error('Error parsing user data for empresaId:', e);
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || !error.response) {
      error.isConnectionError = true;
      error.message = 'No hay conexión con el servidor';
      throw error;
    }

    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      error.isAuthError = true;
      error.message = 'Sesión expirada. Por favor inicie sesión nuevamente.';
    }

    throw error;
  }
);