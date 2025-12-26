import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappService } from './whatsapp.service';
import { Empresa } from '../entities/empresa.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Empresa])],
    providers: [WhatsappService],
    exports: [WhatsappService],
})
export class WhatsappModule { }
