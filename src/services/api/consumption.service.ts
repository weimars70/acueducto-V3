import { apiClient } from './client';
import { storageService } from '../database/storage.service';
import { syncService } from '../sync/sync.service';
import type { Consumption } from '../../types/consumption';
import type { PaginatedResponse } from '../../types/api';

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
      const queryParams: Record<string, any> = {};

      if (page !== undefined) queryParams.page = page;
      if (limit !== undefined) queryParams.limit = limit;

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams[key] = value;
        }
      });
      console.log('📋 Antes de hacer GET /consumo/view con queryParams:', queryParams);

      const { data } = await apiClient.get<PaginatedResponse<Consumption>>('/consumo/view', {
        params: queryParams
      });

      console.log('✅ Respuesta exitosa de /consumo/view:', data);
      return data;
    } catch (error: any) {
      console.error('🚀 Error al obtener consumos:', {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        isConnectionError: error?.isConnectionError,
        isAuthError: error?.isAuthError
      });
      if (error.isConnectionError) {
        return {
          data: await storageService.getConsumptions(params),
          total: 0,
          page: params.page || 1,
          limit: params.limit || 10
        };
      }
      throw error;
    }
  },

  async getById(id: number): Promise<Consumption> {
    try {
      const { data } = await apiClient.get<Consumption>(`/consumo/${id}`);
      const normalizedData = {
        ...data,
        lectura_anterior: data.lectura_anterior ?? 0,
        promedio: data.promedio ?? 0
      };

      return normalizedData;
    } catch (error: any) {
      if (error?.isConnectionError) {
        const localData = await storageService.getConsumptionById(id);
        if (localData) {
          return localData;
        }
      }
      throw error;
    }
  },
  async create(consumption: Partial<Consumption>): Promise<any> {
    try {
      if (!syncService.isOnline()) {
        await storageService.saveOfflineConsumption(consumption);
        return consumption as Consumption;
      }

      const { data } = await apiClient.post<Consumption>('/consumo', consumption);
      return data;
    } catch (error: any) {
      if (error?.isConnectionError) {
        await storageService.saveOfflineConsumption(consumption);
        return consumption as Consumption;
      }
      let serverMessage = '';
      const payload = error?.response?.data;
      if (payload) {
        if (typeof payload === 'string') {
          serverMessage = payload;
        } else if (Array.isArray(payload?.message)) {
          serverMessage = payload.message.join(' ');
        } else {
          serverMessage = payload?.message || payload?.error || '';
        }
      }
      if (!serverMessage) {
        serverMessage = (error?.message || '').toString();
      }
      if (serverMessage.includes('Ya existe un consumo')) {
        return 'Error consumo ya existe';
      }
      throw error;
    }
  },

  async update(id: number, consumption: Partial<Consumption>): Promise<Consumption> {
    try {
      if (!syncService.isOnline()) {
        throw new Error('No se puede actualizar sin conexión');
      }
      const { data } = await apiClient.put<Consumption>(`/consumo/${id}`, {

        instalacion: parseInt((consumption.instalacion || 0).toString()),
        lectura: parseFloat((consumption.lectura || 0).toString()),
        fecha: consumption.fecha,
        consumo: parseFloat((consumption.consumo || 0).toString()),
        mes: consumption.mes,
        year: parseInt((consumption.year || 0).toString()),
        medidor: consumption.medidor,
        otros_cobros: parseFloat((consumption.otros_cobros || 0).toString()),
        reconexion: parseFloat((consumption.reconexion || 0).toString()),
        usuario: (consumption as any).usuario,
        latitud: consumption.latitud as number,
        longitud: consumption.longitud as number
      });

      return data;

    } catch (error: any) {
      throw error;
    }
  },

  async getImage(id: number): Promise<string> {
    try {
      if (!id || isNaN(id)) {
        throw new Error('ID de consumo inválido para obtener imagen');
      }
      const response = await apiClient.get(`/consumo/${id}/image`, {
        responseType: 'blob'
      });
      return URL.createObjectURL(response.data);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return ''; // No image found is okay
      }
      throw error;
    }
  }
};
