import { api } from '../api';

export interface EnviarWhatsappDto {
    telefono: string;
    pdfBase64: string;
    factura: string;
    prefijo?: string;
}

export const whatsappService = {
    async enviarFacturaWhatsapp(data: EnviarWhatsappDto): Promise<any> {
        const response = await api.post('/facturas/enviar-whatsapp', data);
        return response.data;
    }
};
