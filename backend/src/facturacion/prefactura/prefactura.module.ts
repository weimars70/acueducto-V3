import { Module } from '@nestjs/common';
import { PrefacturaController } from './prefactura.controller';
import { PrefacturaService } from './prefactura.service';

@Module({
    controllers: [PrefacturaController],
    providers: [PrefacturaService],
})
export class PrefacturaModule { }
