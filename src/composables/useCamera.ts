import { ref } from 'vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useQuasar } from 'quasar';

export function useCamera() {
  const $q = useQuasar();
  const capturedImage = ref<string | null>(null);
  const isCapturing = ref(false);

  const takePhoto = async (): Promise<string | null> => {
    isCapturing.value = true;

    try {
      const image = await Camera.getPhoto({
        quality: 60, // Compresión alta para ~200KB
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        saveToGallery: false,
        correctOrientation: true,
        width: 1024,
        height: 1024
      });

      if (!image.base64String) {
        throw new Error('No se capturó la imagen correctamente');
      }

      // Validar tamaño (máximo 5MB en base64)
      const sizeInBytes = (image.base64String.length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);

      if (sizeInMB > 5) {
        $q.notify({
          type: 'warning',
          message: `Imagen muy grande (${sizeInMB.toFixed(2)}MB). Intenta con otra.`
        });
        return null;
      }

      capturedImage.value = image.base64String;

      $q.notify({
        type: 'positive',
        message: 'Foto capturada exitosamente',
        icon: 'camera_alt'
      });

      return image.base64String;
    } catch (error: any) {
      console.error('Error al capturar foto:', error);

      if (error.message !== 'User cancelled photos app') {
        $q.notify({
          type: 'negative',
          message: 'Error al capturar la foto'
        });
      }

      return null;
    } finally {
      isCapturing.value = false;
    }
  };

  const clearPhoto = () => {
    capturedImage.value = null;
  };

  const getDataUrl = (base64: string): string => {
    return `data:image/jpeg;base64,${base64}`;
  };

  return {
    capturedImage,
    isCapturing,
    takePhoto,
    clearPhoto,
    getDataUrl
  };
}
