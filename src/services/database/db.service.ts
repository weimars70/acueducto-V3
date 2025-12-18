import Dexie from 'dexie';
import type { Installation } from '../../types/installation';
import type { Consumption } from '../../types/consumption';

interface OfflineConsumption extends Consumption {
  id?: number;
  syncStatus: string;
  imagenBase64?: string | null; // Nueva propiedad
}

export class AppDatabase extends Dexie {
  installations!: Dexie.Table<Installation, number>;
  consumptions!: Dexie.Table<Consumption, number>;
  offlineConsumptions!: Dexie.Table<OfflineConsumption, number>;

  constructor() {
    super('acueductosDB');

    // Versión 1 (existente)
    this.version(1).stores({
      installations: '++id, codigo, codigo_medidor, nombre',
      consumptions: '++id, codigo, instalacion, fecha',
      offlineConsumptions: '++id, instalacion, fecha, syncStatus'
    });

    // Versión 2 (nueva) - Agregar campo imagenBase64
    this.version(2).stores({
      installations: '++id, codigo, codigo_medidor, nombre',
      consumptions: '++id, codigo, instalacion, fecha',
      offlineConsumptions: '++id, instalacion, fecha, syncStatus, imagenBase64'
    }).upgrade(tx => {
      // Migración: agregar campo null a registros existentes
      return tx.table('offlineConsumptions').toCollection().modify(item => {
        if (!item.hasOwnProperty('imagenBase64')) {
          item.imagenBase64 = null;
        }
      });
    });
  }
}

export const db = new AppDatabase();