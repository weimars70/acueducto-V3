// Script para agregar exportación a múltiples páginas
// Este archivo documenta los cambios necesarios para cada página

const pagesToUpdate = [
    {
        file: 'MovimientosInventarioPage.vue',
        dataVar: 'filteredMovimientos',
        filename: 'movimientos_inventario',
        title: 'Listado de Movimientos de Inventario',
        columns: [
            { field: 'id_movimiento', label: 'ID' },
            { field: 'fecha_movimiento', label: 'Fecha' },
            { field: 'nombre', label: 'Item' },
            { field: 'n_tipo_movimiento', label: 'Tipo Movimiento' },
            { field: 'cantidad', label: 'Cantidad' },
            { field: 'estado', label: 'Estado' }
        ]
    },
    {
        file: 'TercerosPage.vue',
        dataVar: 'filteredTerceros',
        filename: 'terceros',
        title: 'Listado de Terceros',
        columns: [
            { field: 'codigo', label: 'Código' },
            { field: 'nombre', label: 'Nombre' },
            { field: 'identificacion', label: 'Identificación' },
            { field: 'ciudad_nombre', label: 'Ciudad' },
            { field: 'telefono', label: 'Teléfono' },
            { field: 'email', label: 'Email' }
        ]
    },
    {
        file: 'ItemsPage.vue',
        dataVar: 'filteredItems',
        filename: 'items',
        title: 'Listado de Items',
        columns: [
            { field: 'codigo', label: 'Código' },
            { field: 'nombre', label: 'Nombre' },
            { field: 'grupo_nombre', label: 'Grupo' }
        ]
    }
];

// Los cambios a realizar en cada archivo son:
// 1. Importar useExport
// 2. Inicializar composable
// 3. Agregar funciones handleExportExcel y handleExportPDF
// 4. Agregar botones en el template
// 5. Agregar estilos CSS
