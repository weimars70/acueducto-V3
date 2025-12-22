<template>
  <q-page class="page-container">
    <div class="content-wrapper">
      <div class="card-container">
        <!-- Header Sticky -->
        <div class="header-sticky">
          <div class="row items-center q-col-gutter-md">
            <!-- Título -->
            <div class="col-12 col-md-auto">
              <div style="display: flex; align-items: center; gap: 12px;">
                <q-btn
                  flat
                  dense
                  round
                  icon="arrow_back"
                  @click="$router.back()"
                  style="color: #6b7280;"
                />
                <div>
                  <h5 class="header-title">Ajuste Múltiple de Inventario</h5>
                  <p class="header-subtitle">Ajusta varios items en una sola operación</p>
                </div>
              </div>
            </div>

            <!-- Tipo de Ajuste -->
            <div class="col-12 col-md">
              <div style="font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 13px;">
                Tipo de Ajuste <span style="color: #ef4444;">*</span>
              </div>
              <q-select
                v-model="tipoAjusteSeleccionado"
                outlined
                dense
                :options="tiposAjuste"
                option-value="codigo"
                option-label="nombre"
                emit-value
                map-options
                placeholder="Seleccione el tipo de ajuste..."
                style="border-radius: 12px;"
                :disable="itemsAgregados.length > 0"
              >
                <template v-slot:prepend>
                  <q-icon name="category" color="primary" size="sm" />
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                      <q-item-label caption>
                        <q-badge
                          v-if="scope.opt.sumaUnidades"
                          color="positive"
                          label="Suma"
                          class="q-mr-xs"
                        />
                        <q-badge
                          v-else-if="scope.opt.restaUnidades"
                          color="negative"
                          label="Resta"
                          class="q-mr-xs"
                        />
                        <q-badge
                          v-else
                          color="primary"
                          label="Valor"
                          class="q-mr-xs"
                        />
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- Motivo General -->
            <div class="col-12 col-md-3">
              <div style="font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 13px;">
                Motivo General (opcional)
              </div>
              <q-input
                v-model="motivoGeneral"
                outlined
                dense
                placeholder="Aplica a todos los items..."
                style="border-radius: 12px;"
              >
                <template v-slot:prepend>
                  <q-icon name="notes" color="primary" size="sm" />
                </template>
              </q-input>
            </div>
          </div>
        </div>

        <!-- Contenido Scrollable -->
        <div class="scrollable-content">

          <!-- Formulario para agregar items -->
          <div v-if="tipoAjusteSeleccionado" class="q-mb-md add-item-section">
            <div class="section-header">
              <q-icon name="add_circle" size="24px" />
              <span>Agregar Item al Ajuste</span>
            </div>

            <!-- Primera fila: Campos principales -->
            <div class="row q-col-gutter-md items-end q-mb-md">
              <!-- Selección de Item -->
              <div class="col-12 col-md-5">
                <div style="font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px;">
                  Item <span style="color: #ef4444;">*</span>
                </div>
                <q-select
                  v-model="itemActual.item"
                  outlined
                  :options="itemsFiltered"
                  option-value="id"
                  option-label="nombre"
                  use-input
                  input-debounce="300"
                  @filter="filterItems"
                  placeholder="Buscar item..."
                  style="border-radius: 12px; height: 48px;"
                  class="input-height-48"
                >
                  <template v-slot:prepend>
                    <q-icon name="inventory_2" color="primary" />
                  </template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                        <q-item-label caption>
                          Código: {{ scope.opt.codigo }} | Stock: {{ scope.opt.inventario_actual }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:selected-item="scope">
                    <div class="full-width">
                      <div style="font-weight: 600;">{{ scope.opt.nombre }}</div>
                      <div style="font-size: 12px; color: #6b7280;">
                        Stock: {{ scope.opt.inventario_actual }}
                      </div>
                    </div>
                  </template>
                </q-select>
              </div>

              <!-- Cantidad -->
              <div class="col-6 col-md-2">
                <div style="font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px;">
                  Cantidad <span style="color: #ef4444;">*</span>
                </div>
                <q-input
                  v-model.number="itemActual.cantidad"
                  outlined
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  class="input-height-48"
                  style="border-radius: 12px;"
                >
                  <template v-slot:prepend>
                    <q-icon name="pin" color="primary" size="xs" />
                  </template>
                </q-input>
              </div>

              <!-- Motivo individual -->
              <div class="col-6 col-md-5">
                <div style="font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px;">
                  Motivo (opcional)
                </div>
                <q-input
                  v-model="itemActual.motivo"
                  outlined
                  placeholder="Motivo..."
                  class="input-height-48"
                  style="border-radius: 12px;"
                >
                  <template v-slot:prepend>
                    <q-icon name="comment" color="primary" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- Segunda fila: Campos informativos y botón -->
            <div class="row q-col-gutter-md items-end">
              <!-- Stock Actual -->
                <div v-if="itemActual.item" class="col-auto compact-field">
                  <div class="compact-label">
                    Stock Actual
                  </div>
                  <q-input
                    :model-value="itemActual.item.inventario_actual"
                    outlined
                    readonly
                    dense
                    class="compact-input-readonly"
                    style="width: 90px;"
                    bg-color="grey-2"
                  />
                </div>

                <!-- Cantidad Ajuste -->
                <div v-if="itemActual.item && itemActual.cantidad > 0" class="col-auto compact-field">
                  <div class="compact-label">
                    Cant. {{ tipoAjusteInfo?.symbol }}
                  </div>
                  <q-input
                    :model-value="itemActual.cantidad"
                    outlined
                    readonly
                    dense
                    class="compact-input-readonly"
                    style="width: 70px;"
                    :bg-color="tipoAjusteInfo?.symbol === '+' ? 'green-1' : tipoAjusteInfo?.symbol === '-' ? 'red-1' : 'blue-1'"
                  />
                </div>

                <!-- Stock Resultante -->
                <div v-if="itemActual.item && itemActual.cantidad > 0" class="col-auto compact-field">
                  <div class="compact-label">
                    Resultante
                  </div>
                  <q-input
                    :model-value="calcularStockResultante()"
                    outlined
                    readonly
                    dense
                    class="compact-input-readonly"
                    style="width: 80px;"
                    :bg-color="tipoAjusteInfo?.symbol === '+' ? 'green-1' : tipoAjusteInfo?.symbol === '-' ? 'red-1' : 'blue-1'"
                  />
                </div>

                <!-- Botón agregar -->
                <div class="col-12 col-md-auto" style="margin-left: auto;">
                  <q-btn
                    label="Agregar"
                    icon="add"
                    color="primary"
                    unelevated
                    @click="agregarItem"
                    :disable="!itemActual.item || !itemActual.cantidad || itemActual.cantidad <= 0"
                    style="border-radius: 12px; height: 48px; font-weight: 600; min-width: 140px;"
                  />
                </div>
              </div>
            </div>

          <!-- Tabla de items agregados -->
          <div v-if="itemsAgregados.length > 0" class="items-table-section">
            <div class="table-header">
              <span>Items a Ajustar ({{ itemsAgregados.length }})</span>
              <q-btn
                label="Limpiar Todo"
                icon="delete_sweep"
                flat
                dense
                color="negative"
                @click="limpiarTodo"
              />
            </div>

            <div class="table-wrapper">
              <q-table
                :rows="itemsAgregados"
                :columns="columnsItems"
                row-key="id"
                flat
                bordered
                :pagination="{ rowsPerPage: 0 }"
                hide-pagination
                class="items-table"
              >
                <template v-slot:body-cell-item="props">
                  <q-td :props="props">
                    <div style="font-weight: 600;">{{ props.row.item.nombre }}</div>
                    <div style="font-size: 12px; color: #6b7280;">Código: {{ props.row.item.codigo }}</div>
                  </q-td>
                </template>

                <template v-slot:body-cell-stock_actual="props">
                  <q-td :props="props">
                    <div style="font-weight: 600; color: #2c3e50;">{{ props.row.item.inventario_actual }}</div>
                  </q-td>
                </template>

                <template v-slot:body-cell-cantidad="props">
                  <q-td :props="props">
                    <div style="font-weight: 700;" :style="{ color: tipoAjusteInfo?.color }">
                      {{ tipoAjusteInfo?.symbol }}{{ props.row.cantidad }}
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-stock_resultante="props">
                  <q-td :props="props">
                    <div style="font-weight: 700;" :style="{ color: tipoAjusteInfo?.color }">
                      {{ calcularStockResultanteItem(props.row) }}
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-acciones="props">
                  <q-td :props="props">
                    <q-btn
                      flat
                      dense
                      round
                      icon="delete"
                      color="negative"
                      @click="eliminarItem(props.rowIndex)"
                    >
                      <q-tooltip>Eliminar</q-tooltip>
                    </q-btn>
                  </q-td>
                </template>
              </q-table>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="q-mt-md" style="display: flex; gap: 12px; justify-content: flex-end; padding-bottom: 20px;">
            <q-btn
              label="Cancelar"
              outline
              color="grey-7"
              icon="close"
              @click="$router.back()"
              class="action-btn cancel-btn"
            />
            <q-btn
              label="Guardar Ajustes"
              icon="save"
              color="primary"
              :loading="loading"
              :disable="itemsAgregados.length === 0"
              @click="guardarAjustes"
              unelevated
              class="action-btn save-btn"
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { ajustesInventarioService, type ItemInventario } from '../services/api/ajustes-inventario.service';
import { tiposAjusteInventarioService, type TipoAjusteInventario } from '../services/api/tipos-ajuste-inventario.service';

const router = useRouter();
const $q = useQuasar();

const loading = ref(false);
const tiposAjuste = ref<TipoAjusteInventario[]>([]);
const tipoAjusteSeleccionado = ref<number | null>(null);
const motivoGeneral = ref('');

const items = ref<ItemInventario[]>([]);
const itemsFiltered = ref<ItemInventario[]>([]);

const itemActual = ref({
  item: null as ItemInventario | null,
  cantidad: 0,
  motivo: ''
});

interface ItemAgregado {
  item: ItemInventario;
  cantidad: number;
  motivo: string;
}

const itemsAgregados = ref<ItemAgregado[]>([]);

const columnsItems = [
  {
    name: 'item',
    label: 'Item',
    field: 'item',
    align: 'left' as const
  },
  {
    name: 'stock_actual',
    label: 'Stock Actual',
    field: 'stock_actual',
    align: 'center' as const
  },
  {
    name: 'cantidad',
    label: 'Cantidad',
    field: 'cantidad',
    align: 'center' as const
  },
  {
    name: 'stock_resultante',
    label: 'Stock Resultante',
    field: 'stock_resultante',
    align: 'center' as const
  },
  {
    name: 'motivo',
    label: 'Motivo',
    field: 'motivo',
    align: 'left' as const
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'center' as const
  }
];

const tipoAjusteInfo = computed(() => {
  if (!tipoAjusteSeleccionado.value) return null;

  const tipo = tiposAjuste.value.find(t => t.codigo === tipoAjusteSeleccionado.value);
  if (!tipo) return null;

  if (tipo.sumaUnidades) {
    return { symbol: '+', color: '#10b981' };
  } else if (tipo.restaUnidades) {
    return { symbol: '-', color: '#ef4444' };
  } else {
    return { symbol: '=', color: '#3b82f6' };
  }
});

const loadTiposAjuste = async () => {
  try {
    tiposAjuste.value = await tiposAjusteInventarioService.getActivos();
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al cargar tipos de ajuste',
      position: 'top'
    });
  }
};

