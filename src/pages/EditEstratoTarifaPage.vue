<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { estratosTarifasService } from '../services/api/estratos-tarifas.service';
import { estratosService } from '../services/api/estratos.service';
import { estratosTipoService } from '../services/api/estratos-tipo.service';
import { useAuthStore } from '../stores/auth';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref(false);
const estName = ref('');
const tipoName = ref('');

const formData = ref({
  codigo: 0,
  tipo: 0,
  estrato: '',
  cargo: 0,
  m3_0_20: 0,
  m3_21_40: 0,
  m3_41_x: 0,
  interes: 1,
  subsidioCargoFijo: 0,
  subsidioConsumo: 0,
  subsidioConsumoComplementario: 0,
  subsidioConsumoSuntuario: 0,
  empresaId: 0,
  usuario: ''
});

const loadData = async () => {
    try {
        const codigo = Number(route.params.codigo);
        const tipo = Number(route.params.tipo);
        
        const [data, kEstratos, kTipos] = await Promise.all([
            estratosTarifasService.getById(codigo, tipo),
            estratosService.getAll(authStore.user?.empresaId), // Cache handling would be better but this works
            estratosTipoService.getAll(authStore.user?.empresaId)
        ]);

        formData.value = { ...data, usuario: authStore.user?.email || '' };
        
        // Find names for display (readonly)
        const e = kEstratos.find(x => x.codigo === codigo);
        const t = kTipos.find(x => x.codigo === tipo);
        estName.value = e ? e.nombre : String(codigo);
        tipoName.value = t ? t.nombre : String(tipo);

    } catch (e) {
        $q.notify({ type: 'negative', message: 'Error cargando datos' });
        router.push('/estratos-tarifas');
    }
};

const handleSubmit = async () => {
    try {
        loading.value = true;
        await estratosTarifasService.update(formData.value.codigo, formData.value.tipo, formData.value);
        $q.notify({ type: 'positive', message: 'Tarifa actualizada correctamente' });
        router.push('/estratos-tarifas');
    } catch (error) {
        console.error(error);
        $q.notify({ type: 'negative', message: 'No se pudo actualizar la tarifa' });
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
      <div class="col-12 col-md-10 col-lg-8">
        <div class="row items-center q-mb-lg">
             <q-btn flat round icon="arrow_back" color="grey-8" @click="$router.go(-1)" class="q-mr-md" />
             <div>
                <div class="text-h5 text-weight-bold text-primary">Editar Tarifa</div>
             </div>
        </div>

        <q-card class="shadow-4 rounded-xl bg-white overflow-hidden">
          <q-card-section class="q-pa-xl">
            <q-form @submit="handleSubmit" class="q-gutter-md">
                
                <div class="text-subtitle2 text-grey-8 q-mb-sm text-uppercase text-weight-bold letter-spacing-1">Clasificación (Solo Lectura)</div>
                <div class="row q-col-gutter-lg">
                    <div class="col-12 col-md-6">
                        <label class="text-weight-medium text-grey-9 q-mb-xs block">Estrato</label>
                        <q-input outlined dense :model-value="estName" readonly class="modern-input bg-grey-2" />
                    </div>
                    <div class="col-12 col-md-6">
                        <label class="text-weight-medium text-grey-9 q-mb-xs block">Tipo</label>
                        <q-input outlined dense :model-value="tipoName" readonly class="modern-input bg-grey-2" />
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
                    <q-btn label="Actualizar" type="submit" color="primary" unelevated class="q-px-xl shadow-2" rounded :loading="loading" no-caps />
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
