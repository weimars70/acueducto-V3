import { apiClient } from './client';

export interface Instalacion {
  codigo?: number;
  suscriptor?: string;
  sector?: number;
  ident?: string;
  dv?: string;
  nombres?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  nombre: string;
  email?: string;
  regimen?: number;
  tipo_persona?: number;
  tipo_impuesto?: number;
  centro_costos?: number;
  factura_fisica?: boolean;
  enviar_factura_email?: boolean;
  enviar_factura_whatsapp?: boolean;
  direccion?: string;
  ciudad_codigo?: number;
  telefono?: string;
  estrato_codigo?: number;
  activo?: boolean;
  codigo_medidor?: string;
  marca_codigo?: number;
  uso_codigo?: number;
  lectura?: number;
  promedio?: number;
  lectura_anterior?: number;
  empresa_id?: number;
  prefijo?: number;
  orden?: number;
  cliente?: number;
  latitud?: number;
  longitud?: number;
}

export const instalacionesService = {
  async getAll(empresaId?: number, search?: string): Promise<Instalacion[]> {
    const params: any = {};
    if (empresaId) params.empresaId = empresaId;
    if (search) params.search = search;

    const response = await apiClient.get('/instalaciones/all', { params });
    return response.data;
  },

  async getByCode(codigo: number): Promise<Instalacion> {
    const response = await apiClient.get(`/instalaciones/${codigo}`);
    return response.data;
  },

  async create(instalacion: Instalacion): Promise<Instalacion> {
    const response = await apiClient.post('/instalaciones', instalacion);
    return response.data;
  },

  async update(codigo: number, instalacion: Partial<Instalacion>): Promise<Instalacion> {
    const response = await apiClient.put(`/instalaciones/${codigo}`, instalacion);
    return response.data;
  }
};
