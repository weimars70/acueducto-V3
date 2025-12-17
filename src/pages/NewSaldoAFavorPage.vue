<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { saldosAFavorService } from '../services/api/saldo-a-favor.service';
import { instalacionesService } from '../services/api/instalaciones.service';
import { useAuthStore } from '../stores/auth';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const optionsInstalaciones = ref<any[]>([]);

const form = ref({
  instalacion: null as any,
  creditoDisplay: '',
  credito: 0,
  observacion: '',
  fecha: new Date().toISOString().split('T')[0]
});

const filterInstalaciones = async (val: string, update: any) => {
  if (val === '') {
    update(() => {
      optionsInstalaciones.value = [];
    });
    return;
  }

  update(async () => {
    try {
      const results = await instalacionesService.getAll(undefined, val);
      optionsInstalaciones.value = results.map(i => ({
        label: `${i.codigo} - ${i.nombre}`,
        value: i.codigo
      }));
    } catch (error) {
      console.error('Error buscando instalaciones', error);
    }
  });
};

const updateCredito = (val: string | number | null) => {
    if (!val) {
        form.value.credito = 0;
        return;
    }
    const stringVal = val.toString();
    // Remove dots and replace comma with dot
    const cleanVal = stringVal.replace(/\./g, '').replace(',', '.');
    form.value.credito = parseFloat(cleanVal);
};

const handleSubmit = async () => {
    if (!form.value.instalacion) {
        $q.notify({ type: 'warning', message: 'Seleccione una instalación' });
        return;
    }
    if (!form.value.credito || form.value.credito <= 0) {
        $q.notify({ type: 'warning', message: 'Ingrese un valor de crédito válido' });
        return;
    }
    if (!form.value.observacion) {
        $q.notify({ type: 'warning', message: 'Ingrese una observación' });
        return;
    }

    try {
        loading.value = true;
        await saldosAFavorService.create({
            instalacion: form.value.instalacion.value,
            credito: form.value.credito,
            observacion: form.value.observacion,
            fecha: form.value.fecha,
            // Backend fills defaults: usuario, empresaId, factura, debito, nuevoSaldo
        });

        $q.notify({ type: 'positive', message: 'Saldo a favor registrado exitosamente' });
        router.push('/instalaciones/saldos-a-favor');

    } catch (error) {
        console.error(error);
        $q.notify({ type: 'negative', message: 'Error al registrar el saldo a favor' });
    } finally {
        loading.value = false;
    }
};

const handleCancel = () => {
    router.push('/instalaciones/saldos-a-favor');
};
</script>

<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="text-center q-mb-lg">
             <div class="text-h5 text-weight-bold text-primary">Nuevo Saldo a Favor</div>
             <div class="text-caption text-grey-7">Registre un anticipo o saldo a favor</div>
        </div>

        <q-card class="shadow-3 rounded-borders">
          <q-card-section class="q-pa-lg">
            <q-form @submit="handleSubmit" class="q-gutter-md">
                
                <div class="row q-col-gutter-md">
                    <div class="col-12">
                         <label class="text-weight-medium text-grey-8 q-mb-xs block">Instalación <span class="text-negative">*</span></label>
                         <q-select
                            outlined
                            dense
                            v-model="form.instalacion"
                            use-input
                            input-debounce="300"
                            :options="optionsInstalaciones"
                            @filter="filterInstalaciones"
                            placeholder="Buscar por código o nombre"
                            class="modern-input"
                         >
                            <template v-slot:prepend>
                                <q-icon name="home" color="grey-6" />
                            </template>
                            <template v-slot:no-option>
                                <q-item>
                                    <q-item-section class="text-grey">Sin resultados</q-item-section>
                                </q-item>
                            </template>
                         </q-select>
                    </div>

                    <div class="col-12 col-md-6">
                         <label class="text-weight-medium text-grey-8 q-mb-xs block">Fecha</label>
                         <q-input
                            outlined
                            dense
                            v-model="form.fecha"
                            type="date"
                            readonly
                            class="modern-input bg-grey-2"
                         />
                    </div>

                    <div class="col-12 col-md-6">
                         <label class="text-weight-medium text-grey-8 q-mb-xs block">Valor (Crédito) <span class="text-negative">*</span></label>
                         <q-input
                            outlined
                            dense
                            v-model="form.creditoDisplay"
                            @update:model-value="updateCredito"
                            mask="#.###,##"
                            reverse-fill-mask
                            placeholder="0,00"
                            class="modern-input"
                         >
                            <template v-slot:prepend>
                                <q-icon name="attach_money" color="grey-6" />
                            </template>
                         </q-input>
                    </div>

                    <div class="col-12">
                         <label class="text-weight-medium text-grey-8 q-mb-xs block">Observación <span class="text-negative">*</span></label>
                         <q-input
                            outlined
                            dense
                            v-model="form.observacion"
                            type="textarea"
                            rows="3"
                            placeholder="Ingrese detalles del movimiento"
                            class="modern-input"
                         />
                    </div>
                </div>

                <div class="row justify-end q-mt-xl q-gutter-sm">
                    <q-btn
                        label="Cancelar"
                        outline
                        color="grey-8"
                        @click="handleCancel"
                        no-caps
                        class="action-btn"
                    />
                     <q-btn
                        label="Guardar"
                        type="submit"
                        color="primary"
                        unelevated
                        :loading="loading"
                        icon="save"
                        no-caps
                        class="action-btn"
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
.action-btn {
    min-width: 120px;
    border-radius: 8px;
}
</style>
