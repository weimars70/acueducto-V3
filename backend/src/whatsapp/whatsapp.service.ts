import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from '../entities/empresa.entity';
import axios from 'axios';

export interface SendWhatsAppDto {
    empresaId: number;
    telefono: string;
    pdfBase64: string;
    factura: string;
    prefijo?: string;
}

@Injectable()
export class WhatsappService {
    constructor(
        @InjectRepository(Empresa)
        private empresaRepository: Repository<Empresa>,
    ) { }

    /**
     * Valida y formatea el número de teléfono
     * Si es un número colombiano de 10 dígitos que empieza con 3, agrega el prefijo 57
     */
    private formatPhoneNumber(telefono: string): string {
        // Eliminar caracteres no numéricos
        const cleaned = telefono.replace(/[^0-9]/g, '');

        // Si es un número colombiano de 10 dígitos que empieza con 3, agregar prefijo 57
        if (cleaned.length === 10 && cleaned.startsWith('3')) {
            return '57' + cleaned;
        }

        return cleaned;
    }

    /**
     * Envía un PDF por WhatsApp usando Evolution API
     */
    async sendInvoiceWhatsApp(data: SendWhatsAppDto): Promise<any> {
        const { empresaId, telefono, pdfBase64, factura, prefijo } = data;

        console.log('📱 [WhatsApp] Iniciando envío de factura:', { empresaId, telefono, factura, prefijo });

        try {
            // 1. Obtener configuración de WhatsApp de la empresa
            const empresa = await this.empresaRepository.findOne({
                where: { id: empresaId },
                select: ['whatsappApiUrl', 'whatsappApi', 'whatsappApiKey', 'nombre'],
            });

            if (!empresa) {
                console.error('❌ [WhatsApp] Empresa no encontrada:', empresaId);
                throw new HttpException('Empresa no encontrada', HttpStatus.NOT_FOUND);
            }

            console.log('🏢 [WhatsApp] Empresa encontrada:', empresa.nombre);
            console.log('🔧 [WhatsApp] Configuración:', {
                hasUrl: !!empresa.whatsappApiUrl,
                hasApi: !!empresa.whatsappApi,
                hasKey: !!empresa.whatsappApiKey
            });

            if (!empresa.whatsappApiUrl || !empresa.whatsappApi || !empresa.whatsappApiKey) {
                console.error('❌ [WhatsApp] Credenciales incompletas');
                throw new HttpException(
                    'La empresa no tiene configurado WhatsApp. Por favor configure las credenciales en la configuración de la empresa.',
                    HttpStatus.BAD_REQUEST,
                );
            }

            // 2. Validar teléfono
            if (!telefono || telefono.trim() === '') {
                console.error('❌ [WhatsApp] Teléfono vacío');
                throw new HttpException(
                    'El cliente no tiene número de teléfono registrado',
                    HttpStatus.BAD_REQUEST,
                );
            }

            const formattedPhone = this.formatPhoneNumber(telefono);
            console.log('📞 [WhatsApp] Teléfono formateado:', { original: telefono, formatted: formattedPhone });

            if (formattedPhone.length < 10) {
                console.error('❌ [WhatsApp] Teléfono inválido:', formattedPhone);
                throw new HttpException(
                    'Número de teléfono inválido',
                    HttpStatus.BAD_REQUEST,
                );
            }

            // 3. Preparar mensaje
            const facturaCompleta = prefijo ? `${prefijo}-${factura}` : factura;
            const mensaje = `Estimado cliente,\n\n` +
                `Adjunto encontrarás tu factura #${facturaCompleta} correspondiente.\n\n` +
                `Saludos,\n` +
                `*${empresa.nombre || 'Acueducto'}*`;

            // 4. Preparar datos para Evolution API v2.3.6
            const whatsappData = {
                number: formattedPhone, // Número sin formato @s.whatsapp.net
                mediatype: 'document',
                mimetype: 'application/pdf',
                caption: mensaje,
                media: pdfBase64, // Base64 del archivo
                fileName: `Factura_${facturaCompleta}.pdf`,
            };

            // 5. Enviar a Evolution API
            const fullUrl = `${empresa.whatsappApiUrl}/message/sendMedia/${empresa.whatsappApi}`;
            console.log('🚀 [WhatsApp] Enviando a Evolution API:', fullUrl);
            console.log('📦 [WhatsApp] Tamaño del base64:', pdfBase64.length, 'caracteres');
            console.log('📦 [WhatsApp] Payload (sin media):', {
                number: formattedPhone,
                mediatype: 'document',
                mimetype: 'application/pdf',
                caption: mensaje.substring(0, 50) + '...',
                fileName: `Factura_${facturaCompleta}.pdf`,
                mediaLength: pdfBase64.length
            });

            const response = await axios.post(fullUrl, whatsappData, {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': empresa.whatsappApiKey,
                },
                timeout: 30000, // 30 segundos de timeout
            });

            console.log('✅ [WhatsApp] Respuesta de Evolution API:', {
                status: response.status,
                statusText: response.statusText
            });

            if (response.status === 200 || response.status === 201) {
                return {
                    success: true,
                    message: 'Factura enviada por WhatsApp exitosamente',
                    telefono: formattedPhone,
                    factura: facturaCompleta,
                };
            } else {
                console.error('❌ [WhatsApp] Respuesta inesperada:', response.status);
                throw new HttpException(
                    `Error al enviar WhatsApp: ${response.statusText}`,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        } catch (error: any) {
            console.error('❌ [WhatsApp] Error completo:', {
                message: error.message,
                response: error.response?.data,
                responseString: JSON.stringify(error.response?.data, null, 2),
                status: error.response?.status
            });

            // Si es un HttpException que ya lanzamos, re-lanzarla
            if (error instanceof HttpException) {
                throw error;
            }

            // Si es un error de axios, extraer información útil
            if (error.response) {
                throw new HttpException(
                    `Error al enviar WhatsApp: ${error.response.data?.message || error.message}`,
                    error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            // Error genérico
            throw new HttpException(
                `Error al enviar WhatsApp: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
