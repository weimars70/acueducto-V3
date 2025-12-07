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
        component: () => import('../pages/generic-capture/SectorsPage.vue')
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
      }
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
        { icon: 'account_balance', label: 'Bancos', route: '/bancos', closable: true },
        { icon: 'account_tree', label: 'Centro de Costos', route: '/centro-costos', closable: true },
        { icon: 'location_city', label: 'Ciudades', route: '/ciudades', closable: true },
        { icon: 'people_alt', label: 'Clientes', route: '/clientes', closable: true },
        { icon: 'receipt', label: 'Impuestos', route: '/impuestos', closable: true },
        { icon: 'speed', label: 'Marcas Medidor', route: '/marcas-medidor', closable: true },
        { icon: 'payments', label: 'Tarifas Maestro', route: '/tarifas-maestro', closable: true },
        { icon: 'badge', label: 'Tipo Identificación', route: '/tipo-ident', closable: true },
        { icon: 'receipt_long', label: 'Tipo Impuesto', route: '/tipo-impuesto', closable: true },
        { icon: 'person', label: 'Tipo Persona', route: '/tipo-persona', closable: true },
        { icon: 'business', label: 'Tipo Régimen', route: '/tipo-regimen', closable: true },
        { icon: 'calendar_today', label: 'Años', route: '/years', closable: true },
        { icon: 'people', label: 'Usuarios', route: '/users', closable: true }
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
