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
import { ConceptosFacturaModule } from './conceptos-factura/conceptos-factura.module';
import { DiferidosModule } from './diferidos/diferidos.module';
import { ItemsGruposModule } from './items-grupos/items-grupos.module';
import { ItemsModule } from './items/items.module';
import { TipoMovimientoItemModule } from './tipo-movimiento-item/tipo-movimiento-item.module';
import { EstratosModule } from './estratos/estratos.module';
import { EstratosTipoModule } from './estratos-tipo/estratos-tipo.module';
import { EstratosTarifasModule } from './estratos-tarifas/estratos-tarifas.module';
import { ComprasModule } from './compras/compras.module';
import { MovimientosInventarioModule } from './movimientos-inventario/movimientos-inventario.module';
import { SectoresModule } from './sectores/sectores.module';
import { ProfesionesModule } from './profesiones/profesiones.module';
import { SalidasModule } from './salidas/salidas.module';
import { AjustesInventarioModule } from './ajustes-inventario/ajustes-inventario.module';
import { TiposAjusteInventarioModule } from './tipos-ajuste-inventario/tipos-ajuste-inventario.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { PeriodosNominaModule } from './periodos-nomina/periodos-nomina.module';
import { ConceptosNominaModule } from './conceptos-nomina/conceptos-nomina.module';
import { NominasModule } from './nominas/nominas.module';
import { ParametrosNominaModule } from './parametros-nomina/parametros-nomina.module';
import { NotasConceptosModule } from './notas-conceptos/notas-conceptos.module';
import { NotasCreditoModule } from './notas-credito/notas-credito.module';
import { NotasDebitoConceptosModule } from './notas-debito-conceptos/notas-debito-conceptos.module';
import { NotasDebitoModule } from './notas-debito/notas-debito.module';
import { PrefacturaModule } from './facturacion/prefactura/prefactura.module';
import { SaldosAFavorModule } from './instalaciones/saldos-a-favor/saldos-a-favor.module';



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
    ConceptosFacturaModule,
    DiferidosModule,
    ItemsGruposModule,
    ItemsModule,
    TipoMovimientoItemModule,
    EstratosModule,
    EstratosTipoModule,
    EstratosTarifasModule,
    ComprasModule,
    MovimientosInventarioModule,
    SectoresModule,
    ProfesionesModule,
    SalidasModule,
    AjustesInventarioModule,
    TiposAjusteInventarioModule,
    EmpleadosModule,
    PeriodosNominaModule,
    ConceptosNominaModule,
    NominasModule,
    ParametrosNominaModule,
    NotasDebitoConceptosModule,
    NotasDebitoModule,
    NotasConceptosModule,
    NotasCreditoModule,
    PrefacturaModule,
    SaldosAFavorModule,
  ],
})
export class AppModule { }