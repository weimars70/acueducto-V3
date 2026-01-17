import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MigracionContabilidadController } from './migracion-contabilidad.controller';
import { MigracionContabilidadService } from './migracion-contabilidad.service';

@Module({
    imports: [HttpModule],
    controllers: [MigracionContabilidadController],
    providers: [MigracionContabilidadService],
    exports: [MigracionContabilidadService],
})
export class MigracionContabilidadModule { }
