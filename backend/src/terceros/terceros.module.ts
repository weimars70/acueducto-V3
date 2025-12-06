import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TercerosService } from './terceros.service';
import { TercerosController } from './terceros.controller';
import { Tercero } from '../entities/tercero.entity';
import { TerceroContacto } from '../entities/tercero-contacto.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Tercero, TerceroContacto])],
    controllers: [TercerosController],
    providers: [TercerosService],
    exports: [TercerosService],
})
export class TercerosModule { }