const loadItems = async (search?: string) => {
  try {
    items.value = await ajustesInventarioService.getItems(search);
    itemsFiltered.value = items.value;
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Error al cargar items',
      position: 'top'
    });
  }
};

const filterItems = (val: string, update: Function) => {
  if (val.length < 3) {
    update(() => {
      itemsFiltered.value = items.value.slice(0, 20);
    });
    return;
  }

  loadItems(val).then(() => {
    update(() => {
      itemsFiltered.value = items.value;
    });
  });
};

const calcularStockResultante = (): number => {
  if (!itemActual.value.item || !tipoAjusteSeleccionado.value) return 0;

  const tipo = tiposAjuste.value.find(t => t.codigo === tipoAjusteSeleccionado.value);
  if (!tipo) return 0;

  const stockActual = itemActual.value.item.inventario_actual;
  const cantidad = itemActual.value.cantidad || 0;

  if (tipo.sumaUnidades) {
    return stockActual + cantidad;
  } else if (tipo.restaUnidades) {
    return stockActual - cantidad;
  } else {
    return cantidad;
  }
};

const calcularStockResultanteItem = (item: ItemAgregado): number => {
  if (!tipoAjusteSeleccionado.value) return 0;

  const tipo = tiposAjuste.value.find(t => t.codigo === tipoAjusteSeleccionado.value);
  if (!tipo) return 0;

  const stockActual = item.item.inventario_actual;
  const cantidad = item.cantidad;

  if (tipo.sumaUnidades) {
    return stockActual + cantidad;
  } else if (tipo.restaUnidades) {
    return stockActual - cantidad;
  } else {
    return cantidad;
  }
};

