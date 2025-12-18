import { apiClient } from './client';

export class ImageUploadService {
  /**
   * Convierte base64 a Blob
   */
  private base64ToBlob(base64: string, contentType: string = 'image/jpeg'): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  /**
   * Sube imagen de consumo al backend
   */
  async uploadConsumptionImage(
    consumptionId: number,
    base64Image: string
  ): Promise<string> {
    try {
      // Convertir base64 a blob
      const blob = this.base64ToBlob(base64Image);

      // Crear FormData
      const formData = new FormData();
      formData.append('image', blob, 'meter-reading.jpg');

      // Enviar al backend
      const response = await apiClient.post(
        `/consumo/${consumptionId}/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data.imagenUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Error al subir la imagen');
    }
  }
}

export const imageUploadService = new ImageUploadService();
