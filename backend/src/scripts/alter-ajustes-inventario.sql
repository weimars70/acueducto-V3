-- Agregar columna para referencia al tipo de ajuste parametrizado
ALTER TABLE ajustes_inventario
ADD COLUMN IF NOT EXISTS codigo_tipo_ajuste INT;

-- Crear constraint de foreign key
ALTER TABLE ajustes_inventario
ADD CONSTRAINT fk_tipo_ajuste
FOREIGN KEY (codigo_tipo_ajuste)
REFERENCES tipos_ajuste_inventario(codigo)
ON DELETE RESTRICT;

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_ajustes_tipo
ON ajustes_inventario(codigo_tipo_ajuste);

-- Comentario de documentación
COMMENT ON COLUMN ajustes_inventario.codigo_tipo_ajuste IS 'Código del tipo de ajuste parametrizado (FK a tipos_ajuste_inventario)';

-- Migrar datos existentes (mapear tipos legacy a nuevos tipos)
-- Nota: Ajustar según los códigos que se generen al insertar tipos_ajuste_inventario
UPDATE ajustes_inventario
SET codigo_tipo_ajuste = (
    CASE
        WHEN tipo_ajuste = '+' THEN (SELECT codigo FROM tipos_ajuste_inventario WHERE nombre = 'Entrada por Compra' LIMIT 1)
        WHEN tipo_ajuste = '-' THEN (SELECT codigo FROM tipos_ajuste_inventario WHERE nombre = 'Salida por Venta' LIMIT 1)
        WHEN tipo_ajuste = 'inicial' THEN (SELECT codigo FROM tipos_ajuste_inventario WHERE nombre = 'Inventario Inicial' LIMIT 1)
    END
)
WHERE codigo_tipo_ajuste IS NULL;
