import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailService, SendEmailDto } from './email.service';

@Controller('email')
@UseGuards(JwtAuthGuard)
export class EmailController {
    constructor(private readonly emailService: EmailService) { }

    @Post('send-invoice')
    async sendInvoice(
        @Body() body: Omit<SendEmailDto, 'empresaId'>,
        @Request() req: any
    ) {
        const empresaId = req.user?.empresaId || req.user?.empresa_id;

        return this.emailService.sendInvoiceEmail({
            ...body,
            copia: body.copia,
            empresaId
        });
    }
}