const agregarItem = () => {
  if (!itemActual.value.item || !itemActual.value.cantidad || itemActual.value.cantidad <= 0) {
    $q.notify({
      type: 'warning',
      message: 'Complete todos los campos requeridos',
      position: 'top'
    });
    return;
  }

  // Verificar que el item no esté ya agregado
  const yaAgregado = itemsAgregados.value.find(i => i.item.id === itemActual.value.item!.id);
  if (yaAgregado) {
    $q.notify({
      type: 'warning',
      message: 'Este item ya está en la lista',
      position: 'top'
    });
    return;
  }

  // Validar stock negativo para restas
  const tipo = tiposAjuste.value.find(t => t.codigo === tipoAjusteSeleccionado.value);
  if (tipo?.restaUnidades) {
    const stockResultante = calcularStockResultante();
    if (stockResultante < 0) {
      $q.notify({
        type: 'negative',
        message: 'El ajuste resultaría en stock negativo',
        position: 'top'
      });
      return;
    }
  }

  itemsAgregados.value.push({
    item: itemActual.value.item,
    cantidad: itemActual.value.cantidad,
    motivo: itemActual.value.motivo || motivoGeneral.value
  });

  // Limpiar formulario
  itemActual.value = {
    item: null,
    cantidad: 0,
    motivo: ''
  };

  $q.notify({
    type: 'positive',
    message: 'Item agregado a la lista',
    position: 'top'
  });
};

