import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from '../entities/empresa.entity';
import axios, { AxiosError } from 'axios';

export interface SendWhatsAppDto {
    empresaId: number;
    telefono: string;
    pdfBase64: string;
    factura: string;
    prefijo?: string;
}

@Injectable()
export class WhatsappService {
    // Configuración de retry
    private readonly MAX_RETRIES = 3;
    private readonly BASE_DELAY = 2000; // 2 segundos
    private readonly MAX_PDF_SIZE_MB = 16; // Límite de WhatsApp es 16MB para documentos

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
     * Calcula el tamaño del PDF en MB desde base64
     */
    private calculatePdfSizeMB(base64: string): number {
        // El tamaño en base64 es aproximadamente 4/3 del tamaño real
        const sizeInBytes = (base64.length * 3) / 4;
        return sizeInBytes / (1024 * 1024);
    }

    /**
     * Calcula el timeout dinámicamente basado en el tamaño del archivo
     * Mínimo 30 segundos, incrementa 10 segundos por cada MB adicional
     */
    private calculateTimeout(pdfSizeMB: number): number {
        const baseTimeout = 30000; // 30 segundos base
        const additionalTimeout = Math.ceil(pdfSizeMB) * 10000; // 10 segundos por MB
        return baseTimeout + additionalTimeout;
    }

    /**
     * Espera un tiempo antes de reintentar (exponential backoff)
     */
    private async delay(attempt: number): Promise<void> {
        const delayTime = this.BASE_DELAY * Math.pow(2, attempt);
        console.log(`⏱️ [WhatsApp] Esperando ${delayTime}ms antes del reintento ${attempt + 1}...`);
        return new Promise(resolve => setTimeout(resolve, delayTime));
    }

