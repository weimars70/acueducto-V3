-- Script SQL para crear las tablas necesarias para la gestión de contactos de terceros

-- 1. Crear tabla de tipos de contacto (si no existe)
CREATE TABLE IF NOT EXISTS public.contactos_tipo (
    codigo SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE(nombre)
);

-- 2. Insertar tipos de contacto por defecto
INSERT INTO public.contactos_tipo (nombre, descripcion) VALUES
    ('Principal', 'Contacto principal de la empresa'),
    ('Administrativo', 'Contacto del área administrativa'),
    ('Financiero', 'Contacto del área financiera'),
    ('Comercial', 'Contacto del área comercial'),
    ('Técnico', 'Contacto del área técnica'),
    ('Legal', 'Contacto del área legal')
ON CONFLICT (nombre) DO NOTHING;

-- 3. Crear tabla de contactos de terceros
CREATE TABLE IF NOT EXISTS public.terceros_contactos (
    codigo SERIAL PRIMARY KEY,
    tercero_codigo INTEGER NOT NULL,
    tipo_contacto INTEGER,
    nombre VARCHAR(150),
    telefono VARCHAR(50),
    direccion VARCHAR(255),
    correo VARCHAR(100),
    comentario TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign keys
    CONSTRAINT fk_tercero
        FOREIGN KEY (tercero_codigo)
        REFERENCES public.terceros (codigo)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_tipo_contacto
        FOREIGN KEY (tipo_contacto)
        REFERENCES public.contactos_tipo (codigo)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- 4. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_terceros_contactos_tercero
    ON public.terceros_contactos (tercero_codigo);

CREATE INDEX IF NOT EXISTS idx_terceros_contactos_tipo
    ON public.terceros_contactos (tipo_contacto);

-- 5. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_terceros_contactos_updated_at ON public.terceros_contactos;
CREATE TRIGGER update_terceros_contactos_updated_at
    BEFORE UPDATE ON public.terceros_contactos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Comentarios en las tablas
COMMENT ON TABLE public.contactos_tipo IS 'Catálogo de tipos de contacto (Principal, Administrativo, Financiero, etc.)';
COMMENT ON TABLE public.terceros_contactos IS 'Contactos asociados a terceros (clientes/proveedores)';
COMMENT ON COLUMN public.terceros_contactos.tercero_codigo IS 'Referencia al tercero (cliente/proveedor)';
COMMENT ON COLUMN public.terceros_contactos.tipo_contacto IS 'Tipo de contacto (Principal, Administrativo, etc.)';
