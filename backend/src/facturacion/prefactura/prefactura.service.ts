import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GenerarPrefacturaDto } from './dto/generar-prefactura.dto';

@Injectable()
export class PrefacturaService {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) { }

    async generarPrefactura(dto: GenerarPrefacturaDto, empresaId: number, usuario: string): Promise<any> {
        try {
            // function public.func_generar_pre_factura(i_mes integer, i_year integer, i_empresa_id integer, i_usuario text)
            await this.dataSource.query(
                'SELECT public.func_generar_pre_factura($1, $2, $3, $4)',
                [dto.mes, dto.year, empresaId, usuario]
            );
            return { message: 'Prefactura generada exitosamente' };
        } catch (error) {
            console.error('Error generando prefactura:', error);
            throw new InternalServerErrorException('Error al generar la prefactura');
        }
    }

    async verificarPrefactura(dto: GenerarPrefacturaDto): Promise<{ exists: boolean }> {
        const result = await this.dataSource.query(
            'SELECT count(*) as contador FROM public.consumo WHERE year = $1 AND mes = $2 AND prefactura = true',
            [dto.year, dto.mes]
        );
        const contador = parseInt(result[0].contador, 10);
        return { exists: contador > 0 };
    }

    async getMeses(): Promise<any[]> {
        return await this.dataSource.query('SELECT DISTINCT * FROM meses ORDER BY 1 ASC');
    }
}
