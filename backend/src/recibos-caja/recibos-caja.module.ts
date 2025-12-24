import { Module } from '@nestjs/common';
import { TiposReciboController } from './tipos-recibo.controller';
import { TiposReciboService } from './tipos-recibo.service';
import { FormasPagoController } from './formas-pago.controller';
import { FormasPagoService } from './formas-pago.service';
import { RecibosCajaController } from './recibos-caja.controller';
import { RecibosCajaService } from './recibos-caja.service';

@Module({
    controllers: [TiposReciboController, FormasPagoController, RecibosCajaController],
    providers: [TiposReciboService, FormasPagoService, RecibosCajaService]
})
export class RecibosCajaModule { }
