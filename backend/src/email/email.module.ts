import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { Empresa } from '../entities/empresa.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Empresa])],
    controllers: [EmailController],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule { }
