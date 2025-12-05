import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConsumoModule } from './consumo/consumo.module';
import { InstalacionesModule } from './instalaciones/instalaciones.module';
import { DatabaseModule } from './database/database.module';
import { PdfModule } from './pdf/pdf.module';
import { GenericCaptureModule } from './generic-capture/generic-capture.module';
import { BancosModule } from './bancos/bancos.module';
import { CentroCostosModule } from './centro-costos/centro-costos.module';
import { CiudadesModule } from './ciudades/ciudades.module';
import { ClientesModule } from './clientes/clientes.module';
import { ImpuestosModule } from './impuestos/impuestos.module';
import { MarcasMedidorModule } from './marcas-medidor/marcas-medidor.module';
import { TarifasModule } from './tarifas/tarifas.module';
import { TipoIdentModule } from './tipo-ident/tipo-ident.module';
import { TipoImpuestoModule } from './tipo-impuesto/tipo-impuesto.module';
import { TipoPersonaModule } from './tipo-persona/tipo-persona.module';
import { TipoRegimenModule } from './tipo-regimen/tipo-regimen.module';
import { YearsModule } from './years/years.module';
import { TercerosModule } from './terceros/terceros.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ConsumoModule,
    InstalacionesModule,
    PdfModule,
    GenericCaptureModule,
    BancosModule,
    CentroCostosModule,
    CiudadesModule,
    ClientesModule,
    ImpuestosModule,
    MarcasMedidorModule,
    TarifasModule,
    TipoIdentModule,
    TipoImpuestoModule,
    TipoPersonaModule,
    TipoRegimenModule,
    YearsModule,
    TercerosModule,
  ],
})
export class AppModule { }