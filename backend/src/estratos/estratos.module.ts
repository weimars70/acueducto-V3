import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstratosService } from './estratos.service';
import { EstratosController } from './estratos.controller';
import { Estrato } from './entities/estrato.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Estrato])],
    controllers: [EstratosController],
    providers: [EstratosService],
    exports: [EstratosService]
})
export class EstratosModule { }
