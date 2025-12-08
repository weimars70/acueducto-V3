CREATE OR REPLACE FUNCTION public.func_guardar_salida (
  _data jsonb
)
RETURNS jsonb LANGUAGE 'plpgsql'
VOLATILE
CALLED ON NULL INPUT
SECURITY INVOKER
PARALLEL UNSAFE
COST 100
AS
$body$
DECLARE
    v_codigo_salida INTEGER;
    v_cliente INTEGER;
    v_factura TEXT;
    v_forma_pago INTEGER;
    v_plazo INTEGER;
    v_fecha DATE;
    v_subtotal NUMERIC;
    v_descuento NUMERIC;
    v_iva NUMERIC;
    v_total NUMERIC;
    v_item JSONB;
BEGIN
    -- Extraer cabecera
    _data := replace(_data::text, '"psalida "', '"psalida"')::jsonb;
	_data := replace(_data::text, '"por_iva "', '"por_iva"')::jsonb;
	_data := replace(_data::text, '"cantidad "', '"cantidad"')::jsonb;
    _data := replace(_data::text, '"descuento "', '"descuento"')::jsonb;
	_data := replace(_data::text, '"subtotal "', '"subtotal"')::jsonb;
    _data := replace(_data::text, '"obs "', '"obs"')::jsonb;
    
    --raise exception '_data:::: %', _data;
    v_cliente := (_data->'data'->>'cliente');

    select into v_factura COALESCE( max(codigo),0) from salidas;
    v_forma_pago = 0;
    v_plazo := COALESCE((_data->'data'->>'plazo')::INTEGER, 0);
    v_fecha := (_data->'data'->>'fecha')::DATE;
    v_subtotal := COALESCE((_data->'data'->>'subtotal')::NUMERIC, 0);
    v_descuento := COALESCE((_data->'data'->>'descuento')::NUMERIC, 0);
    v_iva := COALESCE((_data->'data'->>'iva')::NUMERIC, 0);
    v_total := COALESCE((_data->'data'->>'total')::NUMERIC, 0);

    IF v_cliente IS NULL THEN
        RAISE EXCEPTION 'Debe indicar un cliente';
    END IF;

    IF jsonb_array_length(_data->'items') = 0 THEN
        RAISE EXCEPTION 'Debe agregar al menos un ítem';
    END IF;

    -- Insertar cabecera
    INSERT INTO salidas (cliente, cliente_ident,cliente_nombre,factura, forma_pago, plazo, fecha_factura, subtotal, descuento, iva, total,observacion)
    VALUES (v_cliente,func_ident_tercero(v_cliente), func_nombre_tercero(v_cliente), v_factura, v_forma_pago, v_plazo, v_fecha,
     v_subtotal, v_descuento, v_iva, v_total,(_data->'data'->>'obs')::text)
    RETURNING codigo INTO v_codigo_salida;

    -- Insertar detalle
    FOR v_item IN SELECT * FROM jsonb_array_elements(_data->'data'->'items')
    LOOP
    	--RAISE NOTICE 'item.codigo:: %', (v_item->>'codigo');
        --RAISE NOTICE 'item.codigo:: %', (trim(v_item->>'por_iva'));
        INSERT INTO  public.salidas_detalle(codigo_salida, item, item_descripcion, iva, precio, descuento, cantidad, subtotal)
        VALUES (
            v_codigo_salida,
            (v_item->>'codigo'),
            func_nombre_item(v_item->>'codigo'),
            COALESCE((v_item->>'por_iva')::NUMERIC, 0),
            COALESCE((v_item->>'psalida')::NUMERIC, 0),
            COALESCE((v_item->>'descuento')::NUMERIC, 0),
            COALESCE((v_item->>'cantidad')::NUMERIC, 0),
            COALESCE((v_item->>'subtotal')::NUMERIC, 0)
        );
        
        INSERT INTO  public.movimientos_inventario(id_item,tipo_movimiento, cantidad,fecha_movimiento,observaciones, fecha_registro)
		VALUES (func_id_item((v_item->>'codigo')),2,COALESCE((v_item->>'cantidad')::NUMERIC, 0),v_fecha,'salidas',CURRENT_DATE);

 
     
    END LOOP;

    -- Insertar movimiento contable
    INSERT INTO salidas_movimientos (codigo_salida, factura, credito, fecha)
    VALUES (v_codigo_salida, v_factura, v_total, v_fecha);

    -- Retornar resultado
    RETURN jsonb_build_object(
        'ok', true,
        'mensaje', 'Salida guardada correctamente',
        'codigo_salida', v_codigo_salida
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'ok', false,
        'mensaje', SQLERRM
    );
END;
$body$;
 