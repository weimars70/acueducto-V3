export interface Diferido {
    id: number;
    contratoId: number;
    conceptoDiferidoId: number;
    montoOriginal: number;
    numeroCuotas: number;
    cuotasPendientes: number;
    fechaInicio: string;
    valorCuota: number;
    porInteres: number;
    estado: string;
    observaciones?: string;
    empresaId: number;
    usuario: string;
    contrato?: {
        codigo: number;
        nombre: string;
        direccion: string;
    };
    concepto?: {
        codigo: number;
        nombre: string;
    };
}

export interface CreateDiferidoDto {
    contratoId: number;
    conceptoDiferidoId: number;
    montoOriginal: number;
    numeroCuotas: number;
    fechaInicio: string;
    valorCuota?: number;
    porInteres?: number;
    observaciones?: string;
    empresaId: number;
    usuario?: string;
}

export interface UpdateDiferidoDto extends Partial<CreateDiferidoDto> {
    estado?: string;
    cuotasPendientes?: number;
}
