<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar, Loading } from 'quasar';
import { useAuthStore } from '../stores/auth';
import { useTabsStore } from '../stores/tabs';
import { syncService } from '../services/sync/sync.service';

const props = defineProps<{
  modelValue: boolean
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>();

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const tabsStore = useTabsStore();
const miniState = ref(false);
const syncing = ref(false);

const isFontanero = computed(() => {
  const role = authStore.user?.role || (authStore.user as any)?.role_nombre;
  return role === 'Fontanero';
});

const menuItems = [
  {
    icon: 'show_chart',
    label: 'Consumos',
    route: '/consumptions',
    closable: true,
  },
  {
    icon: 'list_alt',
    label: 'Lecturas Mes',
    route: '/monthly-readings',
    closable: true,
  },
  {
    icon: 'storage',
    label: 'Datos Sincronizados',
    route: '/sync-data',
    closable: true,
  }
];

const inventarioItems = [
  {
    icon: 'category',
    label: 'Items Grupos',
    route: '/items-grupos',
    closable: true,
  },
  {
    icon: 'swap_horiz',
    label: 'Tipo Movimiento Item',
    route: '/tipo-movimiento-item',
    closable: true,
  },
  {
    icon: 'star',
    label: 'Items',
    route: '/items',
    closable: true,
  },
  {
    icon: 'list_alt',
    label: 'Listado Inventario',
    route: '/movimientos-inventario',
    closable: true,
  },
  {
    icon: 'exit_to_app',
    label: 'Salidas',
    route: '/salidas',
    closable: true,
  },
  {
    icon: 'tune',
    label: 'Ajustes Inventario',
    route: '/ajustes-inventario',
    closable: true,
  }
];

const documentosItems = [
  {
    icon: 'receipt',
    label: 'Recibos de Caja',
    route: '/recibos-caja-list',
    closable: true,
  }
];

const consumoExpanded = ref(false);
const documentosExpanded = ref(false);
const maestrosExpanded = ref(false);
const inventarioExpanded = ref(false);
const facturacionExpanded = ref(false);
const diferidoExpanded = ref(false);
const estratosExpanded = ref(false);
const comprasExpanded = ref(false);
const configuracionExpanded = ref(false);
const nominaExpanded = ref(false);
const notasExpanded = ref(false);
const instalacionesExpanded = ref(false);

const maestrosItems = [
  {
    icon: 'account_balance',
    label: 'Bancos',
    route: '/bancos',
    closable: true,
  },
  {
    icon: 'account_tree',
    label: 'Centro de Costos',
    route: '/centro-costos',
    closable: true,
  },
  {
    icon: 'location_city',
    label: 'Ciudades',
    route: '/ciudades',
    closable: true,
  },
  {
    icon: 'speed',
    label: 'Marcas Medidor',
    route: '/marcas-medidor',
    closable: true,
  },
  {
    icon: 'location_city',
    label: 'Sectores',
    route: '/sectores',
    closable: true,
  },
  {
    icon: 'work',
    label: 'Profesiones',
    route: '/profesiones',
    closable: true,
  },
  {
    icon: 'payments',
    label: 'Tarifas Maestro',
    route: '/tarifas-maestro',
    closable: true,
  },
  {
    icon: 'badge',
    label: 'Tipo Identificación',
    route: '/tipo-ident',
    closable: true,
  },
  {
    icon: 'receipt_long',
    label: 'Tipo Impuesto',
    route: '/tipo-impuesto',
    closable: true,
  },
  {
    icon: 'person',
    label: 'Tipo Persona',
    route: '/tipo-persona',
    closable: true,
  },
  {
    icon: 'business',
    label: 'Tipo Régimen',
    route: '/tipo-regimen',
    closable: true,
  },
  {
    icon: 'calendar_today',
    label: 'Años',
    route: '/years',
    closable: true,
  },
  {
    icon: 'people',
    label: 'Terceros',
    route: '/terceros',
    closable: true,
  }
];

const facturacionItems = [
  {
    icon: 'receipt',
    label: 'Conceptos Factura',
    route: '/conceptos-factura',
    closable: true,
  },
  {
    icon: 'receipt_long',
    label: 'Prefactura',
    route: '/prefactura',
    closable: true,
  },
  {
    icon: 'assignment_turned_in',
    label: 'Facturar',
    route: '/facturar',
    closable: true,
  },
  {
    icon: 'list_alt',
    label: 'Listado de Facturas',
    route: '/facturas',
    closable: true,
  },
  {
    icon: 'cloud_upload',
    label: 'Enviar DIAN',
    route: '/enviar-dian',
    closable: true,
  },
  {
    icon: 'send',
    label: 'Envío Email Whatsapp',
    route: '/enviar-facturas-masivo',
    closable: true,
  }
];

const instalacionesItems = [
  {
    icon: 'list',
    label: 'Listado Instalaciones',
    route: '/instalaciones',
    closable: true,
  },
  {
    icon: 'account_balance_wallet',
    label: 'Saldos a Favor',
    route: '/instalaciones/saldos-a-favor',
    closable: true,
  }
];

const diferidoItems = [
  {
    icon: 'schedule',
    label: 'Listado Diferidos',
    route: '/diferidos',
    closable: true,
  },
  {
    icon: 'handshake',
    label: 'Cuotas Conexión',
    route: '/diferidos/cuotas-conexion',
    closable: true,
  },
  {
    icon: 'speed',
    label: 'Cuotas Medidor',
    route: '/diferidos/cuotas-medidor',
    closable: true,
  },
  {
    icon: 'assignment',
    label: 'Acuerdos de Pago',
    route: '/diferidos/acuerdos-pago',
    closable: true,
  }
];

const notasItems = [
  {
    icon: 'note',
    label: 'Conceptos Notas',
    route: '/notas-conceptos',
    closable: true,
  },
  {
    icon: 'receipt_long',
    label: 'Notas de Crédito',
    route: '/notas-credito',
    closable: true,
  },
  {
    icon: 'note',
    label: 'Conceptos Notas Débito',
    route: '/notas-debito-conceptos',
    closable: true,
  },
  {
    icon: 'description',
    label: 'Notas Débito',
    route: '/notas-debito',
    closable: true,
  }
];

const comprasItems = [
  {
    icon: 'shopping_cart',
    label: 'Compras',
    route: '/compras',
    closable: true,
  }
];

const estratosItems = [
  {
    icon: 'layers',
    label: 'Estratos',
    route: '/estratos',
    closable: true,
  },
  {
    icon: 'category',
    label: 'Tipos de Estrato',
    route: '/estratos-tipo',
    closable: true,
  },
  {
    icon: 'attach_money',
    label: 'Tarifas',
    route: '/estratos-tarifas',
    closable: true,
  }
];

const configuracionItems = [
  {
    icon: 'people',
    label: 'Usuarios',
    route: '/users',
    closable: true,
  }
];

const nominaItems = [
  {
    icon: 'badge',
    label: 'Empleados',
    route: '/empleados',
    closable: true,
  },
  {
    icon: 'event',
    label: 'Períodos de Nómina',
    route: '/periodos-nomina',
    closable: true,
  },
  {
    icon: 'description',
    label: 'Conceptos de Nómina',
    route: '/conceptos-nomina',
    closable: true,
  },
  {
    icon: 'settings',
    label: 'Parámetros de Nómina',
    route: '/parametros-nomina',
    closable: true,
  },
  {
    icon: 'payments',
    label: 'Nóminas',
    route: '/nominas',
    closable: true,
  },
  {
    icon: 'calculate',
    label: 'Calcular Nómina',
    route: '/nominas/calcular',
    closable: true,
  }
];

const navigateTo = (item: typeof menuItems[0]) => {
  tabsStore.addTab({
    name: item.label,
    route: item.route,
    icon: item.icon,
    closable: item.closable,
  });
  router.push(item.route);
  emit('update:modelValue', false);
};

const toggleMiniState = () => {
  miniState.value = !miniState.value;
};

const handleSync = async () => {
  if (syncing.value) return;

  try {
    syncing.value = true;
    Loading.show({
      message: 'Sincronizando datos...',
      spinnerColor: 'primary'
    });

    await syncService.syncViews();
    
    $q.notify({
      type: 'positive',
      message: 'Datos sincronizados correctamente'
    });
  } catch (error) {
    console.error('Error syncing:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al sincronizar los datos'
    });
  } finally {
    syncing.value = false;
    Loading.hide();
  }
};
</script>

