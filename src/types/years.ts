export interface Years {
    year: number;
    empresa_id: number;
    usuario?: string;
}

export interface CreateYearsDto {
    year: number;
    empresa_id: number;
    usuario?: string;
}

export interface UpdateYearsDto extends Partial<CreateYearsDto> { }
