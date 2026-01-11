import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useTabsStore } from '../stores/tabs';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    component: () => import('../pages/DashboardPage.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        component: () => import('../components/DashboardHome.vue')
      },
      {
        path: '/consumptions',
        component: () => import('../pages/ConsumptionsPage.vue')
      },
      {
        path: '/consumptions/new',
        component: () => import('../pages/NewConsumptionPage.vue')
      },
      {
        path: '/consumptions/edit/:id',
        name: 'edit-consumption',
        component: () => import('../pages/EditConsumptionPage.vue'),
        props: true
      },
      {
        path: '/monthly-readings',
        component: () => import('../pages/MonthlyReadingsPage.vue')
      },
      {
        path: '/sync-data',
        component: () => import('../pages/SyncDataPage.vue')
      },
      {
        path: '/subsidies',
        component: () => import('../pages/SubsidiesPage.vue')
      },
      {
        path: '/sectores',
        component: () => import('../pages/SectoresPage.vue')
      },
      {
        path: '/sectores/new',
        component: () => import('../pages/NewSectorPage.vue')
      },
      {
        path: '/sectores/edit/:id',
        name: 'edit-sector',
        component: () => import('../pages/EditSectorPage.vue'),
        props: true
      },
      {
        path: '/profesiones',
        component: () => import('../pages/ProfesionesPage.vue')
      },
      {
        path: '/profesiones/new',
        component: () => import('../pages/NewProfesionPage.vue')
      },
      {
        path: '/profesiones/edit/:id',
        name: 'edit-profesion',
        component: () => import('../pages/EditProfesionPage.vue'),
        props: true
      },
      {
        path: '/tarifas',
        component: () => import('../pages/generic-capture/TarifasPage.vue')
      },
      {
        path: '/tarifas',
        component: () => import('../pages/generic-capture/TarifasPage.vue')
      },
      {
        path: '/bancos',
        component: () => import('../pages/BancosPage.vue')
      },
      {
        path: '/bancos/new',
        component: () => import('../pages/NewBancoPage.vue')
      },
      {
        path: '/bancos/edit/:id',
        name: 'edit-banco',
        component: () => import('../pages/EditBancoPage.vue'),
        props: true
      },
      {
        path: '/users',
        component: () => import('../pages/UsersPage.vue')
      },
      {
        path: '/users/new',
        component: () => import('../pages/NewUserPage.vue')
      },
      {
        path: '/users/edit/:id',
        name: 'edit-user',
        component: () => import('../pages/EditUserPage.vue'),
        props: true
      },
      {
        path: '/centro-costos',
        component: () => import('../pages/CentroCostosPage.vue')
      },
      {
        path: '/centro-costos/new',
        component: () => import('../pages/NewCentroCostosPage.vue')
      },
      {
        path: '/centro-costos/edit/:id',
        name: 'edit-centro-costos',
        component: () => import('../pages/EditCentroCostosPage.vue'),
        props: true
      },
      {
        path: '/ciudades',
        component: () => import('../pages/CiudadesPage.vue')
      },
      {
        path: '/ciudades/new',
        component: () => import('../pages/NewCiudadPage.vue')
      },
      {
        path: '/ciudades/edit/:codigo',
        name: 'edit-ciudad',
        component: () => import('../pages/EditCiudadPage.vue'),
        props: true
      },
      {
        path: '/clientes',
        component: () => import('../pages/ClientesPage.vue')
      },
      {
        path: '/clientes/new',
        component: () => import('../pages/NewClientePage.vue')
      },
      {
        path: '/clientes/edit/:codigo',
        name: 'edit-cliente',
        component: () => import('../pages/EditClientePage.vue'),
        props: true
      },
      {
        path: '/impuestos',
        component: () => import('../pages/ImpuestosPage.vue')
      },
      {
        path: '/impuestos/new',
        component: () => import('../pages/NewImpuestoPage.vue')
      },
      {
        path: '/impuestos/edit/:id',
        name: 'edit-impuesto',
        component: () => import('../pages/EditImpuestoPage.vue'),
        props: true
      },
      {
        path: '/marcas-medidor',
        component: () => import('../pages/MarcasMedidorPage.vue')
      },
      {
        path: '/marcas-medidor/new',
        component: () => import('../pages/NewMarcaMedidorPage.vue')
      },
      {
        path: '/marcas-medidor/edit/:codigo',
        name: 'edit-marca-medidor',
        component: () => import('../pages/EditMarcaMedidorPage.vue'),
        props: true
      },
      {
        path: '/prefactura',
        name: 'prefactura',
        component: () => import('../pages/PrefacturaPage.vue')
      },
      {
        path: '/facturas',
        name: 'facturas',
        component: () => import('../pages/FacturasPage.vue')
      },
      {
        path: '/facturar',
        name: 'facturar',
        component: () => import('../pages/FacturarPage.vue')
      },
      {
        path: '/enviar-dian',
        name: 'enviar-dian',
        component: () => import('../pages/EnviarDianPage.vue')
      },
      {
        path: '/instalaciones',
        name: 'instalaciones',
        component: () => import('../pages/InstallacionesPage.vue')
      },
      {
        path: '/instalaciones/new',
        name: 'new-instalacion',
        component: () => import('../pages/NewInstalacionPage.vue')
      },
      {
        path: '/instalaciones/edit/:codigo',
        name: 'edit-instalacion',
        component: () => import('../pages/EditInstalacionPage.vue'),
        props: true
      },
      {
        path: '/enviar-facturas-masivo',
        name: 'enviar-facturas-masivo',
        component: () => import('../pages/EnviarFacturasMasivoPage.vue')
      },
      {
        path: '/recibo-caja',
        name: 'recibo-caja',
        component: () => import('../pages/ReciboCajaPage.vue')
      },
      {
        path: '/recibos-caja-list',
        name: 'recibos-caja-list',
        component: () => import('../pages/ReciboCajaListPage.vue')
      },
      // Instalaciones Routes
      {
        path: '/instalaciones/saldos-a-favor',
        name: 'saldos-a-favor',
        component: () => import('../pages/SaldosAFavorPage.vue')
      },
      {
        path: '/instalaciones/saldos-a-favor/nuevo',
        name: 'new-saldo-a-favor',
        component: () => import('../pages/NewSaldoAFavorPage.vue')
      },
      {
        path: '/items-grupos',
        component: () => import('../pages/ItemsGruposPage.vue')
      },
      {
        path: '/items-grupos/new',
        component: () => import('../pages/NewItemGrupoPage.vue')
      },
      {
        path: '/items-grupos/edit/:id',
        name: 'edit-items-grupos',
        component: () => import('../pages/EditItemGrupoPage.vue'),
        props: true
      },
      {
        path: '/tipo-movimiento-item',
        component: () => import('../pages/TipoMovimientoItemPage.vue')
      },
      {
        path: '/tipo-movimiento-item/new',
        component: () => import('../pages/NewTipoMovimientoItemPage.vue')
      },
      {
        path: '/tipo-movimiento-item/edit/:id',
        name: 'edit-tipo-movimiento-item',
        component: () => import('../pages/EditTipoMovimientoItemPage.vue'),
        props: true
      },
      {
        path: '/items',
        component: () => import('../pages/ItemsPage.vue')
      },
      {
        path: '/items/new',
        component: () => import('../pages/NewItemPage.vue')
      },
      {
        path: '/items/edit/:id',
        name: 'edit-items',
        component: () => import('../pages/EditItemPage.vue'),
        props: true
      },
      {
        path: '/movimientos-inventario',
        component: () => import('../pages/MovimientosInventarioPage.vue')
      },
      {
        path: '/salidas',
        component: () => import('../pages/SalidasPage.vue')
      },
      {
        path: '/salidas/new',
        component: () => import('../pages/NewSalidaPage.vue')
      },
      // Ajustes Inventario Routes
      {
        path: '/ajustes-inventario',
        name: 'ajustes-inventario',
        component: () => import('../pages/AjustesInventarioPage.vue')
      },
      {
        path: '/ajustes-inventario/nuevo',
        name: 'new-ajuste-inventario',
        component: () => import('../pages/NewAjusteInventarioPage.vue')
      },
      {
        path: '/ajustes-inventario/nuevo-multiple',
        name: 'new-ajuste-inventario-multiple',
        component: () => import('../pages/NewAjusteInventarioMultiplePage.vue')
      },
      {
        path: '/tipos-ajuste-inventario',
        name: 'tipos-ajuste-inventario',
        component: () => import('../pages/TiposAjusteInventarioPage.vue')
      },
      {
        path: '/tarifas-maestro',
        component: () => import('../pages/TarifasPage.vue')
      },
      {
        path: '/tarifas-maestro/new',
        component: () => import('../pages/NewTarifaPage.vue')
      },
      {
        path: '/tarifas-maestro/edit/:id',
        name: 'edit-tarifa',
        component: () => import('../pages/EditTarifaPage.vue'),
        props: true
      },
      {
        path: '/tipo-ident',
        component: () => import('../pages/TipoIdentPage.vue')
      },
      {
        path: '/tipo-ident/new',
        component: () => import('../pages/NewTipoIdentPage.vue')
      },
      {
        path: '/tipo-ident/edit/:codigo',
        name: 'edit-tipo-ident',
        component: () => import('../pages/EditTipoIdentPage.vue'),
        props: true
      },
      {
        path: '/tipo-impuesto',
        component: () => import('../pages/TipoImpuestoPage.vue')
      },
      {
        path: '/tipo-impuesto/new',
        component: () => import('../pages/NewTipoImpuestoPage.vue')
      },
      {
        path: '/tipo-impuesto/edit/:codigo',
        name: 'edit-tipo-impuesto',
        component: () => import('../pages/EditTipoImpuestoPage.vue'),
        props: true
      },
      // Tipo Persona Routes
      {
        path: '/tipo-persona',
        name: 'tipo-persona',
        component: () => import('../pages/TipoPersonaPage.vue')
      },
      {
        path: '/tipo-persona/new',
        name: 'new-tipo-persona',
        component: () => import('../pages/NewTipoPersonaPage.vue')
      },
      {
        path: '/tipo-persona/edit/:codigo',
        name: 'edit-tipo-persona',
        component: () => import('../pages/EditTipoPersonaPage.vue'),
        props: true
      },
      // Tipo Regimen Routes
      {
        path: '/tipo-regimen',
        name: 'tipo-regimen',
        component: () => import('../pages/TipoRegimenPage.vue')
      },
      {
        path: '/tipo-regimen/new',
        name: 'new-tipo-regimen',
        component: () => import('../pages/NewTipoRegimenPage.vue')
      },
      {
        path: '/tipo-regimen/edit/:codigo',
        name: 'edit-tipo-regimen',
        component: () => import('../pages/EditTipoRegimenPage.vue'),
        props: true
      },
      // Years Routes
      {
        path: '/years',
        name: 'years',
        component: () => import('../pages/YearsPage.vue')
      },
      {
        path: '/years/new',
        name: 'new-year',
        component: () => import('../pages/NewYearPage.vue')
      },
      {
        path: '/years/edit/:year',
        name: 'edit-year',
        component: () => import('../pages/EditYearPage.vue'),
        props: true
      },
      // Terceros Routes
      {
        path: '/terceros',
        name: 'terceros',
        component: () => import('../pages/TercerosPage.vue')
      },
      {
        path: '/terceros/new',
        name: 'new-tercero',
        component: () => import('../pages/NewTerceroPage.vue')
      },
      {
        path: '/terceros/edit/:codigo',
        name: 'edit-tercero',
        component: () => import('../pages/EditTerceroPage.vue'),
        props: true
      },
      // Conceptos Factura Routes
      {
        path: '/conceptos-factura',
        name: 'conceptos-factura',
        component: () => import('../pages/ConceptosFacturaPage.vue')
      },
      {
        path: '/conceptos-factura/nuevo',
        name: 'new-concepto-factura',
        component: () => import('../pages/NewConceptoFacturaPage.vue')
      },
      {
        path: '/conceptos-factura/editar/:id',
        name: 'edit-concepto-factura',
        component: () => import('../pages/EditConceptoFacturaPage.vue'),
        props: true
      },
      // Notas Conceptos Routes
      {
        path: '/notas-conceptos',
        name: 'notas-conceptos',
        component: () => import('../pages/NotasConceptosPage.vue')
      },
      {
        path: '/notas-conceptos/nuevo',
        name: 'new-nota-concepto',
        component: () => import('../pages/NewNotaConceptoPage.vue')
      },
      {
        path: '/notas-conceptos/editar/:id',
        name: 'edit-nota-concepto',
        component: () => import('../pages/EditNotaConceptoPage.vue'),
        props: true
      },
      // Notas Crédito Routes
      {
        path: '/notas-credito',
        name: 'notas-credito',
        component: () => import('../pages/NotasCreditoPage.vue')
      },
      {
        path: '/notas-credito/nuevo',
        name: 'new-nota-credito',
        component: () => import('../pages/NewNotaCreditoPage.vue')
      },
      {
        path: '/notas-credito/editar/:codigo/:empresaId',
        name: 'edit-nota-credito',
        component: () => import('../pages/EditNotaCreditoPage.vue'),
        props: true
      },
      // Notas Débito Conceptos Routes
      {
        path: '/notas-debito-conceptos',
        name: 'notas-debito-conceptos',
        component: () => import('../pages/NotasDebitoConceptosPage.vue')
      },
      {
        path: '/notas-debito-conceptos/nuevo',
        name: 'new-nota-debito-concepto',
        component: () => import('../pages/NewNotaDebitoConceptoPage.vue')
      },
      {
        path: '/notas-debito-conceptos/editar/:id',
        name: 'edit-nota-debito-concepto',
        component: () => import('../pages/EditNotaDebitoConceptoPage.vue'),
        props: true
      },
      // Notas Débito Routes
      {
        path: '/notas-debito',
        name: 'notas-debito',
        component: () => import('../pages/NotasDebitoPage.vue')
      },
      {
        path: '/notas-debito/nuevo',
        name: 'new-nota-debito',
        component: () => import('../pages/NewNotaDebitoPage.vue')
      },
      // Diferidos Routes
      {
        path: '/diferidos',
        name: 'diferidos',
        component: () => import('../pages/DiferidosPage.vue')
      },
      {
        path: '/diferidos/nuevo',
        name: 'new-diferido',
        component: () => import('../pages/NewDiferidoPage.vue')
      },
      {
        path: '/diferidos/editar/:id',
        name: 'edit-diferido',
        component: () => import('../pages/EditDiferidoPage.vue'),
        props: true
      },
      {
        path: '/diferidos/cuotas-conexion',
        name: 'cuotas-conexion',
        component: () => import('../pages/CuotasConexionPage.vue')
      },
      {
        path: '/diferidos/cuotas-medidor',
        name: 'cuotas-medidor',
        component: () => import('../pages/CuotasMedidorPage.vue')
      },
      {
        path: '/diferidos/acuerdos-pago',
        name: 'acuerdos-pago',
        component: () => import('../pages/AcuerdosPagoPage.vue')
      },
      // Estratos Routes
      {
        path: '/estratos',
        name: 'estratos',
        component: () => import('../pages/EstratosPage.vue')
      },
      {
        path: '/estratos/nuevo',
        name: 'new-estrato',
        component: () => import('../pages/NewEstratoPage.vue')
      },
      {
        path: '/estratos/editar/:id',
        name: 'edit-estrato',
        component: () => import('../pages/EditEstratoPage.vue'),
        props: true
      },
      // Estratos Tipo Routes
      {
        path: '/estratos-tipo',
        name: 'estratos-tipo',
        component: () => import('../pages/EstratosTipoPage.vue')
      },
      {
        path: '/estratos-tipo/nuevo',
        name: 'new-estrato-tipo',
        component: () => import('../pages/NewEstratoTipoPage.vue')
      },
      {
        path: '/estratos-tipo/editar/:codigo',
        name: 'edit-estrato-tipo',
        component: () => import('../pages/EditEstratoTipoPage.vue'),
        props: true
      },
      // Estratos Tarifas Routes
      {
        path: '/estratos-tarifas',
        type: 'estratos-tarifas',
        component: () => import('../pages/EstratosTarifasPage.vue')
      },
      {
        path: '/estratos-tarifas/nuevo',
        name: 'new-estrato-tarifa',
        component: () => import('../pages/NewEstratoTarifaPage.vue')
      },
      {
        path: '/estratos-tarifas/editar/:codigo/:tipo',
        name: 'edit-estrato-tarifa',
        component: () => import('../pages/EditEstratoTarifaPage.vue'),
        props: true
      },
      // Compras Routes
      {
        path: '/compras',
        name: 'compras',
        component: () => import('../pages/ComprasPage.vue')
      },
      {
        path: '/compras/new',
        name: 'new-compra',
        component: () => import('../pages/NewCompraPage.vue')
      },
      {
        path: '/compras/edit/:id',
        name: 'edit-compra',
        component: () => import('../pages/EditCompraPage.vue'),
        props: true
      },
      // Tipo Persona Routes
      {
        path: '/tipo-persona',
        component: () => import('../pages/TipoPersonaPage.vue')
      },
      {
        path: '/tipo-persona/new',
        component: () => import('../pages/NewTipoPersonaPage.vue')
      },
      {
        path: '/tipo-persona/edit/:codigo',
        name: 'edit-tipo-persona',
        component: () => import('../pages/EditTipoPersonaPage.vue'),
        props: true
      },
      // Empleados Routes
      {
        path: '/empleados',
        name: 'empleados',
        component: () => import('../pages/EmpleadosPage.vue')
      },
      {
        path: '/empleados/new',
        name: 'new-empleado',
        component: () => import('../pages/NewEmpleadoPage.vue')
      },
      {
        path: '/empleados/edit/:id',
        name: 'edit-empleado',
        component: () => import('../pages/EditEmpleadoPage.vue'),
        props: true
      },
      // Períodos Nómina Routes
      {
        path: '/periodos-nomina',
        name: 'periodos-nomina',
        component: () => import('../pages/PeriodosNominaPage.vue')
      },
      {
        path: '/periodos-nomina/new',
        name: 'new-periodo-nomina',
        component: () => import('../pages/NewPeriodoNominaPage.vue')
      },
      {
        path: '/periodos-nomina/edit/:id',
        name: 'edit-periodo-nomina',
        component: () => import('../pages/EditPeriodoNominaPage.vue'),
        props: true
      },
      // Conceptos Nómina Routes
      {
        path: '/conceptos-nomina',
        name: 'conceptos-nomina',
        component: () => import('../pages/ConceptosNominaPage.vue')
      },
      {
        path: '/conceptos-nomina/new',
        name: 'new-concepto-nomina',
        component: () => import('../pages/NewConceptoNominaPage.vue')
      },
      {
        path: '/conceptos-nomina/edit/:id',
        name: 'edit-concepto-nomina',
        component: () => import('../pages/EditConceptoNominaPage.vue'),
        props: true
      },
      // Parámetros de Nómina Routes
      {
        path: '/parametros-nomina',
        name: 'parametros-nomina',
        component: () => import('../pages/ParametrosNominaPage.vue')
      },
      {
        path: '/parametros-nomina/edit/:id',
        name: 'edit-parametro-nomina',
        component: () => import('../pages/EditParametroNominaPage.vue'),
        props: true
      },
      // Nóminas Routes
      {
        path: '/nominas',
        name: 'nominas',
        component: () => import('../pages/NominasPage.vue')
      },
      {
        path: '/nominas/calcular',
        name: 'calcular-nomina',
        component: () => import('../pages/CalcularNominaPage.vue')
      },
      {
        path: '/nominas/nuevo-calculo',
        name: 'nuevo-calculo-nomina',
        component: () => import('../pages/NuevoCalculoNominaPage.vue')
      },
      {
        path: '/nominas/:id',
        name: 'view-nomina',
        component: () => import('../pages/ViewNominaPage.vue'),
        props: true
      },
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const tabsStore = useTabsStore();
  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
    return;
  }

  if (to.path === '/login' && isAuthenticated) {
    next('/dashboard');
    return;
  }

  // Add tab when navigating to a route
  if (to.path !== '/login' && to.path !== '/dashboard' && to.path !== '/') {
    console.log('Router: attempting to navigate to:', to.path);
    const routeConfig = routes[2].children?.find(route => route.path === to.path);
    console.log('Router: found route config:', routeConfig);
    if (routeConfig) {
      // Get the menu item that corresponds to this route
      const menuItems = [
        { icon: 'dashboard', label: 'Dashboard', route: '/dashboard', closable: false },
        { icon: 'show_chart', label: 'Consumos', route: '/consumptions', closable: true },
        { icon: 'list_alt', label: 'Lecturas Mes', route: '/monthly-readings', closable: true },
        { icon: 'storage', label: 'Datos Sincronizados', route: '/sync-data', closable: true },
        { icon: 'request_quote', label: 'Subsidios', route: '/subsidies', closable: true },
        { icon: 'location_city', label: 'Sectores', route: '/sectores', closable: true },
        { icon: 'payments', label: 'Tarifas', route: '/tarifas', closable: true },
        { icon: 'group_work', label: 'Estratos', route: '/estratos', closable: true },
        { icon: 'shopping_cart', label: 'Compras', route: '/compras', closable: true },
        { icon: 'account_balance', label: 'Bancos', route: '/bancos', closable: true },
        { icon: 'account_tree', label: 'Centro de Costos', route: '/centro-costos', closable: true },
        { icon: 'location_city', label: 'Ciudades', route: '/ciudades', closable: true },
        { icon: 'people_alt', label: 'Clientes', route: '/clientes', closable: true },
        { icon: 'receipt', label: 'Impuestos', route: '/impuestos', closable: true },
        { icon: 'category', label: 'Items Grupos', route: '/items-grupos', closable: true },
        { icon: 'swap_horiz', label: 'Tipo Movimiento Item', route: '/tipo-movimiento-item', closable: true },
        { icon: 'inventory_2', label: 'Items', route: '/items', closable: true },
        { icon: 'list_alt', label: 'Listado Inventario', route: '/movimientos-inventario', closable: true },
        { icon: 'exit_to_app', label: 'Salidas', route: '/salidas', closable: true },
        { icon: 'tune', label: 'Ajustes Inventario', route: '/ajustes-inventario', closable: true },
        { icon: 'speed', label: 'Marcas Medidor', route: '/marcas-medidor', closable: true },
        { icon: 'payments', label: 'Tarifas Maestro', route: '/tarifas-maestro', closable: true },
        { icon: 'badge', label: 'Tipo Identificación', route: '/tipo-ident', closable: true },
        { icon: 'receipt_long', label: 'Tipo Impuesto', route: '/tipo-impuesto', closable: true },
        { icon: 'person', label: 'Tipo Persona', route: '/tipo-persona', closable: true },
        { icon: 'business', label: 'Tipo Régimen', route: '/tipo-regimen', closable: true },
        { icon: 'calendar_today', label: 'Años', route: '/years', closable: true },
        { icon: 'people', label: 'Usuarios', route: '/users', closable: true },
        { icon: 'badge', label: 'Empleados', route: '/empleados', closable: true },
        { icon: 'event', label: 'Períodos de Nómina', route: '/periodos-nomina', closable: true },
        { icon: 'description', label: 'Conceptos de Nómina', route: '/conceptos-nomina', closable: true },
        { icon: 'payments', label: 'Nóminas', route: '/nominas', closable: true },
        { icon: 'calculate', label: 'Calcular Nómina V2', route: '/nominas/nuevo-calculo', closable: true },
        { icon: 'handshake', label: 'Cuotas Conexión', route: '/diferidos/cuotas-conexion', closable: true },
        { icon: 'speed', label: 'Cuotas Medidor', route: '/diferidos/cuotas-medidor', closable: true },
        { icon: 'assignment', label: 'Acuerdos de Pago', route: '/diferidos/acuerdos-pago', closable: true }
      ];

      const menuItem = menuItems.find(item => item.route === to.path);
      console.log('Router: found menu item:', menuItem);

      if (menuItem) {
        tabsStore.addTab({
          name: menuItem.label,
          route: menuItem.route,
          icon: menuItem.icon,
          closable: menuItem.closable
        });
      }
    }
  }

  next();
});

export default router;
