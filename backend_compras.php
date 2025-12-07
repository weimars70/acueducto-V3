/**
 * blank_backend_compras.php
 * Asegúrate que NO haya ningún espacio o salto de línea ANTES de este comentario
 */

// IMPORTANTE: No debe haber NADA antes de esta línea
header('Content-Type: application/json; charset=utf-8');

// Capturar errores de PHP
error_reporting(E_ALL);
ini_set('display_errors', 0); // No mostrar errores en pantalla
ini_set('log_errors', 1);

// Función para responder siempre en JSON
function responderJSON($data) {
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Capturar errores fatales
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        responderJSON([
            'ok' => false,
            'mensaje' => 'Error fatal: ' . $error['message'],
            'file' => $error['file'],
            'line' => $error['line']
        ]);
    }
});

try {
    // Obtener la acción
    $action = $_POST['action'] ?? $_GET['action'] ?? '';

    
    if (empty($action)) {
        responderJSON(['ok' => false, 'mensaje' => 'Acción no especificada']);
    }
    
    switch($action) {
        
        // ========== CARGAR PROVEEDORES ==========
        case 'proveedores':
            $sql = "SELECT codigo, identificacion, nombre FROM terceros WHERE proveedor = true ORDER BY nombre";
            sc_lookup(dataset, $sql);
           
            
            if (isset({dataset}) && is_array({dataset})) {
                foreach({dataset} as $row) {
                    $result[] = [
                        'codigo' => $row[0],
                        'identificacion' => $row[1],
                        'nombre' => $row[2]
                    ];
                }
            }
            responderJSON($result);
            break;
            
        // ========== CARGAR ITEMS ==========
        case 'items':
            $sql = "SELECT codigo, nombre, precio_sin_iva, por_iva, precio_total, precio_venta FROM public.items ORDER BY nombre";
            sc_lookup(dataset, $sql);
            
            $result = [];
            if (isset({dataset}) && is_array({dataset})) {
                foreach({dataset} as $row) {
                    $result[] = [
                        'codigo' => $row[0],
                        'nombre' => $row[1],
                        'precio_sin_iva' => $row[2],
                        'por_iva' => $row[3],
                        'precio_total' => $row[4],
                        'precio_venta' => $row[5]
                    ];
                }
            }
            responderJSON($result);
            break;
            
        // ========== GUARDAR COMPRA ==========
        case 'guardar':
			try {
				// 🔹 1. Leer datos desde POST o JSON (php://input)
				if (!isset($_POST['data'])) {
					$input = file_get_contents('php://input');
					$data = json_decode($input, true);

					if (!$data) {
						responderJSON(['ok' => false, 'mensaje' => 'No se recibieron datos válidos']);
					}
				} else {
					$data = json_decode($_POST['data'], true);
				}

				if (json_last_error() !== JSON_ERROR_NONE) {
					responderJSON(['ok' => false, 'mensaje' => 'Error al decodificar JSON: ' . json_last_error_msg()]);
				}

				// 🔹 2. Validar campos obligatorios
				$requeridos = ['proveedor', 'factura', 'forma_pago', 'fecha', 'total'];
				foreach ($requeridos as $campo) {
					if (empty($data[$campo])) {
						responderJSON(['ok' => false, 'mensaje' => "El campo '$campo' es obligatorio"]);
					}
				}

				// 🔹 3. Preparar JSONB para la función PostgreSQL
				$json_pg = json_encode([
					'action' => 'guardar',
					'data'   => $data
				], JSON_UNESCAPED_UNICODE);
				
				
				// Escapar correctamente para SQL
				$json_pg = str_replace("'", "''", $json_pg);

				// 🔹 4. Ejecutar la función con sc_lookup
				$sql = "SELECT public.func_guardar_compra('{$json_pg}'::jsonb) AS resultado";
				
				sc_lookup(ds, $sql);

				// 🔹 5. Verificar error de ejecución
				if ({ds} === false) {
					responderJSON([
						'ok' => false,
						'mensaje' => 'Error al ejecutar la función',
						'sql' => $sql,
						'error' => {erro}
					]);
				}

				// 🔹 6. Decodificar la respuesta de la función
				$resultado = {ds[0][0]};
				$decoded = json_decode($resultado, true);

				if (json_last_error() !== JSON_ERROR_NONE) {
					responderJSON([
						'ok' => false,
						'mensaje' => 'Error al decodificar respuesta JSON de la función',
						'resultado' => $resultado
					]);
				}

				responderJSON($decoded);

			} catch (Exception $e) {
				responderJSON([
					'ok' => false,
					'mensaje' => 'Error general: ' . $e->getMessage(),
					'trace' => $e->getTraceAsString()
				]);
			}

			
            /* Insertar cabecera de compra
            $sql = "INSERT INTO compras (proveedor, factura, forma_pago, plazo, fecha_factura, subtotal, descuento, iva, total)
                    VALUES ($proveedor, $factura, $forma_pago, $plazo, $fecha, $subtotal, $descuento, $iva, $total)
                    RETURNING codigo";
            
            sc_lookup(ds, $sql);

			if ({ds} === false) {
				responderJSON([
					'ok' => false,
					'mensaje' => {erro},
					'sql' => $sql
				]);
			}

			$codigo_compra = {ds[0][0]};

			if (!$codigo_compra) {
				responderJSON(['ok' => false, 'mensaje' => 'No se pudo obtener el código de la compra']);
			}
            
            // Insertar detalles
            foreach($data['items'] as $it) {
                $item_codigo = sc_sql_injection($it['codigo']);
                $cantidad = !empty($it['cantidad']) ? floatval($it['cantidad']) : 0;
                $precio = !empty($it['pcompra']) ? floatval($it['pcompra']) : 0;
                $item_descuento = !empty($it['descuento']) ? floatval($it['descuento']) : 0;
                $item_iva = !empty($it['por_iva']) ? floatval($it['por_iva']) : 0;
                $item_subtotal = !empty($it['subtotal']) ? floatval($it['subtotal']) : 0;
                
                $sqlDet = "INSERT INTO compras_detalle (codigo_compra, item, cantidad, precio, descuento, iva, subtotal)
                           VALUES ($codigo_compra, $item_codigo, $cantidad, $precio, $item_descuento, $item_iva, $item_subtotal)";
                
                sc_exec_sql($sqlDet);
                
                if ({erro} != "") {
                    responderJSON([
                        'ok' => false,
                        'mensaje' => 'Error al guardar detalle: ' . {erro},
                        'sql' => $sqlDet
                    ]);
                }
            }
            
            // Insertar movimiento contable
            $sqlMov = "INSERT INTO compras_movimientos (codigo_compra, factura, credito, fecha)
                       VALUES ($codigo_compra, $factura, $total, $fecha)";
            
            sc_exec_sql($sqlMov);
            
            if ({erro} != "") {
                responderJSON([
                    'ok' => false,
                    'mensaje' => 'Error al guardar movimiento: ' . {erro},
                    'sql' => $sqlMov
                ]);
            }
            
            // Todo exitoso
            responderJSON([
                'ok' => true,
                'mensaje' => 'Compra guardada correctamente',
                'codigo_compra' => $codigo_compra
            ]);
            break;*/
            
        default:
            responderJSON(['ok' => false, 'mensaje' => 'Acción no válida: ' . $action]);
            break;
    }
    
} catch (Exception $e) {
    responderJSON([
        'ok' => false,
        'mensaje' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
// NO DEBE HABER NADA DESPUÉS DE ESTA LÍNEA (ni espacios, ni saltos de línea)