<template>
  <q-drawer
    :model-value="modelValue"
    :mini="miniState"
    :width="260"
    :breakpoint="500"
    bordered
    class="elegant-drawer"
    show-if-above
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- Header -->
    <q-toolbar class="drawer-header">
      <q-avatar size="42px" class="drawer-avatar">
        <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
      </q-avatar>
      <q-toolbar-title class="drawer-title">
        <span class="text-weight-bold">Menú</span>
      </q-toolbar-title>
      <q-btn
        flat
        round
        dense
        icon="chevron_left"
        @click="toggleMiniState"
        :rotate="miniState ? 180 : 0"
        class="toggle-btn"
      />
    </q-toolbar>

    <!-- Menu Items -->
    <q-list padding>
      <!-- Consumo Section -->
      <q-expansion-item
        v-model="consumoExpanded"
        icon="water_drop"
        label="Consumo"
        header-class="text-weight-bold expansion-header"
        class="menu-expansion"
      >
        <q-item
          v-for="item in menuItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="menu-item q-pl-md"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>

        <!-- Sincronizar Datos dentro del submenu -->
        <q-item
          clickable
          v-ripple
          @click="handleSync"
          :disable="syncing"
          class="menu-item sync-item q-pl-md"
        >
          <q-item-section avatar>
            <q-icon :name="syncing ? 'sync_disabled' : 'sync'" />
          </q-item-section>
          <q-item-section>
            {{ syncing ? 'Sincronizando...' : 'Sincronizar Datos' }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-separator class="elegant-separator" v-if="!isFontanero" />

      <!-- Documentos Section -->
      <q-expansion-item
        v-if="!isFontanero"
        v-model="documentosExpanded"
        icon="description"
        label="Documentos"
        header-class="text-weight-bold expansion-header"
        class="menu-expansion"
      >
        <q-item
          v-for="item in documentosItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="menu-item q-pl-md"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-separator class="elegant-separator" v-if="!isFontanero" />

      <!-- Inventario Section -->
      <q-expansion-item
        v-if="!isFontanero"
        v-model="inventarioExpanded"
        icon="inventory_2"
        label="Inventario"
        header-class="text-weight-bold expansion-header"
        class="menu-expansion"
      >
        <q-item
          v-for="item in inventarioItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="menu-item q-pl-lg"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-separator class="elegant-separator" v-if="!isFontanero" />

      <!-- Maestros Section -->
      <q-expansion-item
        v-if="!isFontanero"
        v-model="maestrosExpanded"
        icon="folder"
        label="Maestros"
        header-class="text-weight-bold expansion-header"
        class="menu-expansion"
      >
        <q-item
          v-for="item in maestrosItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="menu-item q-pl-lg"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-separator class="elegant-separator" v-if="!isFontanero" />

      <!-- Facturación Section -->
      <q-expansion-item
        v-if="!isFontanero"
        v-model="facturacionExpanded"
        icon="receipt_long"
        label="Facturación"
        header-class="text-weight-bold expansion-header"
        class="menu-expansion"
      >
        <q-item
          v-for="item in facturacionItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="menu-item q-pl-lg"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-separator class="elegant-separator" v-if="!isFontanero" />

      <!-- Instalaciones Section -->
      <q-expansion-item
        v-if="!isFontanero"
        v-model="instalacionesExpanded"
        icon="home_work"
        label="Instalaciones"
        header-class="text-weight-bold expansion-header"
        class="menu-expansion"
      >
        <q-item
          v-for="item in instalacionesItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="menu-item q-pl-lg"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-separator class="elegant-separator" v-if="!isFontanero" />

      <!-- Diferido Section -->
      <q-expansion-item
        v-if="!isFontanero"
        v-model="diferidoExpanded"
        icon="schedule"
        label="Diferido"
        header-class="text-weight-bold expansion-header"
        class="menu-expansion"
      >
        <q-item
          v-for="item in diferidoItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="menu-item q-pl-lg"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-separator class="elegant-separator" v-if="!isFontanero" />

      <!-- Notas Section -->
      <q-expansion-item
        v-if="!isFontanero"
        v-model="notasExpanded"
        icon="note"
        label="Notas"
        header-class="text-weight-bold expansion-header"
        class="menu-expansion"
      >
        <q-item
          v-for="item in notasItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="menu-item q-pl-lg"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-separator class="elegant-separator" v-if="!isFontanero" />

      <!-- Compras Section -->
      <q-expansion-item
        v-if="!isFontanero"
        v-model="comprasExpanded"
        icon="shopping_cart"
        label="Compras"
        header-class="text-weight-bold expansion-header"
        class="menu-expansion"
      >
        <q-item
          v-for="item in comprasItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="menu-item q-pl-lg"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-separator class="elegant-separator" v-if="!isFontanero" />

      <!-- Estratos Section -->
      <q-expansion-item
        v-if="!isFontanero"
        v-model="estratosExpanded"
        icon="layers"
        label="Estratos"
        header-class="text-weight-bold expansion-header"
        class="menu-expansion"
      >
        <q-item
          v-for="item in estratosItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="menu-item q-pl-lg"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <!-- Configuración Section -->
      <q-expansion-item
        v-if="!isFontanero"
        v-model="configuracionExpanded"
        icon="settings"
        label="Configuración"
        header-class="text-weight-bold expansion-header"
        class="menu-expansion"
      >
        <q-item
          v-for="item in configuracionItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="menu-item q-pl-lg"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-separator class="elegant-separator" v-if="!isFontanero" />

      <!-- Nómina Section -->
      <q-expansion-item
        v-if="!isFontanero"
        v-model="nominaExpanded"
        icon="payments"
        label="Nómina"
        header-class="text-weight-bold expansion-header"
        class="menu-expansion"
      >
        <q-item
          v-for="item in nominaItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="menu-item q-pl-lg"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-separator class="elegant-separator" v-if="!isFontanero" />

      <!-- Nómina Vertical (Top Level) -->
      <q-item
        v-if="!isFontanero"
        clickable
        v-ripple
        :active="router.currentRoute.value.path === '/nominas/nuevo-calculo'"
        active-class="text-primary bg-blue-1"
        @click="navigateTo({
          icon: 'view_agenda',
          label: 'Nómina Vertical',
          route: '/nominas/nuevo-calculo',
          closable: true
        })"
        class="menu-expansion"
      >
        <q-item-section avatar>
          <q-icon name="view_agenda" size="24px" />
        </q-item-section>
        <q-item-section class="text-weight-bold">
          Nómina Vertical
        </q-item-section>
      </q-item>

      <!-- Sync Button -->
    </q-list>
  </q-drawer>
