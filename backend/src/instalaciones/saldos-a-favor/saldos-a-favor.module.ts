import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientoSaldoAFavor } from './entities/saldo-a-favor.entity';
import { SaldosAFavorService } from './saldos-a-favor.service';
import { SaldosAFavorController } from './saldos-a-favor.controller';

@Module({
    imports: [TypeOrmModule.forFeature([MovimientoSaldoAFavor])],
    controllers: [SaldosAFavorController],
    providers: [SaldosAFavorService],
})
export class SaldosAFavorModule { }
