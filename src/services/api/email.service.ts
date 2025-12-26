import { apiClient } from './client';

export interface SendEmailFacturaDto {
    emailDestinatario: string;
    pdfBase64: string;
    factura: string;
    prefijo?: string;
    nombreCliente: string;
}

export const emailService = {
    async enviarFacturaEmail(data: SendEmailFacturaDto): Promise<any> {
        const { data: response } = await apiClient.post('/email/send-invoice', data);
        return response;
    }
};
