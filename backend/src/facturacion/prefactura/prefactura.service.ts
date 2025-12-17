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

    async getMeses(): Promise<any[]> {
        return await this.dataSource.query('SELECT * FROM meses ORDER BY id ASC');
    }
}
