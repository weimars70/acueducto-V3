import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarcasMedidorController } from './marcas-medidor.controller';
import { MarcasMedidorService } from './marcas-medidor.service';
import { MarcaMedidor } from '../entities/marca-medidor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MarcaMedidor])],
  controllers: [MarcasMedidorController],
  providers: [MarcasMedidorService],
  exports: [MarcasMedidorService],
})
export class MarcasMedidorModule {}
