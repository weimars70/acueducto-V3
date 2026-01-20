import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkCatalogos() {
    try {
        const connection = await createConnection({
            type: 'postgres',
            host: process.env.POSTGRES_HOST,
            port: parseInt(process.env.POSTGRES_PORT),
            username: process.env.POSTGRES_USER.replace(/'/g, ''),
            password: process.env.POSTGRES_PASSWORD.replace(/'/g, ''),
            database: process.env.POSTGRES_DB,
            synchronize: false,
        });

        console.log('--- Tipos Ident ---');
        const ti = await connection.query('SELECT * FROM tipo_ident LIMIT 5');
        console.table(ti);

        console.log('--- Tipos Trabajador ---');
        const tt = await connection.query('SELECT * FROM tipo_trabajador LIMIT 5');
        console.table(tt);

        console.log('--- Tipos Contrato ---');
        const tc = await connection.query('SELECT * FROM tipo_contrato LIMIT 5');
        console.table(tc);

        console.log('--- Formas Pago ---');
        const fp = await connection.query('SELECT * FROM formas_pagos LIMIT 5');
        console.table(fp);

        await connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkCatalogos();
