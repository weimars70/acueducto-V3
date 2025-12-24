import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class TiposReciboService {
    constructor(private readonly dataSource: DataSource) { }

    async findAll(empresaId: number) {
        const query = `
            SELECT codigo, nombre
            FROM public.caja_recibos_tipo
            WHERE empresa_id = $1
            ORDER BY nombre
        `;

        const data = await this.dataSource.query(query, [empresaId]);
        return data;
    }
}
