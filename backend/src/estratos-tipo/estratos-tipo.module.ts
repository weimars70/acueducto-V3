import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstratosTipoService } from './estratos-tipo.service';
import { EstratosTipoController } from './estratos-tipo.controller';
import { EstratoTipo } from './entities/estrato-tipo.entity';

@Module({
    imports: [TypeOrmModule.forFeature([EstratoTipo])],
    controllers: [EstratosTipoController],
    providers: [EstratosTipoService],
    exports: [EstratosTipoService]
})
export class EstratosTipoModule { }
