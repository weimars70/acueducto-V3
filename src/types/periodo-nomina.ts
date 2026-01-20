export interface PeriodoNomina {
  id: number;
  nombre: string;
  fecha_inicio: string | Date;
  fecha_fin: string | Date;
  dias_periodo: number;
  estado: string; // ABIERTO, CERRADO, PAGADO
  empresa_id: number;
  fecha_creacion?: string | Date;
  usuario_creacion?: number;
  fecha_cierre?: string | Date;
  fecha_pago?: string | Date;
  id_payroll_periods?: number;
}

export interface CreatePeriodoNominaDto {
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  dias_periodo: number;
  estado?: string;
  id_payroll_periods?: number;
}

export interface UpdatePeriodoNominaDto extends Partial<CreatePeriodoNominaDto> { }
