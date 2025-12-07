<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { estratosTarifasService } from '../services/api/estratos-tarifas.service';
import { estratosService } from '../services/api/estratos.service';
import { estratosTipoService } from '../services/api/estratos-tipo.service';
import type { Estrato } from '../types/estrato';
import type { EstratoTipo } from '../types/estrato-tipo';
import { useAuthStore } from '../stores/auth';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const estratos = ref<Estrato[]>([]);
const tipos = ref<EstratoTipo[]>([]);

const formData = ref({
  codigo: null as number | null, // Select Estrato
  tipo: null as number | null,   // Select Tipo
  estrato: '0',
  cargo: 0,
  m3_0_20: 0,
  m3_21_40: 0,
  m3_41_x: 0,
  interes: 1,
  subsidioCargoFijo: 0,
  subsidioConsumo: 0,
  subsidioConsumoComplementario: 0,
  subsidioConsumoSuntuario: 0,
  empresaId: authStore.user?.empresaId || 0,
  usuario: authStore.user?.email || ''
});

const loadCatalogs = async () => {
    try {
        const empresaId = authStore.user?.empresaId;
        const [kEstratos, kTipos] = await Promise.all([
            estratosService.getAll(empresaId),
            estratosTipoService.getAll(empresaId)
        ]);
        estratos.value = kEstratos;
        tipos.value = kTipos;
    } catch (e) {
        console.error(e);
        $q.notify({ type: 'negative', message: 'Error cargando catálogos' });
    }
};

const handleSubmit = async () => {
    if (!formData.value.codigo || !formData.value.tipo) {
        $q.notify({ type: 'warning', message: 'Seleccione Estrato y Tipo' });
        return;
    }

    try {
        loading.value = true;
        // Cast to any to bypass strict type checking for submit, or validation ensures non-null
        await estratosTarifasService.create(formData.value as any);
        $q.notify({ type: 'positive', message: 'Tarifa guardada correctamente' });
        router.push('/estratos-tarifas');
    } catch (error) {
        console.error(error);
        $q.notify({ type: 'negative', message: 'No se pudo guardar la tarifa. Verifique que no exista ya.' });
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadCatalogs();
});
</script>

<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <div class="row items-center q-mb-lg">
             <q-btn flat round icon="arrow_back" color="grey-8" @click="$router.go(-1)" class="q-mr-md" />
             <div>
                <div class="text-h5 text-weight-bold text-primary">Nueva Tarifa</div>
             </div>
        </div>

        <q-card class="shadow-4 rounded-xl bg-white overflow-hidden">
          <q-card-section class="q-pa-xl">
            <q-form @submit="handleSubmit" class="q-gutter-md">
                
                <div class="text-subtitle2 text-grey-8 q-mb-sm text-uppercase text-weight-bold letter-spacing-1">Clasificación</div>
                <div class="row q-col-gutter-lg">
                    <div class="col-12 col-md-6">
                        <label class="text-weight-medium text-grey-9 q-mb-xs block">Estrato</label>
                        <q-select
                            outlined
                            dense
                            v-model="formData.codigo"
                            :options="estratos"
                            option-value="codigo"
                            option-label="nombre"
                            emit-value
                            map-options
                            placeholder="Seleccione..."
                            class="modern-input bg-grey-1"
                            :rules="[val => !!val || 'Requerido']"
                        />
                    </div>
                    <div class="col-12 col-md-6">
                        <label class="text-weight-medium text-grey-9 q-mb-xs block">Tipo</label>
                        <q-select
                            outlined
                            dense
                            v-model="formData.tipo"
                            :options="tipos"
                            option-value="codigo"
                            option-label="nombre"
                            emit-value
                            map-options
                            placeholder="Seleccione..."
                            class="modern-input bg-grey-1"
                            :rules="[val => !!val || 'Requerido']"
                        />
                    </div>
                </div>

                <q-separator class="q-my-md" />

                <div class="text-subtitle2 text-grey-8 q-mb-sm text-uppercase text-weight-bold letter-spacing-1">Valores</div>
                <div class="row q-col-gutter-lg">
                     <div class="col-12 col-md-3">
                        <label class="text-weight-medium text-grey-9 q-mb-xs block">Cargo Fijo</label>
                        <q-input outlined dense type="number" v-model.number="formData.cargo" prefix="$" class="modern-input bg-grey-1" />
                    </div>
                    <div class="col-12 col-md-3">
                        <label class="text-weight-medium text-grey-9 q-mb-xs block">0-20 m³</label>
                        <q-input outlined dense type="number" v-model.number="formData.m3_0_20" prefix="$" class="modern-input bg-grey-1" />
                    </div>
                    <div class="col-12 col-md-3">
                        <label class="text-weight-medium text-grey-9 q-mb-xs block">21-40 m³</label>
                        <q-input outlined dense type="number" v-model.number="formData.m3_21_40" prefix="$" class="modern-input bg-grey-1" />
                    </div>
                     <div class="col-12 col-md-3">
                        <label class="text-weight-medium text-grey-9 q-mb-xs block">> 41 m³</label>
                        <q-input outlined dense type="number" v-model.number="formData.m3_41_x" prefix="$" class="modern-input bg-grey-1" />
                    </div>
                </div>

                <q-separator class="q-my-md" />
                
                <div class="text-subtitle2 text-grey-8 q-mb-sm text-uppercase text-weight-bold letter-spacing-1">Subsidios</div>
                 <div class="row q-col-gutter-lg">
                     <div class="col-12 col-md-3">
                        <label class="text-weight-medium text-grey-9 q-mb-xs block">Sub. Cargo Fijo</label>
                        <q-input outlined dense type="number" v-model.number="formData.subsidioCargoFijo" prefix="$" class="modern-input bg-grey-1" />
                    </div>
                    <div class="col-12 col-md-3">
                        <label class="text-weight-medium text-grey-9 q-mb-xs block">Sub. Consumo</label>
                        <q-input outlined dense type="number" v-model.number="formData.subsidioConsumo" prefix="$" class="modern-input bg-grey-1" />
                    </div>
                </div>


                <div class="row justify-end q-mt-xl items-center q-gutter-md">
                    <q-btn flat label="Cancelar" color="grey-7" to="/estratos-tarifas" no-caps class="text-weight-bold" />
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
.letter-spacing-1 { letter-spacing: 1px; }
</style>
