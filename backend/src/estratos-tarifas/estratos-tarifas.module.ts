import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstratosTarifasService } from './estratos-tarifas.service';
import { EstratosTarifasController } from './estratos-tarifas.controller';
import { EstratoTarifa } from './entities/estrato-tarifa.entity';

@Module({
    imports: [TypeOrmModule.forFeature([EstratoTarifa])],
    controllers: [EstratosTarifasController],
    providers: [EstratosTarifasService],
    exports: [EstratosTarifasService]
})
export class EstratosTarifasModule { }
