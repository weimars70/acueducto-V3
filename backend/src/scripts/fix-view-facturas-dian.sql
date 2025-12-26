-- Script para corregir la vista view_facturas_dian
-- Cambia la columna m3_0_20 por basico

-- Paso 1: Ver la definición actual de la vista
SELECT pg_get_viewdef('view_facturas_dian', true);

-- Paso 2: Después de ver la definición, elimina la vista actual
DROP VIEW IF EXISTS view_facturas_dian;

-- Paso 3: Recrea la vista con el cambio de m3_0_20 a basico
-- IMPORTANTE: Copia la definición del SELECT que obtuviste en el Paso 1,
-- reemplaza TODAS las ocurrencias de 'm3_0_20' por 'basico' y pégala aquí:

-- Ejemplo (debes usar tu definición real):
-- CREATE OR REPLACE VIEW view_facturas_dian AS
-- SELECT
--   ...tus columnas...
--   basico,  -- <-- cambió de m3_0_20 a basico
--   ...más columnas...
-- FROM facturas f
-- JOIN ...tus joins...;

-- Nota: Ejecuta primero el SELECT pg_get_viewdef para obtener la definición completa,
-- luego reemplaza m3_0_20 por basico en todo el query y ejecuta el CREATE OR REPLACE VIEW
