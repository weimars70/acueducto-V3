<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { itemsService } from '../services/api/items.service';
import { itemsGruposService } from '../services/api/item-grupo.service';
import { useAuthStore } from '../stores/auth';
import type { ItemGrupo } from '../types/item-grupo';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  codigo: '',
  nombre: '',
  grupo: null as ItemGrupo | null,
  precioSinIva: 0,
  porIva: 0,
  precioTotal: 0,
  precioVenta: 0,
  invValorCompra: 0,
  invValorVenta: 0,
  inventarioActual: 0
});

const grupos = ref<ItemGrupo[]>([]);
const gruposOptions = ref<ItemGrupo[]>([]);
const saving = ref(false);

const loadGrupos = async () => {
  try {
    const empresaId = authStore.user?.empresaId || 1;
    grupos.value = await itemsGruposService.getByEmpresa(empresaId);
    gruposOptions.value = grupos.value;
  } catch (error) {
    console.error('Error al cargar grupos:', error);
    $q.notify({ type: 'negative', message: 'Error cargando grupos de inventario' });
  }
};

const filterGrupos = (val: string, update: (fn: () => void) => void) => {
  if (val === '') {
    update(() => {
      gruposOptions.value = grupos.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    gruposOptions.value = grupos.value.filter(v => 
      v.nombre.toLowerCase().indexOf(needle) > -1
    );
  });
};

// Auto-calculate Total Price
watch(
  () => [form.value.precioSinIva, form.value.porIva],
  ([price, vat]) => {
    if (price !== undefined && vat !== undefined) {
      const total = Number(price) + (Number(price) * (Number(vat) / 100));
      form.value.precioTotal = Number(total.toFixed(2));
    }
  }
);

const handleSubmit = async () => {
  try {
    if (!form.value.nombre || !form.value.grupo) {
      $q.notify({
        type: 'warning',
        message: 'Por favor complete los campos requeridos'
      });
      return;
    }

    saving.value = true;
    const empresaId = authStore.user?.empresaId || 1;
    
    await itemsService.create({
      codigo: form.value.codigo,
      nombre: form.value.nombre,
      grupo: form.value.grupo.id,
      precio_sin_iva: Number(form.value.precioSinIva),
      por_iva: Number(form.value.porIva),
      precio_total: Number(form.value.precioTotal),
      precio_venta: Number(form.value.precioVenta),
      inv_valor_compra: Number(form.value.invValorCompra),
      inv_valor_venta: Number(form.value.invValorVenta),
      inventario_actual: Number(form.value.inventarioActual),
      empresa_id: empresaId,
      usuario: authStore.user?.email
    });

    $q.notify({
      type: 'positive',
      message: 'Item creado exitosamente'
    });

    router.push('/items');
  } catch (error) {
    console.error('Error al crear item:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al crear el item'
    });
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadGrupos();
});
</script>

<template>
  <q-page class="page">
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <q-btn
              flat
              round
              icon="arrow_back"
              color="primary"
              class="q-mr-md"
              @click="router.back()"
            />
            <div>
              <h1 class="page-title">Nuevo Item</h1>
              <p class="page-subtitle">Crear un nuevo producto o servicio</p>
            </div>
          </div>
        </div>
      </div>

      <q-card flat class="form-card">
        <q-form @submit="handleSubmit" class="q-pa-lg">
          <div class="row q-col-gutter-lg">
            <!-- Basic Info -->
            <div class="col-12 text-subtitle1 text-weight-medium text-grey-8 q-mb-sm">Información Básica</div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.codigo"
                label="Código"
                outlined
                hint="Identificador único (opcional)"
              />
            </div>
            <div class="col-12 col-md-8">
              <q-input
                v-model="form.nombre"
                label="Nombre del Item *"
                outlined
                :rules="[val => !!val || 'El nombre es obligatorio']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.grupo"
                :options="gruposOptions"
                option-label="nombre"
                option-value="id"
                label="Grupo *"
                outlined
                use-input
                input-debounce="0"
                clearable
                @filter="filterGrupos"
                :rules="[val => !!val || 'Seleccione un grupo']"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No hay resultados
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            
            <div class="col-12"><q-separator class="q-my-md" /></div>

            <!-- Pricing -->
            <div class="col-12 text-subtitle1 text-weight-medium text-grey-8 q-mb-sm">Precios e Inventario</div>
            <div class="col-12 col-md-3">
              <q-input
                v-model.number="form.precioSinIva"
                label="Precio Sin IVA *"
                type="number"
                outlined
                prefix="$"
                :rules="[val => val >= 0 || 'El precio no puede ser negativo']"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model.number="form.porIva"
                label="IVA (%) *"
                type="number"
                outlined
                suffix="%"
                :rules="[val => val >= 0 || 'El IVA no puede ser negativo']"
              />
            </div>
             <div class="col-12 col-md-3">
              <q-input
                v-model.number="form.precioTotal"
                label="Precio Total (Costo)"
                type="number"
                outlined
                readonly
                bg-color="grey-1"
                prefix="$"
                hint="Calculado automáticamente"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model.number="form.precioVenta"
                label="Precio Venta Publico"
                type="number"
                outlined
                prefix="$"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model.number="form.invValorCompra"
                label="Valor Compra"
                type="number"
                outlined
                prefix="$"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model.number="form.invValorVenta"
                label="Valor Venta"
                type="number"
                outlined
                prefix="$"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model.number="form.inventarioActual"
                label="Inventario Inicial"
                type="number"
                outlined
              />
            </div>
          </div>

          <div class="row justify-end q-mt-lg form-actions">
            <q-btn
              label="Cancelar"
              outline
              color="grey-7"
              class="action-btn cancel-btn"
              @click="router.back()"
              icon="close"
            />
            <q-btn
              type="submit"
              label="Guardar Item"
              color="primary"
              unelevated
              :loading="saving"
              class="action-btn save-btn"
              icon="save"
            />
          </div>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  line-height: 1.2;
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: #718096;
}

.form-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.action-btn {
  min-width: 120px;
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.2px;
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
</style>
