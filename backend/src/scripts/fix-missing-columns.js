
const { Client } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
});

async function addColumnIfNotExists(tableName, columnName, columnType) {
    try {
        await client.query(`
            ALTER TABLE ${tableName} 
            ADD COLUMN ${columnName} ${columnType};
        `);
        console.log(`Added "${columnName}" column to ${tableName}.`);
    } catch (e) {
        if (e.code === '42701') { // duplicate_column
            console.log(`Column "${columnName}" already exists in ${tableName}.`);
        } else {
            console.error(`Error adding "${columnName}" to ${tableName}:`, e.message);
        }
    }
}

async function run() {
    try {
        await client.connect();
        console.log('Connected to database.');

        // Add 'estado' (caused the recent error)
        await addColumnIfNotExists('instalaciones', 'estado', 'VARCHAR(20)');

        // Add 'activo' (likely missing too)
        await addColumnIfNotExists('instalaciones', 'activo', 'BOOLEAN DEFAULT true');

        // Add 'ciudad_codigo' (ensure it exists)
        await addColumnIfNotExists('instalaciones', 'ciudad_codigo', 'INTEGER');

        console.log('Finished checking and repairing columns.');

    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        await client.end();
    }
}

run();
