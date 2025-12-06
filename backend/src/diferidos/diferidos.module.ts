import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiferidosService } from './diferidos.service';
import { DiferidosController } from './diferidos.controller';
import { Diferido } from './entities/diferido.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Diferido])],
    controllers: [DiferidosController],
    providers: [DiferidosService],
})
export class DiferidosModule { }
