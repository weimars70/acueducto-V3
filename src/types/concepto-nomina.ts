export interface ConceptoNomina {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: string; // DEVENGADO, DEDUCCION
  subtipo?: string;
  formula?: string;
  porcentaje?: number;
  activo: boolean;
  empresa_id: number;
  fecha_creacion?: string | Date;
}

export interface CreateConceptoNominaDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
  subtipo?: string;
  formula?: string;
  porcentaje?: number;
  activo?: boolean;
}

export interface UpdateConceptoNominaDto extends Partial<CreateConceptoNominaDto> {}
