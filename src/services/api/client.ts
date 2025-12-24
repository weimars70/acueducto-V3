import axios from 'axios';
import { API_URL } from '../../config/environment';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  // 🔍 DEBUG: Verificar si el token existe
  console.log('🔑 Interceptor Request:', {
    url: config.url,
    method: config.method,
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'NO TOKEN'
  });

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Header Authorization agregado');
  } else {
    console.warn('❌ NO hay token en localStorage - request sin autenticar');
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

    // 🔒 Manejar error 401 (token expirado o inválido)
    if (error.response?.status === 401) {
      console.error('🔒 [client.ts] Token expirado o inválido (401) - cerrando sesión manualmente');

      // Limpiar sesión manualmente para evitar dependencias circulares con authStore
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirigir al login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      error.isAuthError = true;
      error.message = 'Sesión expirada. Por favor inicie sesión nuevamente.';
    }

    throw error;
  }
);