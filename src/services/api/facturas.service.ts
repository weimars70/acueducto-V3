import { apiClient } from './client';
import type { PaginatedResponse } from '../../types/api';

export interface Factura {
    mes: number;
    year: number;
    prefijo: string;
    factura: number;
    nombre: string;
    ident: string;
    suscriptor: string;
    instalacion_codigo: number;
    consumo: number;
    estrato: string;
    cargo_fijo: number;
    basico: number;
    complementario: number;
    suntuario: number;
    valor_subsidio_cargo_fijo: number;
    valor_subsidio_consumo: number;
    saldo_anterior: number;
    total_otros_cobros: number;
    total_total: number;
    interes: number;
    valor_sub_complementario: number;
    valor_sub_suntuario: number;
    capital_saldo_anterior: number;
    interes_capital_saldo_anterior: number;
    interes_pago_extemporaneo: number;
    cuota_conexion: number;
    cuota_medidor: number;
    valor_total: number;
    saldo: number;
    valor_basico: number;
    valor_complementario: number;
    valor_suntuario: number;
    cuentas_vencidas: number;
    otros_cobros: number;
    subsidio_cargo_fijo: number;
    subsidio_consumo: number;
    interes_medidor: number;
    interes_conexion: number;
    lectura: number;
    saldo_conexion: number;
    saldo_medidor: number;
    cuota_diferido: number;
    saldo_diferido: number;
    reconexion: number;
    valor_metros: number;
    total_agua: number;
    total_neto: number;
    sin_recargo: number;
    con_recargo: number;
    consumo_desde: number;
    consumo_hasta: number;
    dias_facturados: number;
    fecha_factura: string;
    lec_ant: number;
    nota_cuentas_vencidas: string;
    total_mes: number;
    email: string;
    ajuste_a_centenas: number;
    telefono: string;
    uso_nombre: string;
    ciudad_nombre: string;
    direccion: string;
    sector_nombre: string;
    codigo_medidor: string;
    fecha: string;
}

export interface FacturasFilters {
    page?: number;
    limit?: number;
    mes?: number;
    year?: number;
    factura?: string;
    nombre?: string;
    ident?: string;
    instalacion_codigo?: string;
    direccion?: string;
    ciudad_nombre?: string;
    sector_nombre?: string;
}

interface FacturaResponse extends PaginatedResponse<Factura> { }

export const facturasService = {
    async getFacturas(filters: FacturasFilters = {}): Promise<FacturaResponse> {
        const { data } = await apiClient.get('/facturas', { params: filters });
        return data;
    }
};
