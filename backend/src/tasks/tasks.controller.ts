import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    /**
     * Endpoint para ejecutar manualmente la tarea de exportación de items
     * Útil para pruebas sin esperar al último día del mes
     */
    @Post('export-items')
    async exportItems() {
        await this.tasksService.executeManually();
        return {
            success: true,
            message: 'Tarea de exportación ejecutada exitosamente'
        };
    }
}
