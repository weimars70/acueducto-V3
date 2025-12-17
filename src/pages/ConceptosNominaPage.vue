<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { conceptoNominaService } from '../services/api/concepto-nomina.service';
import type { ConceptoNomina } from '../types/concepto-nomina';
import { useExport } from '../composables/useExport';

const $q = useQuasar();
const router = useRouter();
const { exportToExcel, exportToPDF } = useExport();
const conceptos = ref<ConceptoNomina[]>([]);
const loading = ref(true);
const filter = ref('');
const viewMode = ref<'table' | 'grid'>('table');
const pagination = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 12,
  rowsNumber: 0
});

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' as const, sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const, sortable: true },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'center' as const, sortable: true },
  { name: 'subtipo', label: 'Subtipo', field: 'subtipo', align: 'left' as const },
  { name: 'porcentaje', label: 'Porcentaje', field: 'porcentaje', align: 'center' as const },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' as const, sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' as const }
];

const filteredConceptos = computed(() => {
  if (!filter.value) return conceptos.value;
  const searchTerm = filter.value.toLowerCase();
  return conceptos.value.filter(c =>
    c.codigo?.toLowerCase().includes(searchTerm) ||
    c.nombre?.toLowerCase().includes(searchTerm) ||
    c.tipo?.toLowerCase().includes(searchTerm)
  );
});

const loadData = async () => {
  try {
    loading.value = true;
    const response = await conceptoNominaService.getConceptos({
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
    });

    if (response && response.data) {
      conceptos.value = response.data;
      pagination.value.rowsNumber = response.total || 0;
    } else {
      conceptos.value = [];
      pagination.value.rowsNumber = 0;
    }
  } catch (error) {
    console.error('Error al cargar conceptos:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los conceptos de nómina'
    });
    conceptos.value = [];
    pagination.value.rowsNumber = 0;
  } finally {
    loading.value = false;
  }
};

const onRequest = (props: any) => {
  const { page, rowsPerPage } = props.pagination;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  loadData();
};

const handleNew = () => {
  router.push('/conceptos-nomina/new');
};

const handleEdit = (concepto: ConceptoNomina) => {
  router.push(`/conceptos-nomina/edit/${concepto.id}`);
};

const handleDelete = async (concepto: ConceptoNomina) => {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de eliminar el concepto ${concepto.nombre}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await conceptoNominaService.delete(concepto.id);
      $q.notify({
        type: 'positive',
        message: 'Concepto eliminado exitosamente'
      });
      loadData();
    } catch (error) {
      console.error('Error al eliminar concepto:', error);
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar el concepto'
      });
    }
  });
};

const handleExportExcel = () => {
  try {
    const exportColumns = [
      { field: 'codigo', label: 'Código' },
      { field: 'nombre', label: 'Nombre' },
      { field: 'tipo', label: 'Tipo' },
      { field: 'subtipo', label: 'Subtipo' },
      { field: 'porcentaje', label: 'Porcentaje' },
      { field: 'activo', label: 'Estado' }
    ];
    
    // Preparar datos con formato adecuado
    const dataToExport = filteredConceptos.value.map(c => ({
      ...c,
      porcentaje: c.porcentaje ? c.porcentaje + '%' : '-',
      activo: c.activo ? 'Activo' : 'Inactivo'
    }));
    
    exportToExcel(dataToExport, exportColumns, 'conceptos-nomina');
    $q.notify({ type: 'positive', message: 'Exportado a Excel exitosamente' });
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    $q.notify({ type: 'negative', message: 'Error al exportar a Excel' });
  }
};

