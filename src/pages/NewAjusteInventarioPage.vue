<template>
  <q-page style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh;">
    <div class="q-pa-md">
      <div class="row justify-center">
        <div class="col-12 col-md-8">
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
                    <h5 style="margin: 0; font-weight: 600; color: #2c3e50;">Nuevo Ajuste de Inventario</h5>
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">Registra entradas o salidas de inventario</p>
                  </div>
                </div>
              </div>
            </div>

            <q-form @submit="onSubmit" class="q-gutter-md">
              <!-- Selección de Item -->
              <div>
                <div style="font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px;">
                  Item <span style="color: #ef4444;">*</span>
                </div>
                <q-select
                  v-model="formData.selectedItem"
                  outlined
                  :options="itemsFiltered"
                  option-value="id"
                  option-label="nombre"
                  use-input
                  input-debounce="300"
                  @filter="filterItems"
                  @update:model-value="onItemSelected"
                  placeholder="Buscar item..."
                  :rules="[val => !!val || 'Seleccione un item']"
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
                          Código: {{ scope.opt.codigo }} | Stock actual: {{ scope.opt.inventario_actual }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:selected-item="scope">
                    <div class="full-width">
                      <div style="font-weight: 600;">{{ scope.opt.nombre }}</div>
                      <div style="font-size: 12px; color: #6b7280;">
                        Código: {{ scope.opt.codigo }} | Stock actual: {{ scope.opt.inventario_actual }}
                      </div>
                    </div>
                  </template>
                </q-select>
              </div>

              <!-- Inventario Actual (solo visualización) -->
              <div v-if="formData.selectedItem" style="background: #f3f4f6; border-radius: 12px; padding: 16px; border: 2px solid #e5e7eb;">
                <div class="row q-col-gutter-md">
                  <div class="col-6">
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Stock Actual</div>
                    <div style="font-size: 24px; font-weight: 700; color: #2c3e50;">
                      {{ formData.selectedItem.inventario_actual }}
                    </div>
                  </div>
                  <div class="col-6" v-if="formData.cantidad >= 0 && formData.tipoAjuste">
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Stock Resultante</div>
                    <div style="font-size: 24px; font-weight: 700;" :style="{ color: formData.tipoAjuste === '+' ? '#10b981' : formData.tipoAjuste === '-' ? '#ef4444' : '#3b82f6' }">
                      {{ calcularStockResultante() }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tipo de Ajuste -->
              <div>
                <div style="font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px;">
                  Tipo de Ajuste <span style="color: #ef4444;">*</span>
                </div>
                <q-btn-toggle
                  v-model="formData.tipoAjuste"
                  toggle-color="primary"
                  :options="[
                    { label: 'Entrada (+)', value: '+', icon: 'add_circle' },
                    { label: 'Salida (-)', value: '-', icon: 'remove_circle' },
                    { label: 'Inventario Inicial', value: 'inicial', icon: 'playlist_add_check' }
                  ]"
                  unelevated
                  spread
                  style="border-radius: 12px; overflow: hidden;"
                />
              </div>

              <!-- Cantidad -->
              <div>
                <div style="font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px;">
                  Cantidad <span style="color: #ef4444;">*</span>
                </div>
                <q-input
                  v-model.number="formData.cantidad"
                  outlined
                  type="number"
                  :min="formData.tipoAjuste === 'inicial' ? '0' : '0.01'"
                  step="0.01"
                  placeholder="Ingrese la cantidad"
                  :rules="[
                    val => val !== null && val !== undefined && val !== '' || 'La cantidad es requerida',
                    val => formData.tipoAjuste === 'inicial' ? val >= 0 : val > 0 || 'La cantidad debe ser mayor a 0',
                    val => validarCantidadNegativa(val) || 'El ajuste resultaría en inventario negativo'
                  ]"
                  style="border-radius: 12px;"
                >
                  <template v-slot:prepend>
                    <q-icon name="pin" color="primary" />
                  </template>
                </q-input>
              </div>

              <!-- Motivo -->
              <div>
                <div style="font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px;">
                  Motivo / Observaciones
                </div>
                <q-input
                  v-model="formData.motivo"
                  outlined
                  type="textarea"
                  rows="3"
                  placeholder="Ingrese el motivo del ajuste (opcional)"
                  style="border-radius: 12px;"
                >
                  <template v-slot:prepend>
                    <q-icon name="notes" color="primary" />
                  </template>
                </q-input>
              </div>

              <!-- Botones -->
              <div class="row q-col-gutter-md q-mt-md">
                <div class="col-6">
                  <q-btn
                    label="Cancelar"
                    outline
                    color="grey-7"
                    @click="$router.back()"
                    class="full-width"
                    unelevated
                    style="border-radius: 12px; height: 52px; font-weight: 600; border: 2px solid #9ca3af;"
                  />
                </div>
                <div class="col-6">
                  <q-btn
                    label="Guardar Ajuste"
                    type="submit"
                    color="primary"
                    :loading="loading"
                    class="full-width"
                    unelevated
                    style="border-radius: 12px; height: 52px; font-weight: 600; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); transition: all 0.3s ease;"
                  />
                </div>
              </div>
            </q-form>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { ajustesInventarioService, type ItemInventario } from '../services/api/ajustes-inventario.service';

const router = useRouter();
const $q = useQuasar();

const loading = ref(false);
const items = ref<ItemInventario[]>([]);
const itemsFiltered = ref<ItemInventario[]>([]);

const formData = ref({
  selectedItem: null as ItemInventario | null,
  tipoAjuste: '+' as '+' | '-' | 'inicial',
  cantidad: 0,
  motivo: ''
});

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

const onItemSelected = (item: ItemInventario | null) => {
  formData.value.selectedItem = item;
};

const calcularStockResultante = (): number => {
  if (!formData.value.selectedItem) return 0;

  const stockActual = formData.value.selectedItem.inventario_actual;
  const cantidad = formData.value.cantidad || 0;

  if (formData.value.tipoAjuste === 'inicial') {
    return cantidad; // Para inventario inicial, el stock resultante es la cantidad ingresada
  } else if (formData.value.tipoAjuste === '+') {
    return stockActual + cantidad;
  } else {
    return stockActual - cantidad;
  }
};

const validarCantidadNegativa = (cantidad: number): boolean => {
  // Para inventario inicial, cualquier valor es válido (incluso 0)
  if (formData.value.tipoAjuste === 'inicial') {
    return true;
  }

  // Para entrada, siempre es válido
  if (!formData.value.selectedItem || formData.value.tipoAjuste === '+') {
    return true;
  }

  // Para salida, validar que no quede negativo
  const stockResultante = formData.value.selectedItem.inventario_actual - cantidad;
  return stockResultante >= 0;
};

const onSubmit = async () => {
  if (!formData.value.selectedItem) {
    $q.notify({
      type: 'warning',
      message: 'Debe seleccionar un item',
      position: 'top'
    });
    return;
  }

  loading.value = true;

  try {
    const response = await ajustesInventarioService.create({
      idItem: formData.value.selectedItem.id,
      tipoAjuste: formData.value.tipoAjuste,
      cantidad: formData.value.cantidad,
      motivo: formData.value.motivo
    });

    $q.notify({
      type: 'positive',
      message: response.mensaje || 'Ajuste guardado correctamente',
      position: 'top',
      caption: `Stock anterior: ${response.inventarioAnterior} → Nuevo: ${response.inventarioNuevo}`
    });

    router.push('/ajustes-inventario');
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || 'Error al guardar el ajuste',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadItems();
});
</script>
