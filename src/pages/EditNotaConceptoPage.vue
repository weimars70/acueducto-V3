<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { notaConceptoService } from '../services/api/nota-concepto.service';
import type { UpdateNotaConceptoDto } from '../types/nota-concepto';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

const loading = ref(false);
const loadingData = ref(true);
const codigo = Number(route.params.id);

const formData = ref<UpdateNotaConceptoDto>({
  descripcion: ''
});

const loadData = async () => {
    try {
        const data = await notaConceptoService.getById(codigo);
        formData.value = {
            descripcion: data.descripcion
        };
    } catch (error) {
        $q.notify({ type: 'negative', message: 'Error al cargar datos' });
        router.push('/notas-conceptos');
    } finally {
        loadingData.value = false;
    }
}

const handleSubmit = async () => {
  if (!formData.value.descripcion) {
    $q.notify({ type: 'warning', message: 'La descripción es obligatoria' });
    return;
  }

  try {
    loading.value = true;
    await notaConceptoService.update(codigo, formData.value);
    $q.notify({ type: 'positive', message: 'Concepto actualizado exitosamente' });
    router.push('/notas-conceptos');
  } catch (error) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'Error al actualizar el concepto' });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
    loadData();
});
</script>

<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">

        <div class="text-center q-mb-lg">
             <div class="text-h5 text-weight-bold text-primary">Editar Concepto de Nota</div>
             <div class="text-caption text-grey-7">Modifique la información del concepto</div>
        </div>

        <q-card class="shadow-3 rounded-borders">
          <q-card-section v-if="loadingData" class="row justify-center q-pa-xl">
             <q-spinner-dots color="primary" size="3em" />
             <div class="text-grey-6 q-mt-sm full-width text-center">Cargando información...</div>
          </q-card-section>

          <q-card-section v-else class="q-pa-lg">
            <q-form @submit="handleSubmit" class="q-gutter-md">

              <!-- Campo Código (solo lectura) -->
              <div class="row q-mb-md">
                  <div class="col-12">
                     <label class="text-weight-medium text-grey-8 q-mb-xs block">Código</label>
                      <q-input
                        outlined
                        dense
                        :model-value="codigo"
                        readonly
                        class="modern-input bg-grey-2"
                      >
                         <template v-slot:prepend>
                           <q-icon name="tag" color="grey-6" />
                         </template>
                      </q-input>
                  </div>
              </div>

              <div class="row q-mb-md">
                  <div class="col-12">
                     <label class="text-weight-medium text-grey-8 q-mb-xs block">Descripción <span class="text-negative">*</span></label>
                      <q-input
                        outlined
                        dense
                        v-model="formData.descripcion"
                        placeholder="Ej. Concepto para notas especiales"
                        lazy-rules
                        :rules="[val => !!val || 'La descripción es requerida']"
                        class="modern-input"
                        type="textarea"
                        rows="3"
                      >
                         <template v-slot:prepend>
                           <q-icon name="description" color="grey-6" />
                         </template>
                      </q-input>
                  </div>
              </div>

              <div class="row justify-end q-mt-xl q-gutter-sm items-center">
                <q-btn
                  label="Cancelar"
                  color="grey-8"
                  outline
                  icon="close"
                  to="/notas-conceptos"
                  no-caps
                  class="cancel-btn"
                />
                <q-btn
                  label="Actualizar Concepto"
                  type="submit"
                  color="primary"
                  unelevated
                  icon="save"
                  class="save-btn q-px-lg"
                  :loading="loading"
                  no-caps
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.rounded-borders {
  border-radius: 16px;
}
.modern-input :deep(.q-field__control) {
    border-radius: 8px;
}

/* Button hover effects */
.cancel-btn {
  &:hover {
    background: #fff4e6 !important;
    border-color: #fb923c !important;
    color: #ea580c !important;
  }
}

.save-btn {
  &:hover {
    background: #28A745 !important;
    border-color: #28A745 !important;
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4) !important;
  }
}
</style>
