export interface EstratoTarifa {
    codigo: number;
    tipo: number;
    estrato: string;
    cargo: number;
    m3_0_20: number;
    m3_21_40: number;
    m3_41_x: number;
    interes: number;
    subsidioCargoFijo: number;
    subsidioConsumo: number;
    subsidioConsumoComplementario: number;
    subsidioConsumoSuntuario: number;
    empresaId: number;
    usuario?: string;
    id?: number;
}

export interface CreateEstratoTarifaDto {
    codigo: number;
    tipo: number;
    estrato?: string;
    cargo?: number;
    m3_0_20?: number;
    m3_21_40?: number;
    m3_41_x?: number;
    interes?: number;
    subsidioCargoFijo?: number;
    subsidioConsumo?: number;
    subsidioConsumoComplementario?: number;
    subsidioConsumoSuntuario?: number;
    empresaId: number;
    usuario?: string;
}

export interface UpdateEstratoTarifaDto extends Partial<CreateEstratoTarifaDto> { }
