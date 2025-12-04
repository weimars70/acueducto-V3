import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoRegimenService } from './tipo-regimen.service';
import { TipoRegimenController } from './tipo-regimen.controller';
import { TipoRegimen } from '../entities/tipo-regimen.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TipoRegimen])],
    controllers: [TipoRegimenController],
    providers: [TipoRegimenService],
    exports: [TipoRegimenService],
})
export class TipoRegimenModule { }
