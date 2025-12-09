-- Script para crear la tabla ajustes_inventario
-- Este script debe ejecutarse en la base de datos PostgreSQL

CREATE TABLE IF NOT EXISTS public.ajustes_inventario (
    id SERIAL PRIMARY KEY,
    id_item INTEGER NOT NULL,
    item_codigo TEXT,
    item_nombre TEXT NOT NULL,
    tipo_ajuste VARCHAR(10) NOT NULL CHECK (tipo_ajuste IN ('+', '-')),
    cantidad NUMERIC(12, 2) NOT NULL,
    inventario_anterior NUMERIC(12, 2) NOT NULL,
    inventario_nuevo NUMERIC(12, 2) NOT NULL,
    motivo TEXT,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario TEXT NOT NULL,
    empresa_id INTEGER NOT NULL,
    CONSTRAINT fk_item FOREIGN KEY (id_item, empresa_id) REFERENCES public.items(id, empresa_id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_ajustes_inventario_item ON public.ajustes_inventario(id_item);
CREATE INDEX IF NOT EXISTS idx_ajustes_inventario_empresa ON public.ajustes_inventario(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ajustes_inventario_fecha ON public.ajustes_inventario(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_ajustes_inventario_tipo ON public.ajustes_inventario(tipo_ajuste);

-- Comentarios de la tabla
COMMENT ON TABLE public.ajustes_inventario IS 'Registro de ajustes de inventario (entradas y salidas manuales)';
COMMENT ON COLUMN public.ajustes_inventario.tipo_ajuste IS 'Tipo de ajuste: + para entrada, - para salida';
COMMENT ON COLUMN public.ajustes_inventario.cantidad IS 'Cantidad del ajuste';
COMMENT ON COLUMN public.ajustes_inventario.inventario_anterior IS 'Inventario antes del ajuste';
COMMENT ON COLUMN public.ajustes_inventario.inventario_nuevo IS 'Inventario después del ajuste';
