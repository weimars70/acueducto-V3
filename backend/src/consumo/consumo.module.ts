import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsumoService } from './consumo.service';
import { ConsumoController } from './consumo.controller';
import { Consumption } from '../entities/consumption.entity';

@Module({
  imports: [
    // Repositorio para la conexión principal
    TypeOrmModule.forFeature([Consumption]),
    // Repositorio para la conexión remota
    TypeOrmModule.forFeature([Consumption], 'remoteConnection'),
  ],
  controllers: [ConsumoController],
  providers: [ConsumoService],
  exports: [ConsumoService],
})
export class ConsumoModule {}
