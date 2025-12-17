<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { conceptoFacturaService } from '../services/api/concepto-factura.service';
import { useAuthStore } from '../stores/auth';
import type { CreateConceptoFacturaDto } from '../types/concepto-factura';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const formData = ref<CreateConceptoFacturaDto>({
  nombre: '',
  activo: true,
  usarDiferido: false
});

const handleSubmit = async () => {
  if (!formData.value.nombre) {
    $q.notify({ type: 'warning', message: 'El nombre es obligatorio' });
    return;
  }

  try {
    loading.value = true;
    await conceptoFacturaService.create(formData.value);
    $q.notify({ type: 'positive', message: 'Concepto creado exitosamente' });
    router.push('/conceptos-factura');
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
             <div class="text-h5 text-weight-bold text-primary">Nuevo Concepto</div>
             <div class="text-caption text-grey-7">Complete la información para crear un nuevo concepto de facturación</div>
        </div>

        <q-card class="shadow-3 rounded-borders">
          <q-card-section class="q-pa-lg">
            <q-form @submit="handleSubmit" class="q-gutter-md">
              
              <div class="row q-mb-md">
                  <div class="col-12">
                     <label class="text-weight-medium text-grey-8 q-mb-xs block">Nombre del Concepto <span class="text-negative">*</span></label>
                      <q-input
                        outlined
                        dense
                        v-model="formData.nombre"
                        placeholder="Ej. Cargo Fijo Acueducto"
                        lazy-rules
                        :rules="[val => !!val || 'El nombre es requerido']"
                        class="modern-input"
                      >
                         <template v-slot:prepend>
                           <q-icon name="edit_note" color="grey-6" />
                         </template>
                      </q-input>
                  </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="row q-col-gutter-lg">
                <div class="col-12 col-sm-6">
                    <q-item tag="label" class="bg-grey-1 rounded-borders q-pa-sm" v-ripple>
                        <q-item-section>
                        <q-item-label>Estado</q-item-label>
                        <q-item-label caption>{{ formData.activo ? 'Activo' : 'Inactivo' }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                        <q-toggle color="primary" v-model="formData.activo" />
                        </q-item-section>
                    </q-item>
                </div>
                <div class="col-12 col-sm-6">
                     <q-item tag="label" class="bg-grey-1 rounded-borders q-pa-sm" v-ripple>
                        <q-item-section>
                        <q-item-label>Diferido</q-item-label>
                        <q-item-label caption>{{ formData.usarDiferido ? 'Habilitado' : 'Deshabilitado' }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                        <q-toggle color="secondary" v-model="formData.usarDiferido" />
                        </q-item-section>
                    </q-item>
                </div>
              </div>

              <div class="row justify-end q-mt-xl q-gutter-sm items-center">
                <q-btn
                  label="Cancelar"
                  color="grey-8"
                  outline
                  icon="close"
                  to="/conceptos-factura"
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
