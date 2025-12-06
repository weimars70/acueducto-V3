<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { conceptoFacturaService } from '../services/api/concepto-factura.service';
import type { UpdateConceptoFacturaDto } from '../types/concepto-factura';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

const loading = ref(false);
const loadingData = ref(true);
const codigo = Number(route.params.id);

const formData = ref<UpdateConceptoFacturaDto>({
  nombre: '',
  activo: true,
  usarDiferido: false
});

const loadData = async () => {
    try {
        const data = await conceptoFacturaService.getById(codigo);
        formData.value = {
            nombre: data.nombre,
            activo: data.activo,
            usarDiferido: data.usarDiferido,
            usuario: data.usuario
        };
    } catch (error) {
        $q.notify({ type: 'negative', message: 'Error al cargar datos' });
        router.push('/conceptos-factura');
    } finally {
        loadingData.value = false;
    }
}

const handleSubmit = async () => {
  if (!formData.value.nombre) {
    $q.notify({ type: 'warning', message: 'El nombre es obligatorio' });
    return;
  }

  try {
    loading.value = true;
    await conceptoFacturaService.update(codigo, formData.value);
    $q.notify({ type: 'positive', message: 'Concepto actualizado exitosamente' });
    router.push('/conceptos-factura');
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
             <div class="text-h5 text-weight-bold text-primary">Editar Concepto</div>
             <div class="text-caption text-grey-7">Modifique la información del concepto de facturación</div>
        </div>

        <q-card class="shadow-3 rounded-borders">
          <q-card-section v-if="loadingData" class="row justify-center q-pa-xl">
             <q-spinner-dots color="primary" size="3em" />
             <div class="text-grey-6 q-mt-sm full-width text-center">Cargando información...</div>
          </q-card-section>

          <q-card-section v-else class="q-pa-lg">
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
                           <q-icon name="edit" color="grey-6" />
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

              <div class="row justify-between q-mt-xl items-center">
                <q-btn flat label="Cancelar" color="grey-8" to="/conceptos-factura" no-caps class="text-weight-medium" />
                <q-btn label="Actualizar Concepto" type="submit" color="primary" Unelevated class="q-px-lg shadow-1" rounded :loading="loading" no-caps />
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
</style>
