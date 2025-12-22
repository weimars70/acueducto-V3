-- Script para agregar columnas inv_valor_compra e inv_valor_venta a la tabla items
-- Fecha: 2025-12-21

-- Agregar columna inv_valor_compra
ALTER TABLE items
ADD COLUMN IF NOT EXISTS inv_valor_compra NUMERIC(12, 2) DEFAULT 0;

-- Agregar columna inv_valor_venta
ALTER TABLE items
ADD COLUMN IF NOT EXISTS inv_valor_venta NUMERIC(12, 2) DEFAULT 0;

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, numeric_precision, numeric_scale, column_default
FROM information_schema.columns
WHERE table_name = 'items'
  AND column_name IN ('inv_valor_compra', 'inv_valor_venta');
