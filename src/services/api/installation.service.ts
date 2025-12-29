import { apiClient } from './client';
import { storageService } from '../database/storage.service';
import { syncService } from '../sync/sync.service';
import type { Installation } from '../../types/installation';

export const installationService = {
  async getByCode(code: number): Promise<Installation> {
    console.log('🌐 installationService.getByCode - Iniciando');
    console.log('📊 Parámetro code:', code, 'tipo:', typeof code);

    try {
      if (syncService.isOnline()) {
        console.log('✅ Conexión en línea detectada');
        try {
          // Asegurarse de que el código sea un número
          const numericCode = Number(code);
          console.log('🔢 Código numérico:', numericCode);

          if (isNaN(numericCode)) {
            console.error('❌ Código no es un número válido');
            throw new Error('El código debe ser un número válido');
          }

          console.log('🔄 Haciendo petición GET a /instalaciones con params:', { codigo: numericCode });
          const { data } = await apiClient.get<Installation>(`/instalaciones`, {
            params: { codigo: numericCode }
          });

          console.log('📦 Respuesta de la API:', data);
          console.log('📋 Tipo de data:', typeof data, 'es array:', Array.isArray(data));
          console.log('📋 Estructura completa de data:', JSON.stringify(data, null, 2));

          if (!data) {
            console.error('❌ Data es null/undefined');
            throw new Error(`No se encontró la instalación con código ${numericCode}`);
          }

          // Si data es un array, tomar el primer elemento, si no, usar data directamente
          const rawData = Array.isArray(data) ? data[0] : data;
          console.log('📋 Raw data después de verificar array:', rawData);

          if (!rawData) {
            console.error('❌ No hay datos en la respuesta');
            throw new Error(`No se encontró la instalación con código ${numericCode}`);
          }

          console.log('🔍 Valores ANTES de normalizar:', {
            lectura_anterior_raw: rawData.lectura_anterior,
            lectura_anterior_tipo: typeof rawData.lectura_anterior,
            promedio_raw: rawData.promedio,
            promedio_tipo: typeof rawData.promedio
          });

          // Normalizar los valores numéricos
          const lecturaAnterior = rawData.lectura_anterior !== null && rawData.lectura_anterior !== undefined
            ? Number(rawData.lectura_anterior)
            : 0;
          const promedio = rawData.promedio !== null && rawData.promedio !== undefined
            ? Number(rawData.promedio)
            : 0;

          console.log('🔍 Valores DESPUÉS de conversión a Number:', {
            lectura_anterior: lecturaAnterior,
            lectura_anterior_isNaN: isNaN(lecturaAnterior),
            promedio: promedio,
            promedio_isNaN: isNaN(promedio)
          });

          const installation = {
            ...rawData,
            codigo: numericCode,
            lectura_anterior: lecturaAnterior,
            promedio: promedio
          };

          console.log('✅ Instalación normalizada completa:', installation);
          console.log('✅ Campos clave:', {
            codigo: installation.codigo,
            nombre: installation.nombre,
            codigo_medidor: installation.codigo_medidor,
            sector_nombre: installation.sector_nombre,
            direccion: installation.direccion,
            lectura_anterior: installation.lectura_anterior,
            promedio: installation.promedio
          });
          return installation;
        } catch (error: any) {
          // Si es un error de conexión, intentar obtener de la base de datos local
          if (error.isConnectionError) {
            const installation = await storageService.getInstallationByCode(code);
            if (installation) {
              return installation;
            }
          }
          
          // Si es un error 400, significa que la instalación no existe
          if (error.response?.status === 400) {
            throw new Error(`No se encontró la instalación con código ${code}`);
          }

          throw error;
        }
      } else {
        const installation = await storageService.getInstallationByCode(code);
        if (!installation) {
          throw new Error('Instalación no encontrada en la base de datos local');
        }
        return installation;
      }
    } catch (error: any) {
      if (error.isConnectionError) {
        const installation = await storageService.getInstallationByCode(code);
        if (!installation) {
          throw new Error('No hay conexión y la instalación no existe en la base de datos local');
        }
        return installation;
      }
      throw new Error(error.message || 'Error al buscar la instalación');
    }
  },

  async getAll(): Promise<Installation[]> {
    
    try {
      if (syncService.isOnline()) { 
        const  { data } = await apiClient.get<Installation[]>('/instalaciones/all');
        return data;
      } else {
        return await storageService.getInstallations();
      }
    } catch (error) {
      if (error.isConnectionError) {
        return await storageService.getInstallations();
      }
      console.error('Error getting installations:', error);
      throw new Error('Error al obtener las instalaciones');
    }
  }
};