</template>

<style lang="scss" scoped>
.elegant-drawer {
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.08);
}

.drawer-header {
  height: 70px;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0 16px;
}

.drawer-avatar {
  transition: transform 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: scale(1.1) rotate(10deg);
  }
}

.drawer-title {
  font-size: 18px;
  letter-spacing: 0.5px;
}

.toggle-btn {
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.1);
  }
}

.elegant-separator {
  margin: 12px 16px;
  background: linear-gradient(90deg, transparent 0%, #1976d2 50%, transparent 100%);
  height: 1px;
  opacity: 0.3;
}

.menu-expansion {
  margin: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(25, 118, 210, 0.03);
  }

  :deep(.expansion-header) {
    font-size: 14px;
    padding: 12px 16px;
    transition: all 0.3s ease;

    .q-icon {
      color: #1976d2;
      transition: transform 0.3s ease;
    }

    &:hover {
      background: rgba(25, 118, 210, 0.05);

      .q-icon {
        transform: scale(1.15);
      }
    }
  }

  :deep(.q-item__label) {
    color: #2c3e50;
    font-weight: 600;
  }
}

.menu-item {
  border-radius: 8px;
  margin: 4px 8px;
  padding: 10px 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 3px;
    background: #1976d2;
    transform: scaleY(0);
    transition: transform 0.3s ease;
  }

  .q-icon {
    color: #546e7a;
    transition: all 0.3s ease;
  }

  :deep(.q-item__label) {
    color: #37474f;
    font-size: 14px;
    font-weight: 500;
  }

  &:hover {
    background: linear-gradient(90deg, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0.03) 100%);
    transform: translateX(4px);

    .q-icon {
      color: #1976d2;
      transform: scale(1.1);
    }

    &::before {
      transform: scaleY(1);
    }
  }

  &.q-item--active {
    background: linear-gradient(90deg, rgba(25, 118, 210, 0.15) 0%, rgba(25, 118, 210, 0.05) 100%);

    &::before {
      transform: scaleY(1);
    }

    .q-icon {
      color: #1976d2;
    }

    :deep(.q-item__label) {
      color: #1976d2;
      font-weight: 600;
    }
  }
}

.sync-item {
  .q-icon {
    animation: rotation 2s infinite linear;
  }

  &:hover .q-icon {
    animation: rotation 1s infinite linear;
  }
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Mini state adjustments
:deep(.q-drawer--mini) {
  .elegant-separator {
    margin: 8px 4px;
  }

  .menu-item {
    margin: 4px;
    padding: 8px 4px;
  }
}

// Scrollbar styling
:deep(.q-scrollarea__content) {
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(25, 118, 210, 0.3);
    border-radius: 3px;
    transition: background 0.3s ease;

    &:hover {
      background: rgba(25, 118, 210, 0.5);
    }
  }
}
</style>