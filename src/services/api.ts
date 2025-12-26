import axios from 'axios';
import { Notify } from 'quasar';
import type { Consumption } from '../types/consumption';
import type { PaginatedResponse } from '../types/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// 🔐 INTERCEPTOR: Agregar token JWT a todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  console.log('🔑 [api.ts] Interceptor Request:', {
    url: config.url,
    method: config.method,
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'NO TOKEN'
  });

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ [api.ts] Header Authorization agregado');
  } else {
    console.warn('❌ [api.ts] NO hay token en localStorage');
  }

  return config;
});

// 🚨 INTERCEPTOR: Manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ [api.ts] Error Response:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error?.message
    });

    // 🔒 Manejar error 401 (token expirado o inválido)
    if (error.response?.status === 401) {
      const errorInfo = error?.response?.data?.message || 'jwt expired';
      console.error('🔒 [api.ts] Token expirado o inválido:', errorInfo);
      console.error('🔄 Limpiando sesión y redirigiendo al login...');

      // Mostrar notificación al usuario
      Notify.create({
        type: 'warning',
        message: 'Tu sesión ha expirado',
        caption: 'Por favor, inicia sesión nuevamente',
        position: 'top',
        timeout: 3000,
        actions: [{ label: 'Cerrar', color: 'white' }]
      });

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirigir al login después de un breve delay para que se vea la notificación
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }

    throw error;
  }
);

export const consumptionService = {

  async getConsumptions(params: {
    year?: number | null;
    mes_codigo?: number | null;
    nombre?: string;
    instalacion?: number | null;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Consumption>> {
    try {
      const { page, limit, ...filters } = params;

      const queryParams = new URLSearchParams();

      if (page !== undefined) {
        queryParams.append('page', page.toString());
      }

      if (limit !== undefined) {
        queryParams.append('limit', limit.toString());
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const { data } = await api.get<PaginatedResponse<Consumption>>('/consumo/view', {
        params: queryParams
      });

      return data;
    } catch (error) {
      // Safely log error without Symbol properties
      console.log('error   XXXXX', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in getConsumptions:', errorMessage);
      throw error;
    }
  },

  async getImage(id: number): Promise<string> {
    const response = await api.get(`/consumo/${id}/image`, {
      responseType: 'blob'
    });
    return URL.createObjectURL(response.data);
  }
};

export { api };