const handleExportPDF = () => {
  try {
    const exportColumns = [
      { field: 'codigo', label: 'Código' },
      { field: 'nombre', label: 'Nombre' },
      { field: 'tipo', label: 'Tipo' },
      { field: 'subtipo', label: 'Subtipo' },
      { field: 'porcentaje', label: 'Porcentaje' },
      { field: 'activo', label: 'Estado' }
    ];
    
    // Preparar datos con formato adecuado
    const dataToExport = filteredConceptos.value.map(c => ({
      ...c,
      subtipo: c.subtipo || '-',
      porcentaje: c.porcentaje ? c.porcentaje + '%' : '-',
      activo: c.activo ? 'Activo' : 'Inactivo'
    }));
    
    exportToPDF(dataToExport, exportColumns, 'conceptos-nomina', 'Conceptos de Nómina');
    $q.notify({ type: 'positive', message: 'Exportado a PDF exitosamente' });
  } catch (error) {
    console.error('Error al exportar a PDF:', error);
    $q.notify({ type: 'negative', message: 'Error al exportar a PDF' });
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <q-page padding>
    <!-- Header Card -->
    <q-card flat class="q-mb-md shadow-1" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <q-card-section class="text-white">
        <div class="row items-center">
          <div class="col">
            <div class="text-h5 text-weight-bold">
              <q-icon name="description" size="32px" class="q-mr-sm" />
              Conceptos de Nómina
            </div>
            <div class="text-subtitle2 q-mt-xs" style="opacity: 0.9">
              Gestión de devengados y deducciones
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              rounded
              icon="add"
              label="Nuevo Concepto"
              color="white"
              text-color="purple-9"
              size="md"
              class="q-px-lg shadow-3"
              @click="handleNew"
              style="font-weight: 600;"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Filters and Actions Card -->
    <q-card flat class="q-mb-md shadow-1">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-6">
            <q-input
              v-model="filter"
              outlined
              dense
              placeholder="Buscar por código, nombre o tipo..."
              style="border-radius: 12px;"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="purple-7" />
              </template>
              <template v-slot:append v-if="filter">
                <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <div class="row justify-end q-gutter-sm">
              <q-btn
                outline
                rounded
                color="green-7"
                icon="file_download"
                label="Excel"
                @click="handleExportExcel"
                :disable="!conceptos.length"
                class="q-px-md"
              />
              <q-btn
                outline
                rounded
                color="red-7"
                icon="picture_as_pdf"
                label="PDF"
                @click="handleExportPDF"
                :disable="!conceptos.length"
                class="q-px-md"
              />
              <q-btn-toggle
                v-model="viewMode"
                rounded
                outline
                toggle-color="purple-7"
                color="grey-7"
                :options="[
                  {label: 'Tabla', value: 'table', icon: 'view_list'},
                  {label: 'Tarjetas', value: 'grid', icon: 'view_module'}
                ]"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table View -->
    <q-card flat class="shadow-1" v-if="viewMode === 'table'">
      <q-table
        flat
        :rows="filteredConceptos"
        :columns="columns"
        row-key="id"
        :loading="loading"
        v-model:pagination="pagination"
        @request="onRequest"
        :rows-per-page-options="[12, 24, 48]"
        binary-state-sort
      >
        <template v-slot:body-cell-tipo="props">
          <q-td :props="props">
            <q-chip
              :color="props.row.tipo === 'DEVENGADO' ? 'green-6' : 'orange-6'"
              text-color="white"
              size="sm"
              class="q-px-sm"
            >
              {{ props.row.tipo }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-porcentaje="props">
          <q-td :props="props">
            {{ props.row.porcentaje ? props.row.porcentaje + '%' : '-' }}
          </q-td>
        </template>

        <template v-slot:body-cell-activo="props">
          <q-td :props="props">
            <q-chip
              :color="props.row.activo ? 'positive' : 'negative'"
              text-color="white"
              size="sm"
            >
              {{ props.row.activo ? 'Activo' : 'Inactivo' }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              dense
              round
              icon="edit"
              color="blue-7"
              size="sm"
              @click="handleEdit(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="delete"
              color="red-7"
              size="sm"
              @click="handleDelete(props.row)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm q-pa-lg">
            <q-icon name="info" size="2em" color="grey-5" />
            <span class="text-grey-7">
              No hay conceptos de nómina registrados
            </span>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Grid View -->
    <div v-else class="row q-col-gutter-md">
      <div v-if="loading" class="col-12">
        <div class="row q-col-gutter-md">
          <div v-for="i in 6" :key="i" class="col-12 col-sm-6 col-md-4">
            <q-skeleton height="200px" />
          </div>
        </div>
      </div>
      <div v-else-if="!filteredConceptos.length" class="col-12">
        <q-card flat class="text-center q-pa-xl">
          <q-icon name="info" size="4em" color="grey-5" />
          <div class="text-h6 text-grey-7 q-mt-md">
            No hay conceptos de nómina registrados
          </div>
        </q-card>
      </div>
      <div
        v-else
        v-for="concepto in filteredConceptos"
        :key="concepto.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card flat class="shadow-1 q-hoverable" style="border-radius: 16px; height: 100%;">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <div class="col">
                <div class="text-h6 text-weight-bold text-grey-9">
                  {{ concepto.nombre }}
                </div>
                <div class="text-caption text-grey-6">
                  Código: {{ concepto.codigo }}
                </div>
              </div>
              <div class="col-auto">
                <q-chip
                  :color="concepto.tipo === 'DEVENGADO' ? 'green-6' : 'orange-6'"
                  text-color="white"
                  size="sm"
                >
                  {{ concepto.tipo }}
                </q-chip>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="text-body2 q-mb-xs">
              <q-icon name="category" size="xs" class="q-mr-xs" />
              <span class="text-grey-7">Subtipo:</span>
              <span class="text-weight-medium q-ml-xs">
                {{ concepto.subtipo || '-' }}
              </span>
            </div>

            <div class="text-body2 q-mb-xs">
              <q-icon name="percent" size="xs" class="q-mr-xs" />
              <span class="text-grey-7">Porcentaje:</span>
              <span class="text-weight-medium q-ml-xs">
                {{ concepto.porcentaje ? concepto.porcentaje + '%' : '-' }}
              </span>
            </div>

            <div class="text-body2 q-mb-md">
              <q-icon name="check_circle" size="xs" class="q-mr-xs" />
              <span class="text-grey-7">Estado:</span>
              <q-chip
                :color="concepto.activo ? 'positive' : 'negative'"
                text-color="white"
                size="sm"
                class="q-ml-xs"
              >
                {{ concepto.activo ? 'Activo' : 'Inactivo' }}
              </q-chip>
            </div>

            <div class="row q-gutter-sm">
              <q-btn
                outline
                rounded
                color="blue-7"
                icon="edit"
                label="Editar"
                size="sm"
                class="col"
                @click="handleEdit(concepto)"
              />
              <q-btn
                outline
                rounded
                color="red-7"
                icon="delete"
                label="Eliminar"
                size="sm"
                class="col"
                @click="handleDelete(concepto)"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>
