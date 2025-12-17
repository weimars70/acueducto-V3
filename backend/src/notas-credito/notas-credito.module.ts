import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotasCreditoService } from './notas-credito.service';
import { NotasCreditoController } from './notas-credito.controller';
import { NotaCredito } from '../entities/nota-credito.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotaCredito])],
  controllers: [NotasCreditoController],
  providers: [NotasCreditoService],
  exports: [NotasCreditoService],
})
export class NotasCreditoModule {}
