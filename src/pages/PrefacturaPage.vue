<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { prefacturaService } from '../services/api/prefactura.service';

const $q = useQuasar();

const loading = ref(false);
const optionsMeses = ref<any[]>([]);
const form = ref({
  mes: null as any,
  year: new Date().getFullYear()
});

// Generar opciones de años: año actual y el anterior
const currentYear = new Date().getFullYear();
const optionsYears = [currentYear, currentYear - 1];

const loadMeses = async () => {
    try {
        const data = await prefacturaService.getMeses();
        // Mapear para q-select si es necesario, o usar directamente si devuelve id/nombre
        optionsMeses.value = data.map((m: any) => ({
             label: m.nombre, // Ajustar según columna real de BD
             value: m.id      // Ajustar según columna real de BD
        }));

        // Si la carga falla o devuelve vacío, llenar manualmente 1-12 como fallback
        if (optionsMeses.value.length === 0) {
             const mesesNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
             optionsMeses.value = mesesNames.map((nombre, index) => ({ label: nombre, value: index + 1 }));
        }

    } catch (error) {
        console.error('Error cargando meses', error);
         // Fallback manual
         const mesesNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
         optionsMeses.value = mesesNames.map((nombre, index) => ({ label: nombre, value: index + 1 }));
    }
};

const handleGenerar = async () => {
  if (!form.value.mes || !form.value.year) {
      $q.notify({ type: 'warning', message: 'Debe seleccionar Mes y Año' });
      return;
  }

  try {
    loading.value = true;
    await prefacturaService.generar({
        mes: typeof form.value.mes === 'object' ? form.value.mes.value : form.value.mes,
        year: form.value.year
    });
    
    $q.notify({ 
        type: 'positive', 
        message: 'Prefactura generada exitosamente',
        icon: 'check_circle'
    });

  } catch (error) {
    console.error(error);
    $q.notify({ 
        type: 'negative', 
        message: 'Error al generar la prefactura. Verifique que no exista ya para este periodo.',
        icon: 'error'
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
    loadMeses();
});
</script>

<template>
  <q-page class="q-pa-lg bg-grey-1 flex flex-center">
    <q-card class="shadow-3 rounded-borders form-card">
      <q-card-section class="bg-primary text-white q-py-lg">
        <div class="row items-center no-wrap">
            <q-icon name="receipt_long" size="md" class="q-mr-md" />
            <div class="text-h6 text-weight-bold">Generar Prefactura</div>
        </div>
        <div class="text-subtitle2 q-mt-sm opacity-8">
            Seleccione el periodo para generar la prefacturación
        </div>
      </q-card-section>

      <q-card-section class="q-pa-xl">
        <q-form @submit="handleGenerar" class="q-gutter-lg">
            
            <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                    <label class="text-weight-medium text-grey-8 q-mb-sm block">Año</label>
                    <q-select
                        outlined
                        dense
                        v-model="form.year"
                        :options="optionsYears"
                        emit-value
                        map-options
                        class="modern-select"
                        behavior="menu"
                    >
                         <template v-slot:prepend>
                           <q-icon name="calendar_today" color="primary" />
                         </template>
                    </q-select>
                </div>

                <div class="col-12 col-md-6">
                     <label class="text-weight-medium text-grey-8 q-mb-sm block">Mes</label>
                    <q-select
                        outlined
                        dense
                        v-model="form.mes"
                        :options="optionsMeses"
                        emit-value
                        map-options
                        label="Seleccione Mes"
                        class="modern-select"
                        behavior="menu"
                    >
                         <template v-slot:prepend>
                           <q-icon name="date_range" color="primary" />
                         </template>
                    </q-select>
                </div>
            </div>

            <div class="row justify-end q-mt-xl">
                <q-btn
                    label="Generar Prefactura"
                    type="submit"
                    color="primary"
                    unelevated
                    size="lg"
                    class="full-width text-weight-bold shadow-2 submit-btn"
                    :loading="loading"
                    icon="play_arrow"
                >
                    <template v-slot:loading>
                        <q-spinner-facebook />
                    </template>
                </q-btn>
            </div>

        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style scoped>
.form-card {
    width: 100%;
    max-width: 600px;
}
.rounded-borders {
  border-radius: 16px;
  overflow: hidden;
}
.modern-select :deep(.q-field__control) {
    border-radius: 8px;
    height: 56px; /* Taller inputs */
}

.opacity-8 {
    opacity: 0.8;
}

.submit-btn {
    border-radius: 12px;
    height: 54px;
    transition: all 0.3s ease;
}

.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(25, 118, 210, 0.4);
}
</style>
