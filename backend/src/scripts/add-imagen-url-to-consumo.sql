-- Agregar columna para URL de imagen del medidor
-- Estructura: empresa_{id}/año/mes/instalacion.jpg
ALTER TABLE consumo ADD COLUMN imagen_url VARCHAR(500) NULL;

-- Comentario descriptivo
COMMENT ON COLUMN consumo.imagen_url IS 'Ruta relativa a imagen: empresa_{id}/año/mes/instalacion.jpg';

-- Verificar cambio
SELECT column_name, data_type, is_nullable, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'consumo' AND column_name = 'imagen_url';

-- Mensaje de confirmación
SELECT 'Columna imagen_url agregada exitosamente a la tabla consumo' as mensaje;
