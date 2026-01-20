import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkConcepts() {
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

        const concepts = await connection.query(`
      SELECT DISTINCT subtipo FROM conceptos_nomina
    `);
        console.log(concepts.map(c => c.subtipo).join(', '));

        await connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkConcepts();
