<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { profesionesService } from '../services/api/profesiones.service';

const $q = useQuasar();
const router = useRouter();

const loading = ref(false);
const formData = ref({
  nombre: ''
});

const handleSubmit = async () => {
    if (!formData.value.nombre) return;

    try {
        loading.value = true;
        await profesionesService.create(formData.value);
        $q.notify({ type: 'positive', message: 'Profesión guardada correctamente' });
        router.push('/profesiones');
    } catch (error) {
        console.error(error);
        $q.notify({ type: 'negative', message: 'No se pudo guardar la profesión' });
    } finally {
        loading.value = false;
    }
};
</script>

<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="row items-center q-mb-lg">
             <q-btn flat round icon="arrow_back" color="grey-8" @click="$router.go(-1)" class="q-mr-md" />
             <div>
                <div class="text-h5 text-weight-bold text-primary">Nueva Profesión</div>
             </div>
        </div>

        <q-card class="shadow-4 rounded-xl bg-white overflow-hidden">
          <q-card-section class="q-pa-xl">
            <q-form @submit="handleSubmit" class="q-gutter-md">
                <label class="text-weight-medium text-grey-9 q-mb-xs block">Nombre de la Profesión</label>
                <q-input
                    outlined
                    dense
                    v-model="formData.nombre"
                    placeholder="Ej: Ingeniero Civil"
                    class="modern-input bg-grey-1"
                    :rules="[val => !!val || 'Requerido']"
                />

                <div class="row justify-end q-mt-xl items-center q-gutter-md">
                    <q-btn 
                      outline 
                      label="Cancelar" 
                      color="grey-7" 
                      to="/profesiones" 
                      no-caps 
                      class="action-btn cancel-btn" 
                      icon="close"
                    />
                    <q-btn 
                      label="Guardar" 
                      type="submit" 
                      color="primary" 
                      unelevated 
                      class="action-btn save-btn" 
                      :loading="loading" 
                      no-caps 
                      icon="save"
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
.rounded-xl { border-radius: 20px; }
.modern-input :deep(.q-field__control) { border-radius: 10px; border-color: transparent; }
.modern-input :deep(.q-field__control:hover) { border-color: #e0e0e0; }

.action-btn {
  min-width: 110px;
  height: 38px;
  padding: 0 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 13px;
  letter-spacing: 0.2px;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #fff4e6 !important;
  border-color: #fb923c !important;
  color: #ea580c !important;
}

.save-btn {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.save-btn:hover {
  background: #28A745 !important;
  border-color: #28A745 !important;
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4) !important;
  transform: translateY(-2px);
}

.save-btn:active {
  transform: translateY(0);
}
</style>
