export interface Profesion {
    codigo: number;
    nombre: string;
    empresa_id: number;
    usuario?: string;
}

export interface CreateProfesionDto {
    nombre: string;
}

export interface UpdateProfesionDto {
    nombre: string;
}
