import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkMappingData() {
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

        console.log('--- Data: formas_pagos ---');
        console.table(await connection.query("SELECT * FROM formas_pagos"));

        console.log('--- Data: type_law_deductions ---');
        console.table(await connection.query("SELECT * FROM type_law_deductions"));

        console.log('--- Data: payroll_periods ---');
        console.table(await connection.query("SELECT * FROM payroll_periods"));

        await connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkMappingData();
