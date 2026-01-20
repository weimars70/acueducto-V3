import { apiClient } from './client';

export const nominaCatalogsService = {
    async getTipoTrabajador() {
        return apiClient.get('/nomina-catalogs/tipo-trabajador').then((res: any) => res.data);
    },

    async getSubtipoTrabajador() {
        return apiClient.get('/nomina-catalogs/subtipo-trabajador').then((res: any) => res.data);
    },

    async getTipoContrato() {
        return apiClient.get('/nomina-catalogs/tipo-contrato').then((res: any) => res.data);
    },

    async getFormasPagos() {
        return apiClient.get('/nomina-catalogs/formas-pagos').then((res: any) => res.data);
    },

    async getTipoCuenta() {
        return apiClient.get('/nomina-catalogs/tipo-cuenta').then((res: any) => res.data);
    },

    async getPayrollPeriods() {
        return apiClient.get('/nomina-catalogs/payroll-periods').then((res: any) => res.data);
    }
};
