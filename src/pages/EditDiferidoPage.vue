<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { diferidosService } from '../services/api/diferidos.service';
import type { UpdateDiferidoDto } from '../types/diferido';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

const loading = ref(false);
const loadingData = ref(true);
const id = Number(route.params.id);

const formData = ref<UpdateDiferidoDto>({
  cuotasPendientes: 0,
  estado: ''
});

const loadData = async () => {
    try {
        const data = await diferidosService.getById(id);
        formData.value = {
            cuotasPendientes: data.cuotasPendientes,
            estado: data.estado
        };
    } catch (error) {
        $q.notify({ type: 'negative', message: 'Error al cargar datos' });
        router.push('/diferidos');
    } finally {
        loadingData.value = false;
    }
}

const handleSubmit = async () => {
  try {
    loading.value = true;
    await diferidosService.update(id, formData.value);
    $q.notify({ type: 'positive', message: 'Diferido actualizado exitosamente' });
    router.push('/diferidos');
  } catch (error) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'Error al actualizar el diferido' });
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
        
         <div class="row items-center q-mb-lg">
             <q-btn flat round icon="arrow_back" color="grey-8" @click="$router.go(-1)" class="q-mr-md" />
             <div>
                <div class="text-h5 text-weight-bold text-primary">Editar Diferido</div>
                <div class="text-caption text-grey-7">Modifique el estado actual del diferido</div>
             </div>
        </div>

        <q-card class="shadow-3 rounded-xl bg-white">
          <q-card-section v-if="loadingData" class="row justify-center q-pa-xl">
             <q-spinner-dots color="primary" size="3em" />
             <div class="text-grey-6 q-mt-sm full-width text-center">Cargando información...</div>
          </q-card-section>

          <q-card-section v-else class="q-pa-xl">
            <q-form @submit="handleSubmit" class="q-gutter-md">
              
              <div class="row q-col-gutter-lg">
                  <div class="col-12 col-md-6">
                      <label class="text-weight-medium text-grey-9 q-mb-xs block">Cuotas Pendientes</label>
                      <q-input
                        outlined
                        dense
                        type="number"
                        v-model.number="formData.cuotasPendientes"
                        class="modern-input bg-grey-1"
                        hint="Número actual de cuotas restantes"
                      />
                  </div>
                   <div class="col-12 col-md-6">
                      <label class="text-weight-medium text-grey-9 q-mb-xs block">Estado</label>
                      <q-select
                        outlined
                        dense
                        v-model="formData.estado"
                        :options="['PENDIENTE', 'ACTIVO', 'PAGADO', 'ANULADO']"
                        class="modern-input bg-grey-1"
                      >
                         <template v-slot:option="{ itemProps, opt, selected }">
                             <q-item v-bind="itemProps">
                                 <q-item-section>
                                     <q-item-label>{{ opt }}</q-item-label>
                                 </q-item-section>
                                 <q-item-section side v-if="selected">
                                     <q-icon name="check" color="primary" />
                                 </q-item-section>
                             </q-item>
                         </template>
                      </q-select>
                  </div>
              </div>

              <div class="row justify-end q-mt-xl items-center q-gutter-md">
                <q-btn flat label="Cancelar" color="grey-7" to="/diferidos" no-caps class="text-weight-bold" />
                <q-btn label="Actualizar Diferido" type="submit" color="primary" unelevated class="q-px-xl shadow-2" rounded :loading="loading" no-caps size="md" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.rounded-xl {
  border-radius: 20px;
}
.modern-input :deep(.q-field__control) {
    border-radius: 10px;
    border-color: transparent;
}
.modern-input :deep(.q-field__control:hover) {
    border-color: #e0e0e0;
}
</style>
