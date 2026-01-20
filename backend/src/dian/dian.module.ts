import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DianController } from './dian.controller';
import { DianService } from './dian.service';
import { DianNominaController } from './dian-nomina.controller';
import { DianNominaService } from './dian-nomina.service';
import { Nomina } from '../entities/nomina.entity';
import { Empresa } from '../entities/empresa.entity';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([Nomina, Empresa])
    ],
    controllers: [DianController, DianNominaController],
    providers: [DianService, DianNominaService],
    exports: [DianService, DianNominaService]
})
export class DianModule { }
