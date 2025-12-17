export interface Nomina {
  id: number;
  periodo_id: number;
  empleado_id: number;
  salario_mensual: number;
  valor_hora: number;
  dias_pagados: number;
  total_devengado: number;
  total_deducciones: number;
  neto_pagar: number;
  estado: string; // BORRADOR, APROBADO, PAGADO
  observaciones?: string;
  empresa_id: number;
  fecha_creacion?: string | Date;
  usuario_creacion?: number;
  fecha_aprobacion?: string | Date;
  usuario_aprobacion?: number;
  // Relaciones
  empleado?: {
    id: number;
    cedula: string;
    nombre_completo: string;
  };
  periodo?: {
    id: number;
    nombre: string;
    fecha_inicio: string | Date;
    fecha_fin: string | Date;
    dias_periodo: number;
  };
  detalles?: NominaDetalle[];
}

export interface NominaDetalle {
  id: number;
  nomina_id: number;
  concepto_id: number;
  cantidad: number;
  valor_unitario: number;
  valor_total: number;
  observaciones?: string;
  concepto?: {
    id: number;
    codigo: string;
    nombre: string;
    tipo: string; // DEVENGADO, DEDUCCION
    subtipo?: string;
  };
}

export interface CreateNominaDto {
  periodoId: number;
  empleadoId: number;
  observaciones?: string;
}

export interface CalcularNominaDto {
  nominaId: number;
}

export interface AprobarNominaDto {
  nominaId: number;
  observaciones?: string;
}

