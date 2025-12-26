import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from '../entities/empresa.entity';
import * as nodemailer from 'nodemailer';

export interface SendEmailDto {
    empresaId: number;
    emailDestinatario: string;
    pdfBase64: string;
    factura: string;
    prefijo?: string;
    nombreCliente: string;
}

@Injectable()
export class EmailService {
    constructor(
        @InjectRepository(Empresa)
        private empresaRepository: Repository<Empresa>,
    ) { }

    /**
     * Envía una factura por email con PDF adjunto
     */
    async sendInvoiceEmail(data: SendEmailDto): Promise<any> {
        const { empresaId, emailDestinatario, pdfBase64, factura, prefijo, nombreCliente } = data;

        console.log('📧 [Email] Iniciando envío de factura:', { empresaId, emailDestinatario, factura, prefijo });

        try {
            // 1. Obtener configuración de Email de la empresa
            const empresa = await this.empresaRepository.findOne({
                where: { id: empresaId },
                select: ['hostEmail', 'userEmail', 'passwdEmail', 'portEmail', 'nombre'],
            });

            if (!empresa) {
                console.error('❌ [Email] Empresa no encontrada:', empresaId);
                throw new HttpException('Empresa no encontrada', HttpStatus.NOT_FOUND);
            }

            console.log('🏢 [Email] Empresa encontrada:', empresa.nombre);
            console.log('🔧 [Email] Configuración:', {
                hasHost: !!empresa.hostEmail,
                hasUser: !!empresa.userEmail,
                hasPassword: !!empresa.passwdEmail,
                hasPort: !!empresa.portEmail
            });

            if (!empresa.hostEmail || !empresa.userEmail || !empresa.passwdEmail || !empresa.portEmail) {
                console.error('❌ [Email] Credenciales incompletas');
                throw new HttpException(
                    'La empresa no tiene configurado el email. Por favor configure las credenciales SMTP en la configuración de la empresa.',
                    HttpStatus.BAD_REQUEST,
                );
            }

            // 2. Validar email destinatario
            if (!emailDestinatario || emailDestinatario.trim() === '') {
                console.error('❌ [Email] Email vacío');
                throw new HttpException(
                    'El cliente no tiene email registrado',
                    HttpStatus.BAD_REQUEST,
                );
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailDestinatario)) {
                console.error('❌ [Email] Email inválido:', emailDestinatario);
                throw new HttpException(
                    'Email inválido',
                    HttpStatus.BAD_REQUEST,
                );
            }

            // 3. Crear transporter de nodemailer
            const transporter = nodemailer.createTransport({
                host: empresa.hostEmail,
                port: empresa.portEmail,
                secure: empresa.portEmail === 465, // true para 465, false para otros puertos
                auth: {
                    user: empresa.userEmail,
                    pass: empresa.passwdEmail,
                },
                tls: {
                    rejectUnauthorized: false // Para servidores con certificados autofirmados
                }
            });

            // 4. Preparar mensaje
            const facturaCompleta = prefijo ? `${prefijo}-${factura}` : factura;

            // Convertir base64 a buffer
            const pdfBuffer = Buffer.from(pdfBase64, 'base64');

            const mailOptions = {
                from: `"${empresa.nombre}" <${empresa.userEmail}>`,
                to: emailDestinatario,
                subject: `Factura ${facturaCompleta} - ${empresa.nombre}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2c3e50;">Factura de Servicios Públicos</h2>
                        <p>Estimado/a <strong>${nombreCliente}</strong>,</p>
                        <p>Adjunto encontrarás tu factura <strong>#${facturaCompleta}</strong> correspondiente a los servicios prestados.</p>
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Factura:</strong> ${facturaCompleta}</p>
                            <p style="margin: 5px 0;"><strong>Empresa:</strong> ${empresa.nombre}</p>
                        </div>
                        <p>Por favor, conserva este documento para tu registro.</p>
                        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                        <p style="color: #7f8c8d; font-size: 12px;">
                            Este es un mensaje automático, por favor no responder a este correo.
                        </p>
                    </div>
                `,
                attachments: [
                    {
                        filename: `Factura_${facturaCompleta}.pdf`,
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }
                ]
            };

            console.log('📧 [Email] Enviando email a:', emailDestinatario);
            console.log('📦 [Email] Tamaño del PDF:', pdfBuffer.length, 'bytes');

            // 5. Enviar email
            const info = await transporter.sendMail(mailOptions);

            console.log('✅ [Email] Email enviado exitosamente:', info.messageId);

            return {
                success: true,
                message: 'Factura enviada por email exitosamente',
                email: emailDestinatario,
                factura: facturaCompleta,
                messageId: info.messageId
            };

        } catch (error: any) {
            console.error('❌ [Email] Error completo:', {
                message: error.message,
                code: error.code,
                command: error.command
            });

            // Si es un HttpException que ya lanzamos, re-lanzarla
            if (error instanceof HttpException) {
                throw error;
            }

            // Errores específicos de nodemailer
            if (error.code === 'EAUTH') {
                throw new HttpException(
                    'Error de autenticación SMTP. Verifica las credenciales de email.',
                    HttpStatus.UNAUTHORIZED,
                );
            }

            if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
                throw new HttpException(
                    'No se pudo conectar al servidor de email. Verifica el host y puerto.',
                    HttpStatus.SERVICE_UNAVAILABLE,
                );
            }

            // Error genérico
            throw new HttpException(
                `Error al enviar email: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
