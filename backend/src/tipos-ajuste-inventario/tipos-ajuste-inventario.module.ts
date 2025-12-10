import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiposAjusteInventarioController } from './tipos-ajuste-inventario.controller';
import { TiposAjusteInventarioService } from './tipos-ajuste-inventario.service';
import { TipoAjusteInventario } from '../entities/tipo-ajuste-inventario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoAjusteInventario])],
  controllers: [TiposAjusteInventarioController],
  providers: [TiposAjusteInventarioService],
  exports: [TiposAjusteInventarioService]
})
export class TiposAjusteInventarioModule { }
