import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotasDebitoService } from './notas-debito.service';
import { NotasDebitoController } from './notas-debito.controller';
import { NotaDebito } from './entities/nota-debito.entity';

@Module({
    imports: [TypeOrmModule.forFeature([NotaDebito])],
    controllers: [NotasDebitoController],
    providers: [NotasDebitoService],
    exports: [NotasDebitoService],
})
export class NotasDebitoModule { }
