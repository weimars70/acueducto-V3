-- Tabla para parametrizar tipos de ajuste de inventario
CREATE TABLE IF NOT EXISTS tipos_ajuste_inventario (
    codigo SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    suma_unidades BOOLEAN NOT NULL DEFAULT FALSE,
    resta_unidades BOOLEAN NOT NULL DEFAULT FALSE,
    valor_unidades BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_only_one_operation CHECK (
        (suma_unidades::int + resta_unidades::int + valor_unidades::int) = 1
    )
);

-- Comentarios de documentación
COMMENT ON TABLE tipos_ajuste_inventario IS 'Tipos de ajuste de inventario parametrizados';
COMMENT ON COLUMN tipos_ajuste_inventario.codigo IS 'Código único autoincremental';
COMMENT ON COLUMN tipos_ajuste_inventario.nombre IS 'Nombre descriptivo del tipo de ajuste';
COMMENT ON COLUMN tipos_ajuste_inventario.suma_unidades IS 'Indica si el ajuste suma unidades al inventario';
COMMENT ON COLUMN tipos_ajuste_inventario.resta_unidades IS 'Indica si el ajuste resta unidades del inventario';
COMMENT ON COLUMN tipos_ajuste_inventario.valor_unidades IS 'Indica si el ajuste establece un valor exacto de unidades';
COMMENT ON CONSTRAINT check_only_one_operation ON tipos_ajuste_inventario IS 'Garantiza que solo uno de los tres booleanos sea true';

-- Insertar tipos de ajuste predeterminados
INSERT INTO tipos_ajuste_inventario (nombre, suma_unidades, resta_unidades, valor_unidades) VALUES
('Entrada por Compra', TRUE, FALSE, FALSE),
('Salida por Venta', FALSE, TRUE, FALSE),
('Inventario Inicial', FALSE, FALSE, TRUE),
('Devolución de Cliente', TRUE, FALSE, FALSE),
('Daño o Pérdida', FALSE, TRUE, FALSE),
('Ajuste por Conteo Físico', FALSE, FALSE, TRUE);

-- Índices para mejorar rendimiento
CREATE INDEX idx_tipos_ajuste_activo ON tipos_ajuste_inventario(activo) WHERE activo = TRUE;
CREATE INDEX idx_tipos_ajuste_nombre ON tipos_ajuste_inventario(nombre);
