import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkNominaTables() {
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

        const tables = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%nomina%'
    `);
        console.log(tables.map(t => t.table_name).join(', '));

        await connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkNominaTables();
