import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../../.env') });

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER?.replace(/'/g, ''),
    password: process.env.POSTGRES_PASSWORD?.replace(/'/g, ''),
    database: process.env.POSTGRES_DB,
});

async function runMigrations() {
    try {
        console.log('Conectando a la base de datos...');
        await dataSource.initialize();
        console.log('Conectado exitosamente!');

        const queryRunner = dataSource.createQueryRunner();

        // Leer y ejecutar create-tipos-ajuste-inventario.sql
        console.log('\n=== Ejecutando create-tipos-ajuste-inventario.sql ===');
        const createTiposSQL = fs.readFileSync(
            path.join(__dirname, 'create-tipos-ajuste-inventario.sql'),
            'utf8'
        );
        await queryRunner.query(createTiposSQL);
        console.log('✓ Tabla tipos_ajuste_inventario creada con datos iniciales');

        // Leer y ejecutar alter-ajustes-inventario.sql
        console.log('\n=== Ejecutando alter-ajustes-inventario.sql ===');
        const alterAjustesSQL = fs.readFileSync(
            path.join(__dirname, 'alter-ajustes-inventario.sql'),
            'utf8'
        );
        await queryRunner.query(alterAjustesSQL);
        console.log('✓ Tabla ajustes_inventario actualizada con nueva columna');

        console.log('\n✅ Todas las migraciones se ejecutaron correctamente!');

        await queryRunner.release();
        await dataSource.destroy();
    } catch (error) {
        console.error('❌ Error ejecutando migraciones:', error);
        process.exit(1);
    }
}

runMigrations();
