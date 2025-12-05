export interface Empresa {
    id: number;
    nombre: string;
    codigoAlterno: string;
    direccion?: string;
    ident?: string;
    telefono?: string;
    email?: string;
}

export interface UserEmpresa {
    empresaId: number;
    empresa: string;
    email: string;
}
