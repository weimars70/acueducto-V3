import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkLawDeductionsSimple() {
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

        const result = await connection.query("SELECT id, name, code FROM type_law_deductions LIMIT 6");
        console.log(JSON.stringify(result, null, 2));

        await connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkLawDeductionsSimple();
