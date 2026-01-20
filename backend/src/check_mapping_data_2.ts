import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkRestMappingData() {
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

        console.log('--- formas_pagos ---');
        console.table(await connection.query("SELECT codigo, descripcion, codigo_dian FROM formas_pagos WHERE empresa_id = 1"));

        console.log('--- type_law_deductions ---');
        console.table(await connection.query("SELECT * FROM type_law_deductions"));

        await connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkRestMappingData();
