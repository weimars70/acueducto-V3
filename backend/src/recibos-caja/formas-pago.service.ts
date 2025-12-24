import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class FormasPagoService {
    constructor(private readonly dataSource: DataSource) { }

    async findAll(empresaId: number) {
        const query = `
            SELECT codigo, descripcion
            FROM public.formas_pagos
            WHERE empresa_id = $1
            ORDER BY descripcion
        `;

        const data = await this.dataSource.query(query, [empresaId]);
        return data;
    }
}
