-- Script para crear la vista view_usuarios_empresa
-- Esta vista une usuarios con empresas para el login multi-empresa
-- Fecha: 2025-12-21

-- Eliminar la vista si existe (para poder recrearla)
DROP VIEW IF EXISTS view_usuarios_empresa;

-- Crear la vista que une usuarios con empresas
CREATE VIEW view_usuarios_empresa AS
SELECT
    u.empresa_id,
    e.nombre AS empresa,
    u.email
FROM usuarios u
INNER JOIN empresas e ON u.empresa_id = e.id
WHERE u.active = true;

-- Verificar que la vista se creó correctamente
SELECT * FROM view_usuarios_empresa LIMIT 5;