    /**
     * Determina si un error es retryable
     */
    private isRetryableError(error: any): boolean {
        // Errores de conexión que vale la pena reintentar
        const retryableMessages = [
            'Connection Closed',
            'ECONNRESET',
            'ETIMEDOUT',
            'ECONNREFUSED',
            'socket hang up',
            'Network Error'
        ];

        const errorMessage = error.message || '';
        const responseMessage = error.response?.data?.message?.join(' ') || '';

        return retryableMessages.some(msg =>
            errorMessage.includes(msg) || responseMessage.includes(msg)
        );
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

            // 3. Validar tamaño del PDF
            const pdfSizeMB = this.calculatePdfSizeMB(pdfBase64);
            console.log('📄 [WhatsApp] Tamaño del PDF:', pdfSizeMB.toFixed(2), 'MB');

            if (pdfSizeMB > this.MAX_PDF_SIZE_MB) {
                console.error('❌ [WhatsApp] PDF demasiado grande:', pdfSizeMB.toFixed(2), 'MB');
                throw new HttpException(
                    `El PDF es demasiado grande (${pdfSizeMB.toFixed(2)}MB). El límite de WhatsApp es ${this.MAX_PDF_SIZE_MB}MB`,
                    HttpStatus.BAD_REQUEST,
                );
            }

            if (pdfSizeMB > 5) {
                console.warn('⚠️ [WhatsApp] PDF grande detectado:', pdfSizeMB.toFixed(2), 'MB - El envío puede tardar más de lo normal');
            }

            // 4. Preparar mensaje
            const facturaCompleta = prefijo ? `${prefijo}-${factura}` : factura;
            const mensaje = `Estimado cliente,\n\n` +
                `Adjunto encontrarás tu factura #${facturaCompleta} correspondiente.\n\n` +
                `Saludos,\n` +
                `*${empresa.nombre || 'Acueducto'}*`;

            // 5. Preparar datos para Evolution API v2.3.6
            const whatsappData = {
                number: formattedPhone, // Número sin formato @s.whatsapp.net
                mediatype: 'document',
                mimetype: 'application/pdf',
                caption: mensaje,
                media: pdfBase64, // Base64 del archivo
                fileName: `Factura_${facturaCompleta}.pdf`,
            };

            // 6. Enviar a Evolution API con retry logic
            const fullUrl = `${empresa.whatsappApiUrl}/message/sendMedia/${empresa.whatsappApi}`;
            const timeout = this.calculateTimeout(pdfSizeMB);

            console.log('🚀 [WhatsApp] Enviando a Evolution API:', fullUrl);
            console.log('📦 [WhatsApp] Tamaño del base64:', pdfBase64.length, 'caracteres');
            console.log('⏱️ [WhatsApp] Timeout configurado:', timeout, 'ms');
            console.log('📦 [WhatsApp] Payload (sin media):', {
                number: formattedPhone,
                mediatype: 'document',
                mimetype: 'application/pdf',
                caption: mensaje.substring(0, 50) + '...',
                fileName: `Factura_${facturaCompleta}.pdf`,
                mediaLength: pdfBase64.length
            });

            // Retry loop
            let lastError: any;
            for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
                try {
                    if (attempt > 0) {
                        console.log(`🔄 [WhatsApp] Intento ${attempt + 1} de ${this.MAX_RETRIES}`);
                    }

                    const response = await axios.post(fullUrl, whatsappData, {
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': empresa.whatsappApiKey,
                        },
                        timeout: timeout,
                    });

                    console.log('✅ [WhatsApp] Respuesta de Evolution API:', {
                        status: response.status,
                        statusText: response.statusText,
                        attempt: attempt + 1
                    });

                    if (response.status === 200 || response.status === 201) {
                        return {
                            success: true,
                            message: 'Factura enviada por WhatsApp exitosamente',
                            telefono: formattedPhone,
                            factura: facturaCompleta,
                            attempts: attempt + 1
                        };
                    } else {
                        console.error('❌ [WhatsApp] Respuesta inesperada:', response.status);
                        throw new HttpException(
                            `Error al enviar WhatsApp: ${response.statusText}`,
                            HttpStatus.INTERNAL_SERVER_ERROR,
                        );
                    }
                } catch (error: any) {
                    lastError = error;

                    // Log del error en cada intento
                    console.error(`❌ [WhatsApp] Error en intento ${attempt + 1}:`, {
                        message: error.message,
                        response: error.response?.data,
                        status: error.response?.status,
                        isRetryable: this.isRetryableError(error)
                    });

                    // Si no es retryable o es el último intento, lanzar el error
                    if (!this.isRetryableError(error) || attempt === this.MAX_RETRIES - 1) {
                        break;
                    }

                    // Esperar antes del siguiente intento
                    await this.delay(attempt);
                }
            }

            // Si llegamos aquí, todos los intentos fallaron
            throw lastError;
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

            // Construir mensaje de error más informativo
            let errorMessage = 'Error al enviar WhatsApp';
            let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

            // Analizar el tipo de error
            if (error.response) {
                // Error de respuesta HTTP de Evolution API
                const responseMessage = Array.isArray(error.response.data?.message)
                    ? error.response.data.message.join(', ')
                    : error.response.data?.message || error.message;

                statusCode = error.response.status || HttpStatus.INTERNAL_SERVER_ERROR;

                // Mensajes específicos para errores comunes
                if (responseMessage.includes('Connection Closed')) {
                    errorMessage = 'La conexión con WhatsApp se cerró inesperadamente. ' +
                        'Esto puede ocurrir si: 1) La instancia de WhatsApp no está conectada en Evolution API, ' +
                        '2) El servidor de Evolution API está sobrecargado, o 3) El archivo es muy grande. ' +
                        'Por favor, verifica que WhatsApp esté conectado en Evolution API.';
                } else if (responseMessage.includes('timeout')) {
                    errorMessage = `El envío excedió el tiempo límite. El archivo puede ser demasiado grande. Error: ${responseMessage}`;
                } else if (responseMessage.includes('Unauthorized') || responseMessage.includes('apikey')) {
                    errorMessage = 'Error de autenticación con Evolution API. Verifica que la API Key sea correcta.';
                    statusCode = HttpStatus.UNAUTHORIZED;
                } else {
                    errorMessage = `Error del servidor de WhatsApp: ${responseMessage}`;
                }
            } else if (error.code === 'ECONNREFUSED') {
                errorMessage = 'No se pudo conectar al servidor de Evolution API. Verifica que esté en ejecución y la URL sea correcta.';
                statusCode = HttpStatus.SERVICE_UNAVAILABLE;
            } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
                errorMessage = 'El envío excedió el tiempo límite. El archivo puede ser demasiado grande o el servidor está lento.';
                statusCode = HttpStatus.REQUEST_TIMEOUT;
            } else if (error.code === 'ENOTFOUND') {
                errorMessage = 'No se pudo resolver la URL del servidor de WhatsApp. Verifica la configuración de whatsappApiUrl.';
                statusCode = HttpStatus.BAD_GATEWAY;
            } else {
                errorMessage = `Error al enviar WhatsApp: ${error.message}`;
            }

            throw new HttpException(errorMessage, statusCode);
        }
    }
}
