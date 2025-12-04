import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoIdentController } from './tipo-ident.controller';
import { TipoIdentService } from './tipo-ident.service';
import { TipoIdent } from '../entities/tipo-ident.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TipoIdent])],
    controllers: [TipoIdentController],
    providers: [TipoIdentService],
    exports: [TipoIdentService],
})
export class TipoIdentModule { }
