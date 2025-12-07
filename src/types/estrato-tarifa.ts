export interface EstratoTarifa {
    codigo: number;
    tipo: number;
    estrato: string;
    cargo: number;
    basico: number;
    complementario: number;
    suntuario: number;
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
    basico?: number;
    complementario?: number;
    suntuario?: number;
    interes?: number;
    subsidioCargoFijo?: number;
    subsidioConsumo?: number;
    subsidioConsumoComplementario?: number;
    subsidioConsumoSuntuario?: number;
    empresaId: number;
    usuario?: string;
}

export interface UpdateEstratoTarifaDto extends Partial<CreateEstratoTarifaDto> { }
