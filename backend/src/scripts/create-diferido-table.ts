
import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    synchronize: false,
    logging: true,
    entities: [],
    subscribers: [],
    migrations: [],
});

async function createTable() {
    try {
        await AppDataSource.initialize();
        console.log('Data Source has been initialized!');

        const queryRunner = AppDataSource.createQueryRunner();

        console.log('Creating "diferido" table...');
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS diferido (
                id SERIAL PRIMARY KEY,
                contrato_id INTEGER NOT NULL,
                concepto_diferido_id INTEGER NOT NULL,
                monto_original NUMERIC(10, 2) NOT NULL,
                numero_cuotas INTEGER NOT NULL,
                cuotas_pendientes INTEGER NOT NULL,
                fecha_inicio DATE NOT NULL,
                estado VARCHAR(20) NOT NULL,
                observaciones TEXT NULL,
                empresa_id INTEGER NOT NULL,
                usuario TEXT NOT NULL,
                CONSTRAINT fk_concepto
                    FOREIGN KEY (concepto_diferido_id, empresa_id)
                    REFERENCES conceptos_factura (codigo, empresa_id),
                CONSTRAINT fk_instalaciones 
                    FOREIGN KEY (contrato_id, empresa_id)
                    REFERENCES instalaciones (codigo, empresa_id) 
            );
        `);
        console.log('"diferido" table created successfully.');

        await AppDataSource.destroy();
    } catch (err) {
        console.error('Error during Data Source initialization or table creation:', err);
        process.exit(1);
    }
}

createTable();
