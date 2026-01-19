CREATE OR REPLACE VIEW view_empleados_detallados AS
SELECT 
    e.id,
    e.cedula,
    e.nombre_completo,
    e.primer_nombre,
    e.otros_nombres,
    e.primer_apellido,
    e.segundo_apellido,
    e.salario_mensual,
    e.auxilio_transporte,
    e.activo,
    e.fecha_ingreso,
    e.fecha_retiro,
    e.cargo,
    e.email,
    e.usuario,
    e.direccion,
    e.municipio_id,
    ciu.nombre AS municipio_nombre,
    e.tipo_documento_id,
    ti.nombre AS tipo_documento_nombre,
    e.tipo_trabajador_id,
    tt.descripcion AS tipo_trabajador_nombre,
    e.subtipo_trabajador_id,
    stt.descripcion AS subtipo_trabajador_nombre,
    e.tipo_contrato_id,
    tc.nombre AS tipo_contrato_nombre,
    e.metodo_pago_id,
    fp.descripcion AS forma_pago_nombre,
    e.banco AS banco_id,
    ba.nombre AS banco_nombre,
    e.tipo_cuenta AS tipo_cuenta_id,
    tcu.nombre AS tipo_cuenta_nombre,
    e.numero_cuenta,
    e.alto_riesgo_pension,
    e.salario_integral,
    e.empresa_id,
    e.fecha_creacion,
    e.usuario_creacion
FROM public.empleados e
LEFT JOIN public.tipo_ident ti ON e.tipo_documento_id = ti.codigo AND e.empresa_id = ti.empresa_id
LEFT JOIN public.ciudades ciu ON e.municipio_id::text = ciu.codigo::text
LEFT JOIN public.tipo_trabajador tt ON e.tipo_trabajador_id = tt.id_tipo_trabajador AND e.empresa_id = tt.empresa_id
LEFT JOIN public.subtipo_trabajador stt ON e.subtipo_trabajador_id = stt.id_subtipo_trabajador AND e.empresa_id = stt.empresa_id
LEFT JOIN public.tipo_contrato tc ON e.tipo_contrato_id = tc.id AND e.empresa_id = tc.empresa_id
LEFT JOIN public.formas_pagos fp ON e.metodo_pago_id = fp.codigo AND e.empresa_id = fp.empresa_id
LEFT JOIN public.bancos ba ON e.banco = ba.id
LEFT JOIN public.tipo_cuenta tcu ON e.tipo_cuenta = tcu.id AND e.empresa_id = tcu.empresa_id;
