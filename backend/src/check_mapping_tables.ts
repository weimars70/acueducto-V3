import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkMappingTables() {
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
        console.table(await connection.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'formas_pagos'"));

        console.log('--- type_law_deductions ---');
        console.table(await connection.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'type_law_deductions'"));

        console.log('--- payroll_periods ---');
        console.table(await connection.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'payroll_periods'"));

        console.log('--- ciudades ---');
        console.table(await connection.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'ciudades'"));

        await connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkMappingTables();
