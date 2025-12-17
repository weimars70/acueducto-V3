<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { notaDebitoConceptoService } from '../services/api/nota-debito-concepto.service';
import type { CreateNotaDebitoConceptoDto } from '../types/nota-debito-concepto';

const $q = useQuasar();
const router = useRouter();

const loading = ref(false);
const formData = ref<CreateNotaDebitoConceptoDto>({
  descripcion: ''
});

const handleSubmit = async () => {
  if (!formData.value.descripcion) {
    $q.notify({ type: 'warning', message: 'La descripción es obligatoria' });
    return;
  }

  try {
    loading.value = true;
    await notaDebitoConceptoService.create(formData.value);
    $q.notify({ type: 'positive', message: 'Concepto creado exitosamente' });
    router.push('/notas-debito-conceptos');
  } catch (error) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'Error al crear el concepto' });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="text-center q-mb-lg">
             <div class="text-h5 text-weight-bold text-primary">Nuevo Concepto de Nota Débito</div>
             <div class="text-caption text-grey-7">Complete la información para crear un nuevo concepto</div>
        </div>

        <q-card class="shadow-3 rounded-borders">
          <q-card-section class="q-pa-lg">
            <q-form @submit="handleSubmit" class="q-gutter-md">

              <div class="row q-mb-md">
                  <div class="col-12">
                     <label class="text-weight-medium text-grey-8 q-mb-xs block">Descripción <span class="text-negative">*</span></label>
                      <q-input
                        outlined
                        dense
                        v-model="formData.descripcion"
                        placeholder="Ej. Concepto para notas débito especiales"
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
                  to="/notas-debito-conceptos"
                  no-caps
                  class="cancel-btn"
                />
                <q-btn
                  label="Guardar Concepto"
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
