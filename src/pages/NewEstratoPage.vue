<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { estratosService } from '../services/api/estratos.service';
import { useAuthStore } from '../stores/auth';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const formData = ref({
  nombre: '',
  empresaId: authStore.user?.empresaId || 0,
  usuario: authStore.user?.email || ''
});

const handleSubmit = async () => {
    if (!formData.value.nombre) return;

    try {
        loading.value = true;
        await estratosService.create(formData.value);
        $q.notify({ type: 'positive', message: 'Estrato guardado correctamente' });
        router.push('/estratos');
    } catch (error) {
        console.error(error);
        $q.notify({ type: 'negative', message: 'No se pudo guardar el estrato' });
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
                <div class="text-h5 text-weight-bold text-primary">Nuevo Estrato</div>
             </div>
        </div>

        <q-card class="shadow-4 rounded-xl bg-white overflow-hidden">
          <q-card-section class="q-pa-xl">
            <q-form @submit="handleSubmit" class="q-gutter-md">
                <label class="text-weight-medium text-grey-9 q-mb-xs block">Nombre del Estrato</label>
                <q-input
                    outlined
                    dense
                    v-model="formData.nombre"
                    placeholder="Ej: Estrato 1"
                    class="modern-input bg-grey-1"
                    :rules="[val => !!val || 'Requerido']"
                />

                <div class="row justify-end q-mt-xl items-center q-gutter-md">
                    <q-btn flat label="Cancelar" color="grey-7" to="/estratos" no-caps class="text-weight-bold" />
                    <q-btn label="Guardar" type="submit" color="primary" unelevated class="q-px-xl shadow-2" rounded :loading="loading" no-caps />
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
</style>
