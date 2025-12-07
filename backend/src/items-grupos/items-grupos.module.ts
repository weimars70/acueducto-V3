import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsGruposService } from './items-grupos.service';
import { ItemsGruposController } from './items-grupos.controller';
import { ItemGrupo } from '../entities/item-grupo.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ItemGrupo])],
    controllers: [ItemsGruposController],
    providers: [ItemsGruposService],
    exports: [ItemsGruposService]
})
export class ItemsGruposModule { }
