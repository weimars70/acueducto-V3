import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { consumptionService } from '../services/api/consumption.service';
import { syncService } from '../services/sync/sync.service';
import { months } from '../utils/dates';
import { getErrorMessage } from '../utils/error';
import { getCurrentCoords } from '../services/geolocation';

export function useConsumptionForm(mode: 'create' | 'edit' = 'create') {
  const $q = useQuasar();
  const router = useRouter();
  const authStore = useAuthStore();
  
  const initialFormState = {
    codigo: '',
    mes: '',
    year: '',
    fecha: '',
    medidor: '',
    cliente: '',
    sector: '',
    direccion: '',
    lectura_anterior: '',
    lectura_actual: '',
    consumo: '0',
    promedio: '0',
    otros_cobros: '0',
    reconexion: '0'
  };
  
  const formData = ref({ ...initialFormState });

  const resetForm = () => {
    const { mes, year, fecha } = formData.value;
    formData.value = {
      ...initialFormState,
      mes,
      year,
      fecha
    };
  };

  const isValid = computed(() => {
    return formData.value.lectura_actual !== '' && 
           formData.value.lectura_anterior !== '' &&
           formData.value.codigo !== '';
  });

  const validateLecturaActual = (actual: number, anterior: number): boolean => {
    if (actual < anterior) {
      return false;
    }

    const consumo = actual - anterior;
    if (consumo < 0) {
      $q.notify({
        type: 'negative',
        message: 'El consumo no puede ser menor a 0'
      });
      return false;
    }

    return true;
  };

  const updateConsumo = (lecturaActual: string) => {
    const actual = parseFloat(lecturaActual);
    const anterior = parseFloat(formData.value.lectura_anterior);
    
    if (!validateLecturaActual(actual, anterior)) {
      formData.value.lectura_actual = '';
      formData.value.consumo = '0';
      return;
    }
    
    formData.value.consumo = (actual - anterior).toString();
  };

  const saveConsumption = async (capturedImage: string | null = null) => {
    if (!authStore.isAuthenticated) {
      $q.notify({
        type: 'negative',
        message: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.'
      });
      router.push('/login');
      return false;
    }

    try {
      if (!isValid.value) {
        $q.notify({
          type: 'negative',
          message: 'Por favor complete todos los campos requeridos'
        });
        return false;
      }

      const monthObj = months.find(m => m.text === formData.value.mes);
      if (!monthObj) {
        throw new Error('Mes inválido');
      }

      const coords = await getCurrentCoords();
      console.log('Coords obtenidas:', coords);

      const consumptionData = {
        instalacion: parseInt(formData.value.codigo),
        lectura: parseFloat(formData.value.lectura_actual),
        fecha: formData.value.fecha,
        consumo: parseFloat(formData.value.consumo),
        mes: monthObj.value,
        year: parseInt(formData.value.year),
        medidor: formData.value.medidor,
        otros_cobros: parseFloat(formData.value.otros_cobros),
        reconexion: parseFloat(formData.value.reconexion),
        usuario: authStore.user?.name || '',
        latitud: coords.lat,
        longitud: coords.lng,
        imagenBase64: capturedImage // Agregar imagen capturada
      };
      console.log('Payload consumo:', consumptionData);

      if (mode === 'edit') {
        const id = parseInt(router.currentRoute.value.params.id as string);
        await consumptionService.update(id, consumptionData);
        $q.notify({
          type: 'positive',
          message: 'Consumo actualizado exitosamente'
        });
        router.push('/consumptions');
      } else {
        /*$q.notify({
          type: 'positive',
          message: JSON.stringify(consumptionData, null, 2)
        });
        return;*/
        const rpta = await consumptionService.create(consumptionData);
        console.log('Respuesta create:', rpta);
        if ( rpta === 'Error consumo ya existe') {
          $q.notify({
            type: 'negative',
            message: 'El consumo para esta instalación y mes ya existe.',
            position: 'center'
          });
          return false;
        }
        if (rpta === 'guardado con geolocalizacion') {
          $q.notify({ type: 'positive', message: 'Consumo registrado con geolocalización', position: 'center' });
        } else if (rpta === 'guardado sin geolocalizacion') {
          $q.notify({ type: 'positive', message: 'Consumo registrado' , position: 'center'});
          $q.notify({ type: 'warning', message: 'No se pudo obtener la ubicación.' });
        } else {
          $q.notify({
            type: 'positive',
            message: syncService.isOnline() 
              ? 'Consumo registrado exitosamente'
              : 'Consumo guardado localmente. Se sincronizará cuando haya conexión'
          });
          if (!coords.lat || !coords.lng) {
            $q.notify({ type: 'warning', message: 'No se pudo obtener la ubicación.' });
          }
        }
        resetForm();
      }

      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Error al guardar consumo:', errorMessage);
      
      if (error.isAuthError) {
        router.push('/login');
      }
      
      const isDuplicate = errorMessage.includes('Ya existe un consumo');
      $q.notify({
        type: 'negative',
        message: isDuplicate
          ? 'El consumo para esta instalación y mes ya existe.'
          : errorMessage
      });
      return false;
    }
  };

  return {
    formData,
    updateConsumo,
    saveConsumption,
    resetForm,
    isValid
  };
}
