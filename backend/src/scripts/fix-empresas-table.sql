-- Script para sincronizar tabla empresas con el código
-- Ejecutar en producción

-- 1. Ver columnas actuales
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'empresas'
ORDER BY ordinal_position;

-- 2. Eliminar columnas que NO están en la entidad Empresa.entity.ts
-- pero SÍ están en la tabla de producción
ALTER TABLE empresas DROP COLUMN IF EXISTS clave;
ALTER TABLE empresas DROP COLUMN IF EXISTS email;
ALTER TABLE empresas DROP COLUMN IF EXISTS usuario;

-- 3. Renombrar columnas si es necesario para que coincidan con el código
-- La entidad espera 'whatsapp_api_key' pero en la tabla podría estar como 'wkey'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'empresas' AND column_name = 'wkey'
    ) THEN
        ALTER TABLE empresas RENAME COLUMN wkey TO whatsapp_api_key;
    END IF;
END $$;

-- 4. Verificar estructura final
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'empresas'
ORDER BY ordinal_position;
