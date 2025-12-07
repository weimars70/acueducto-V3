import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfesionesService } from './profesiones.service';
import { ProfesionesController } from './profesiones.controller';
import { Profesion } from './entities/profesion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profesion])],
  controllers: [ProfesionesController],
  providers: [ProfesionesService],
})
export class ProfesionesModule { }
