-- Script de verificación de parámetros de nómina
-- Ejecuta este script para verificar el estado de la tabla

-- 1. Verificar si la tabla existe
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'parametros_nomina'
) as tabla_existe;

-- 2. Contar registros en la tabla
SELECT COUNT(*) as total_parametros FROM parametros_nomina;

-- 3. Ver todos los registros actuales
SELECT * FROM parametros_nomina ORDER BY anio DESC, codigo;

-- 4. Ver años disponibles
SELECT DISTINCT anio FROM parametros_nomina ORDER BY anio DESC;