const eliminarItem = (index: number) => {
  itemsAgregados.value.splice(index, 1);
  $q.notify({
    type: 'info',
    message: 'Item eliminado de la lista',
    position: 'top'
  });
};

const limpiarTodo = () => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro de limpiar todos los items de la lista?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    itemsAgregados.value = [];
  });
};

const guardarAjustes = async () => {
  if (!tipoAjusteSeleccionado.value) {
    $q.notify({
      type: 'warning',
      message: 'Seleccione un tipo de ajuste',
      position: 'top'
    });
    return;
  }

  if (itemsAgregados.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Agregue al menos un item',
      position: 'top'
    });
    return;
  }

  loading.value = true;

  try {
    const response = await ajustesInventarioService.createMultiple({
      codigoTipoAjuste: tipoAjusteSeleccionado.value,
      items: itemsAgregados.value.map(item => ({
        idItem: item.item.id,
        cantidad: item.cantidad,
        motivo: item.motivo
      })),
      motivoGeneral: motivoGeneral.value
    });

    $q.notify({
      type: 'positive',
      message: response.mensaje || 'Ajustes guardados correctamente',
      position: 'top'
    });

    router.push('/ajustes-inventario');
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || 'Error al guardar los ajustes',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadTiposAjuste();
  loadItems();
});
</script>

