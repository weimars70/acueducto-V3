import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YearsService } from './years.service';
import { YearsController } from './years.controller';
import { Years } from '../entities/years.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Years])],
    controllers: [YearsController],
    providers: [YearsService],
    exports: [YearsService],
})
export class YearsModule { }
