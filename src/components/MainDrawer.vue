<script setup lang="ts">
import { ref } from 'vue';
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
  }
];

const diferidoItems = [
  {
    icon: 'schedule',
    label: 'Listado Diferidos',
    route: '/diferidos',
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
    :width="240"
    :breakpoint="500"
    bordered
    class="bg-white"
    show-if-above
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- Header -->
    <q-toolbar class="bg-primary text-white">
      <q-avatar>
        <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
      </q-avatar>
      <q-toolbar-title class="text-weight-bold">
        Menu
      </q-toolbar-title>
      <q-btn
        flat
        round
        dense
        icon="chevron_left"
        @click="toggleMiniState"
        :rotate="miniState ? 180 : 0"
      />
    </q-toolbar>

    <!-- User Info -->
    <q-list padding>
      <q-item v-if="authStore.user">
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white">
            {{ authStore.user.name?.charAt(0).toUpperCase() || 'U' }}
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ authStore.user.name || 'Usuario' }}</q-item-label>
          <q-item-label caption>{{ authStore.user.email || '' }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-separator spaced />

      <!-- Consumo Section -->
      <q-expansion-item
        v-model="consumoExpanded"
        icon="water_drop"
        label="Consumo"
        header-class="text-weight-bold"
      >
        <q-item
          v-for="item in menuItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="q-pl-md"
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
          class="q-pl-md"
        >
          <q-item-section avatar>
            <q-icon :name="syncing ? 'sync_disabled' : 'sync'" />
          </q-item-section>
          <q-item-section>
            {{ syncing ? 'Sincronizando...' : 'Sincronizar Datos' }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-separator spaced />

      <!-- Documentos Section -->
      <q-expansion-item
        v-model="documentosExpanded"
        icon="description"
        label="Documentos"
        header-class="text-weight-bold"
      >
        <q-item
          v-for="item in documentosItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="q-pl-md"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-separator spaced />

      <!-- Inventario Section -->
      <q-expansion-item
        v-model="inventarioExpanded"
        icon="inventory_2"
        label="Inventario"
        header-class="text-weight-bold"
      >
        <q-item
          v-for="item in inventarioItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="q-pl-lg"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-separator spaced />

      <!-- Maestros Section -->
      <q-expansion-item
        v-model="maestrosExpanded"
        icon="folder"
        label="Maestros"
        header-class="text-weight-bold"
      >
        <q-item
          v-for="item in maestrosItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="q-pl-lg"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-separator spaced />

      <!-- Facturación Section -->
      <q-expansion-item
        v-model="facturacionExpanded"
        icon="receipt_long"
        label="Facturación"
        header-class="text-weight-bold"
      >
        <q-item
          v-for="item in facturacionItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="q-pl-lg"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-separator spaced />

      <!-- Diferido Section -->
      <q-expansion-item
        v-model="diferidoExpanded"
        icon="schedule"
        label="Diferido"
        header-class="text-weight-bold"
      >
        <q-item
          v-for="item in diferidoItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="q-pl-lg"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-separator spaced />

      <!-- Notas Section -->
      <q-expansion-item
        v-model="notasExpanded"
        icon="note"
        label="Notas"
        header-class="text-weight-bold"
      >
        <q-item
          v-for="item in notasItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="q-pl-lg"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-separator spaced />

      <!-- Compras Section -->
      <q-expansion-item
        v-model="comprasExpanded"
        icon="shopping_cart"
        label="Compras"
        header-class="text-weight-bold"
      >
        <q-item
          v-for="item in comprasItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="q-pl-lg"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-separator spaced />

      <!-- Estratos Section -->
      <q-expansion-item
        v-model="estratosExpanded"
        icon="layers"
        label="Estratos"
        header-class="text-weight-bold"
      >
        <q-item
          v-for="item in estratosItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="q-pl-lg"
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
        v-model="configuracionExpanded"
        icon="settings"
        label="Configuración"
        header-class="text-weight-bold"
      >
        <q-item
          v-for="item in configuracionItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="q-pl-lg"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-separator spaced />

      <!-- Instalaciones Section -->
      <q-expansion-item
        v-model="instalacionesExpanded"
        icon="home"
        label="Instalaciones"
        header-class="text-weight-bold"
      >
        <q-item
          clickable
          v-ripple
          :active="router.currentRoute.value.path === '/instalaciones/saldos-a-favor'"
          active-class="text-primary"
          @click="navigateTo({ label: 'Saldos a Favor', route: '/instalaciones/saldos-a-favor', icon: 'account_balance_wallet', closable: true })"
          class="q-pl-lg"
        >
          <q-item-section avatar>
            <q-icon name="account_balance_wallet" />
          </q-item-section>
          <q-item-section>
            Saldos a Favor
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-separator spaced />

      <!-- Nómina Section -->
      <q-expansion-item
        v-model="nominaExpanded"
        icon="payments"
        label="Nómina"
        header-class="text-weight-bold"
      >
        <q-item
          v-for="item in nominaItems"
          :key="item.route"
          clickable
          v-ripple
          :active="router.currentRoute.value.path === item.route"
          active-class="text-primary"
          @click="navigateTo(item)"
          class="q-pl-lg"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <!-- Sync Button -->
    </q-list>
  </q-drawer>
</template>

<style lang="scss" scoped>
.q-drawer {
  .q-toolbar {
    height: 64px;
  }
  
  .q-item {
    border-radius: 8px;
    margin: 0 8px;
    
    &.q-item--active {
      background: rgba(25, 118, 210, 0.1);
    }
  }
}
</style>