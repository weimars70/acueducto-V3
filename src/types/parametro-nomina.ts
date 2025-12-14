export interface ParametroNomina {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  valor: number;
  anio: number;
  empresa_id: number;
  fecha_creacion: Date;
  usuario_creacion?: number;
}

export interface CreateParametroNominaDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  valor: number;
  anio: number;
  empresaId: number;
  usuarioCreacion?: number;
}

export interface UpdateParametroNominaDto {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  valor?: number;
  anio?: number;
}

export interface DuplicateYearDto {
  sourceYear: number;
  targetYear: number;
}
