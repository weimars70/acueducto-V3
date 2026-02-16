<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { prefacturaService } from '../services/api/prefactura.service';

const $q = useQuasar();

const loading = ref(false);
const optionsMeses = ref<any[]>([]);
const form = ref({
  mes: new Date().getMonth() + 1, // Mes actual (1-12)
  year: new Date().getFullYear()
});

// Generar opciones de años: año actual y el anterior
const currentYear = new Date().getFullYear();
const optionsYears = [currentYear, currentYear - 1];

const loadMeses = async () => {
    try {
        const data = await prefacturaService.getMeses();

        // 1. Filtrar duplicados por nombre y mapear ID
        const uniqueMeses = new Map();
        data.forEach((m: any) => {
            const label = m.nombre || m.mes || m.descripcion; // Fallback names
            const value = m.id || m.codigo || m.mes_id || m.mes || label; // Fallback IDs

            if (label && !uniqueMeses.has(label)) {
                uniqueMeses.set(label, { label, value });
            }
        });

        optionsMeses.value = Array.from(uniqueMeses.values());

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

  const dto = {
      mes: typeof form.value.mes === 'object' ? form.value.mes.value : form.value.mes,
      year: form.value.year
  };

  try {
    loading.value = true;
    
    // 1. Verificar si ya existe
    const check = await prefacturaService.verificar(dto);
    loading.value = false;

    if (check.exists) {
        $q.dialog({
            title: '<div class="text-red text-weight-bold text-h5 text-center">¡Atención!</div>',
            message: '<div class="text-center text-h6 text-red-9 text-weight-bold q-pa-md">Ya se hizo prefactura para este mes</div>',
            html: true,
            ok: {
                label: 'Entendido',
                color: 'negative',
                push: true,
                size: 'lg'
            },
            persistent: true,
            class: 'text-center'
        });
        return;
    }

    // 2. Confirmar generación
    $q.dialog({
        title: '<div class="text-primary text-weight-bold text-h5 text-center">¿Confirmar Generación?</div>',
        message: '<div class="text-center text-body1 q-pa-md text-grey-8">Está a punto de generar la prefactura para el periodo seleccionado.<br><br><span class="text-negative text-weight-bold text-uppercase" style="font-size: 1.1em;"><i class="q-icon material-icons q-mr-xs">warning</i>El proceso no podrá revertirse</span></div>',
        html: true,
        persistent: true,
        ok: {
            label: 'Sí, Generar',
            color: 'primary',
            push: true,
            size: 'lg',
            icon: 'play_arrow',
            class: 'q-px-lg'
        },
        cancel: {
            label: 'Cancelar',
            color: 'grey-7',
            flat: true,
            size: 'md'
        },
        class: 'rubik-font' 
    }).onOk(async () => {
        try {
            loading.value = true;
            await prefacturaService.generar(dto);
            
            // Buscar nombre del mes para el mensaje
            const selectedMes = optionsMeses.value.find(m => m.value === dto.mes);
            const mesNombre = selectedMes ? selectedMes.label : dto.mes;

            $q.dialog({
                title: '<div class="text-positive text-weight-bold text-h5 text-center">¡Proceso Exitoso!</div>',
                message: `<div class="text-center text-body1 q-pa-md text-grey-9">
                            La prefactura se ha generado correctamente para el periodo:<br><br>
                            <div class="text-h4 text-primary text-weight-bolder bg-blue-1 q-py-sm rounded-borders">${mesNombre} ${dto.year}</div>
                          </div>`,
                html: true,
                ok: {
                    label: 'Aceptar',
                    color: 'positive',
                    push: true,
                    size: 'lg',
                    icon: 'check'
                },
                persistent: true
            });

        } catch (error) {
            console.error(error);
            $q.dialog({
                title: '<div class="text-negative text-weight-bold text-h5 text-center">¡Error en el Proceso!</div>',
                message: '<div class="text-center text-body1 q-pa-md text-grey-9">Ocurrió un error al intentar generar la prefactura.<br><br><span class="text-grey-7 text-caption">Por favor, intente nuevamente o contacte a soporte si el problema persiste.</span></div>',
                html: true,
                ok: {
                    label: 'Aceptar',
                    color: 'negative',
                    push: true,
                    size: 'lg',
                    icon: 'error_outline'
                },
                persistent: true
            });
        } finally {
            loading.value = false;
        }
    });

  } catch (error) {
    console.error(error);
    loading.value = false;
    $q.notify({ 
        type: 'negative', 
        message: 'Error verificando prefactura.',
        icon: 'error'
    });
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
                        <div class="marquee-container">
                             <span>Procesando prefactura... Por favor espere...</span>
                        </div>
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

.marquee-container {
    overflow: hidden;
    white-space: nowrap;
    width: 250px;
    position: relative;
    /* Ensure text is visible even if button sets opacity for label */
    opacity: 1;
}

.marquee-container span {
    display: inline-block;
    padding-left: 100%;
    animation: marquee 5s linear infinite;
    font-weight: bold;
    color: white; /* Ensure visibility on primary button */
}

@keyframes marquee {
    0%   { transform: translate(0, 0); }
    100% { transform: translate(-100%, 0); }
}
</style>
