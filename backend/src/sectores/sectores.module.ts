import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SectoresService } from './sectores.service';
import { SectoresController } from './sectores.controller';
import { Sector } from './entities/sector.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sector])],
  controllers: [SectoresController],
  providers: [SectoresService],
})
export class SectoresModule { }
