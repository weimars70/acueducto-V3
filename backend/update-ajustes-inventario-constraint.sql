-- Script para actualizar la constraint de tipo_ajuste en ajustes_inventario
-- Este script agrega soporte para 'inicial' además de '+' y '-'

-- 1. Eliminar la constraint existente
ALTER TABLE public.ajustes_inventario
DROP CONSTRAINT IF EXISTS ajustes_inventario_tipo_ajuste_check;

-- 2. Crear la nueva constraint que acepta '+', '-' e 'inicial'
ALTER TABLE public.ajustes_inventario
ADD CONSTRAINT ajustes_inventario_tipo_ajuste_check
CHECK (tipo_ajuste IN ('+', '-', 'inicial'));

-- Verificar que la constraint se creó correctamente
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.ajustes_inventario'::regclass
AND conname = 'ajustes_inventario_tipo_ajuste_check';
