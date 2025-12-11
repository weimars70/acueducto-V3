<template>
  <q-page style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh;">
    <div class="q-pa-md">
      <div class="row justify-center">
        <div class="col-12">
          <div style="background: white; border-radius: 20px; padding: 32px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);">
            <!-- Header -->
            <div class="row items-center q-mb-lg">
              <div class="col">
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
                    <h5 style="margin: 0; font-weight: 600; color: #2c3e50;">Ajuste Múltiple de Inventario</h5>
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">Ajusta varios items en una sola operación</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Selección de Tipo de Ajuste -->
            <div class="q-mb-lg" style="background: #f3f4f6; border-radius: 12px; padding: 20px;">
              <div class="row q-col-gutter-md items-end">
                <div class="col-12 col-md-8">
                  <div style="font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px;">
                    Tipo de Ajuste <span style="color: #ef4444;">*</span>
                  </div>
                  <q-select
                    v-model="tipoAjusteSeleccionado"
                    outlined
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
                      <q-icon name="category" color="primary" />
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
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="motivoGeneral"
                    outlined
                    label="Motivo General (opcional)"
                    placeholder="Aplica a todos los items..."
                    style="border-radius: 12px;"
                  >
                    <template v-slot:prepend>
                      <q-icon name="notes" color="primary" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Formulario para agregar items -->
            <div v-if="tipoAjusteSeleccionado" class="q-mb-lg" style="background: #eff6ff; border-radius: 12px; padding: 20px; border: 2px dashed #3b82f6;">
              <div style="font-weight: 600; color: #1e40af; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                <q-icon name="add_circle" size="24px" />
                <span>Agregar Item al Ajuste</span>
              </div>

              <div class="row q-col-gutter-md items-end">
                <!-- Selección de Item -->
                <div class="col-12 col-md-3">
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
                    style="border-radius: 12px;"
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
                <div class="col-6 col-md-auto compact-field">
                  <div class="compact-label">
                    Cantidad <span style="color: #ef4444;">*</span>
                  </div>
                  <q-input
                    v-model.number="itemActual.cantidad"
                    outlined
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    class="compact-input"
                    style="width: 100px;"
                  >
                    <template v-slot:prepend>
                      <q-icon name="pin" color="primary" size="xs" />
                    </template>
                  </q-input>
                </div>

                <!-- Motivo individual -->
                <div class="col-12 col-md-2">
                  <div style="font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px;">
                    Motivo (opcional)
                  </div>
                  <q-input
                    v-model="itemActual.motivo"
                    outlined
                    placeholder="Motivo..."
                    style="border-radius: 12px;"
                  >
                    <template v-slot:prepend>
                      <q-icon name="comment" color="primary" />
                    </template>
                  </q-input>
                </div>

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
            <div v-if="itemsAgregados.length > 0" class="q-mb-lg">
              <div style="font-weight: 600; color: #2c3e50; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
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

              <q-table
                :rows="itemsAgregados"
                :columns="columnsItems"
                row-key="id"
                flat
                bordered
                style="border-radius: 12px; overflow: hidden;"
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

            <!-- Botones finales -->
            <div class="form-actions">
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
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #e5e7eb;
}

.action-btn {
  min-width: 140px;
  height: 52px;
  padding: 0 24px;
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
</style>
