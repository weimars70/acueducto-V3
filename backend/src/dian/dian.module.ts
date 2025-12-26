import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DianController } from './dian.controller';
import { DianService } from './dian.service';

@Module({
    imports: [HttpModule],
    controllers: [DianController],
    providers: [DianService],
    exports: [DianService]
})
export class DianModule { }
