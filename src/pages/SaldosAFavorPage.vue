<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { saldosAFavorService } from '../services/api/saldo-a-favor.service';
import type { MovimientoSaldoAFavor } from '../types/saldo-a-favor';

const $q = useQuasar();
const router = useRouter();

const movements = ref<MovimientoSaldoAFavor[]>([]);
const loading = ref(false);
const filter = ref('');

const columns = [
  { name: 'id', label: 'Id', field: 'id', sortable: true, align: 'left' as const },
  { name: 'fecha', label: 'Fecha', field: 'fecha', sortable: true, align: 'left' as const, format: (val: string) => new Date(val).toLocaleDateString() },
  { name: 'instalacion', label: 'Instalacion', field: 'instalacion', sortable: true, align: 'left' as const },
  { name: 'factura', label: 'Factura', field: 'factura', sortable: true, align: 'left' as const },
  { name: 'credito', label: 'Credito', field: 'credito', sortable: true, align: 'right' as const, format: (val: number) => formatCurrency(val) },
  { name: 'debito', label: 'Debito', field: 'debito', sortable: true, align: 'right' as const, format: (val: number) => formatCurrency(val) },
  { name: 'nuevoSaldo', label: 'Nuevo Saldo', field: 'nuevoSaldo', sortable: true, align: 'right' as const, style: 'font-weight: bold', format: (val: number) => formatCurrency(val) },
  { name: 'observacion', label: 'Observacion', field: 'observacion', align: 'left' as const },
  { name: 'usuario', label: 'Usuario', field: 'usuario', align: 'left' as const },
];

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
};

const loadData = async () => {
  try {
    loading.value = true;
    movements.value = await saldosAFavorService.getAll();
  } catch (error) {
    console.error('Error loading saldos', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los movimientos de saldos a favor'
    });
  } finally {
    loading.value = false;
  }
};

const handleNew = () => {
  router.push('/instalaciones/saldos-a-favor/nuevo');
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold text-primary">Saldos a Favor</div>
        <div class="text-caption text-grey-7">Historial de movimientos de saldos a favor</div>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Nuevo"
        @click="handleNew"
        unelevated
        class="shadow-2"
        rounded
      />
    </div>

    <q-card class="shadow-2 rounded-borders">
      <q-table
        :rows="movements"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :filter="filter"
        flat
        bordered
      >
        <template v-slot:top>
           <q-space />
           <q-input outlined dense debounce="300" v-model="filter" placeholder="Buscar..." class="search-input">
             <template v-slot:prepend>
               <q-icon name="search" />
             </template>
           </q-input>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
.search-input {
  width: 300px;
}
</style>