<style scoped lang="scss">
// Contenedor principal con altura controlada
.page-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  height: 100vh;
  overflow: hidden;
}

.content-wrapper {
  height: 100%;
  padding: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  max-width: 1400px;
  width: 100%;
  height: calc(100vh - 24px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// Header sticky
.header-sticky {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  padding: 20px 24px;
  border-bottom: 2px solid #e5e7eb;
  border-radius: 20px 20px 0 0;
}

.header-title {
  margin: 0;
  font-weight: 600;
  color: #2c3e50;
  font-size: 20px;
}

.header-subtitle {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

// Contenido scrollable
.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;

  // Scroll suave
  scroll-behavior: smooth;

  // Personalizar scrollbar
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;

    &:hover {
      background: #a8a8a8;
    }
  }
}

// Secciones
.section-card {
  background: #f3f4f6;
  border-radius: 12px;
  padding: 16px;
}

.add-item-section {
  background: #eff6ff;
  border-radius: 12px;
  padding: 16px;
  border: 2px dashed #3b82f6;
}

.section-header {
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

// Tabla
.items-table-section {
  margin-bottom: 16px;
}

.table-header {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-wrapper {
  max-height: 200px;
  overflow-y: auto;
  border-radius: 12px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }
}

.items-table {
  border-radius: 12px;
  overflow: hidden;
}

.action-btn {
  min-width: 120px;
  height: 48px;
  padding: 0 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.cancel-btn {
  &:hover {
    background: #fff4e6 !important;
    border-color: #fb923c !important;
    color: #ea580c !important;
  }
}

.save-btn {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

  &:hover {
    background: #28A745 !important;
    border-color: #28A745 !important;
    box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4) !important;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

// Altura uniforme para inputs
.input-height-48 {
  :deep(.q-field__control) {
    min-height: 48px;
    height: 48px;
  }

  :deep(.q-field__native) {
    min-height: 48px;
  }
}

// Campos compactos
.compact-field {
  min-width: 0;
  flex-shrink: 0;
}

.compact-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 12px;
  white-space: nowrap;
}

.compact-input {
  border-radius: 8px;

  :deep(.q-field__control) {
    min-height: 40px;
    height: 40px;
  }

  :deep(input) {
    text-align: center;
    font-size: 13px;
    font-weight: 600;
  }
}

.compact-input-readonly {
  border-radius: 8px;

  :deep(.q-field__control) {
    min-height: 36px;
    height: 36px;
  }

  :deep(input) {
    text-align: center;
    font-size: 13px;
    font-weight: 700;
  }
}

// Responsividad para pantallas pequeñas
@media (max-width: 768px) {
  .content-wrapper {
    padding: 8px;
  }

  .card-container {
    height: calc(100vh - 16px);
    border-radius: 16px;
  }

  .header-sticky {
    padding: 16px;
    border-radius: 16px 16px 0 0;
  }

  .header-title {
    font-size: 18px;
  }

  .header-subtitle {
    font-size: 12px;
  }

  .scrollable-content {
    padding: 12px;
  }

  .section-card,
  .add-item-section {
    padding: 12px;
  }

  .actions-sticky {
    padding: 12px;
    flex-direction: column;
    gap: 8px;
    border-radius: 0 0 16px 16px;
  }

  .action-btn {
    width: 100%;
    min-width: unset;
  }

  .table-wrapper {
    max-height: 200px;
  }
}

// Pantallas muy pequeñas (móviles en vertical)
@media (max-width: 480px) {
  .header-sticky {
    padding: 12px;
  }

  .header-title {
    font-size: 16px;
  }

  .scrollable-content {
    padding: 8px;
  }

  .section-card,
  .add-item-section {
    padding: 10px;
  }

  .compact-label {
    font-size: 11px;
  }
}
</style>
