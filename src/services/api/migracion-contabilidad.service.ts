import { apiClient } from './client';

export const migracionContabilidadService = {
    migrar(data: { mes: number; year: number; empresaId: number }) {
        return apiClient.post('/migracion-contabilidad/migrar-facturas', data).then((res: any) => res.data);
    },

    getFacturasPeriodo(mes: number, year: number, empresaId: number) {
        return apiClient.get('/migracion-contabilidad/facturas-periodo', { params: { mes, year, empresaId } }).then((res: any) => res.data);
    },

    migrarIndividual(factura: any) {
        return apiClient.post('/migracion-contabilidad/migrar-factura-individual', factura).then((res: any) => res.data);
    },

    getFacturasCarteraPeriodo(mes: number, year: number, empresaId: number) {
        return apiClient.get('/migracion-contabilidad/facturas-cartera-periodo', { params: { mes, year, empresaId } }).then((res: any) => res.data);
    },

    migrarCarteraIndividual(factura: any) {
        return apiClient.post('/migracion-contabilidad/migrar-factura-cartera-individual', factura).then((res: any) => res.data);
    },

    getMeses() {
        return apiClient.get<any[]>('/consumo/get-meses').then((res: any) => res.data);
    }
};
