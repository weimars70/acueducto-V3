import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MigracionContabilidadController } from './migracion-contabilidad.controller';
import { MigracionContabilidadService } from './migracion-contabilidad.service';

@Module({
    imports: [
        HttpModule.register({
            timeout: 300000, // 5 minutos para llamadas a la API de contabilidad
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        })
    ],
    controllers: [MigracionContabilidadController],
    providers: [MigracionContabilidadService],
    exports: [MigracionContabilidadService],
})
export class MigracionContabilidadModule { }
