import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([])
    ],
    controllers: [TasksController],
    providers: [TasksService],
})
export class TasksModule { }
