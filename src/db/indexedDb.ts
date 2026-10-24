/**
 * IndexedDB Offline-First Storage Engine for AMAGARAInfo
 * Supports offline storage, reactive state updates, and delta queuing.
 */

import { 
  Patient, 
  QueueContact, 
  LabTestOrder, 
  DispensationRecord, 
  VaccineDoseRecord, 
  AppointmentRecord, 
  StockItem, 
  SyncDelta,
  ConsultationDraft
} from '../types/emr';
import { 
  SEED_PATIENTS, 
  SEED_QUEUE, 
  SEED_LAB_TESTS, 
  SEED_STOCKS, 
  SEED_APPOINTMENTS, 
  SEED_VACCINES_PATIENT_A 
} from './seedData';

const DB_NAME = 'amagara_emr_burundi_db';
const DB_VERSION = 1;

class LocalDatabase {
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  private listeners: Set<() => void> = new Set();

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  async init(): Promise<void> {
    if (this.isInitialized && this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('patients')) {
          const store = db.createObjectStore('patients', { keyPath: 'id' });
          store.createIndex('codeSite', 'codeSite', { unique: true });
          store.createIndex('uidNational', 'uidNational', { unique: false });
        }
        if (!db.objectStoreNames.contains('queue')) {
          db.createObjectStore('queue', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('lab_orders')) {
          db.createObjectStore('lab_orders', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('dispensations')) {
          db.createObjectStore('dispensations', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('vaccines')) {
          db.createObjectStore('vaccines', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('appointments')) {
          db.createObjectStore('appointments', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('stocks')) {
          db.createObjectStore('stocks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sync_outbox')) {
          db.createObjectStore('sync_outbox', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('consultation_drafts')) {
          db.createObjectStore('consultation_drafts', { keyPath: 'patientId' });
        }
      };

      request.onsuccess = async (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.isInitialized = true;
        await this.seedInitialDataIfEmpty();
        resolve();
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event);
        reject(event);
      };
    });
  }

  private async seedInitialDataIfEmpty(): Promise<void> {
    const patients = await this.getAll<Patient>('patients');
    if (patients.length === 0) {
      for (const p of SEED_PATIENTS) await this.put('patients', p, false);
      for (const q of SEED_QUEUE) await this.put('queue', q, false);
      for (const l of SEED_LAB_TESTS) await this.put('lab_orders', l, false);
      for (const s of SEED_STOCKS) await this.put('stocks', s, false);
      for (const a of SEED_APPOINTMENTS) await this.put('appointments', a, false);
      for (const v of SEED_VACCINES_PATIENT_A) await this.put('vaccines', v, false);
      
      // Also record initial dispensations
      const demoDispensation: DispensationRecord = {
        id: 'disp-1048-init',
        patientId: 'pat-1048',
        codeSite: 'PT-1048',
        nomPatient: 'Aline NININAHAZWE',
        medicament: 'TDF / 3TC / DTG — 30 comprimés',
        lotNumero: 'LOT-ARV-011',
        quantiteDelivree: 30,
        dureeJours: 30,
        dateDelivrance: '2026-10-20',
        rendezVousRenouvellement: '2026-11-18',
        observation: 'Bonne tolérance rapportée, pas d effets secondaires',
        dispensePar: 'CD - Clinicien démo'
      };
      await this.put('dispensations', demoDispensation, false);
    }
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) throw new Error('Database not initialized');
    const tx = this.db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readonly');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: string, key: string): Promise<T | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readonly');
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async put<T extends { id?: string; patientId?: string }>(
    storeName: string, 
    value: T, 
    trackSyncDelta = true,
    entityType?: SyncDelta['entityType'],
    op: SyncDelta['operation'] = 'UPDATE'
  ): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(
        trackSyncDelta ? [storeName, 'sync_outbox'] : [storeName], 
        'readwrite'
      );
      const store = tx.objectStore(storeName);
      store.put(value);

      if (trackSyncDelta && entityType) {
        const rawString = JSON.stringify(value);
        // Estimate compressed size in low-bandwidth binary delta (approx ~15-20% of json)
        const compressedSizeEstimate = Math.max(18, Math.round(rawString.length * 0.18));
        
        const delta: SyncDelta = {
          id: 'delta-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          timestamp: Date.now(),
          isoDate: new Date().toISOString(),
          operation: op,
          entityType,
          entityId: (value.id || (value as any).patientId || 'unknown'),
          payload: value as unknown as Record<string, unknown>,
          author: 'CD - Clinicien démo',
          facilityId: 'CDS-GITEGA-01',
          synced: false,
          compressedSizeEstimate
        };
        const outboxStore = tx.objectStore('sync_outbox');
        outboxStore.put(delta);
      }

      tx.oncomplete = () => {
        this.notify();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  async delete(storeName: string, key: string, trackSyncDelta = true, entityType?: SyncDelta['entityType']): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(
        trackSyncDelta ? [storeName, 'sync_outbox'] : [storeName], 
        'readwrite'
      );
      const store = tx.objectStore(storeName);
      store.delete(key);

      if (trackSyncDelta && entityType) {
        const delta: SyncDelta = {
          id: 'delta-del-' + Date.now(),
          timestamp: Date.now(),
          isoDate: new Date().toISOString(),
          operation: 'DELETE',
          entityType,
          entityId: key,
          payload: { id: key },
          author: 'CD - Clinicien démo',
          facilityId: 'CDS-GITEGA-01',
          synced: false,
          compressedSizeEstimate: 24
        };
        tx.objectStore('sync_outbox').put(delta);
      }

      tx.oncomplete = () => {
        this.notify();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  async clearOutbox(): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('sync_outbox', 'readwrite');
      tx.objectStore('sync_outbox').clear();
      tx.oncomplete = () => {
        this.notify();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  async exportFullBundle(): Promise<string> {
    await this.init();
    const bundle = {
      exportTimestamp: new Date().toISOString(),
      facility: 'Centre de santé - Démo (Gitega, Burundi)',
      codeStructure: 'BDI-GTE-CDS-001',
      version: 'SIDAInfo Next v1.9.29',
      data: {
        patients: await this.getAll('patients'),
        queue: await this.getAll('queue'),
        labOrders: await this.getAll('lab_orders'),
        dispensations: await this.getAll('dispensations'),
        vaccines: await this.getAll('vaccines'),
        appointments: await this.getAll('appointments'),
        stocks: await this.getAll('stocks'),
        syncOutbox: await this.getAll('sync_outbox')
      }
    };
    return JSON.stringify(bundle, null, 2);
  }

  async importFullBundle(jsonString: string): Promise<{ success: boolean; importedCounts: Record<string, number> }> {
    await this.init();
    try {
      const bundle = JSON.parse(jsonString);
      if (!bundle.data) throw new Error('Format de paquet de synchronisation invalide.');
      
      const counts: Record<string, number> = {};
      const { patients, queue, labOrders, dispensations, vaccines, appointments, stocks } = bundle.data;

      if (Array.isArray(patients)) {
        for (const p of patients) await this.put('patients', p, false);
        counts.patients = patients.length;
      }
      if (Array.isArray(queue)) {
        for (const q of queue) await this.put('queue', q, false);
        counts.queue = queue.length;
      }
      if (Array.isArray(labOrders)) {
        for (const l of labOrders) await this.put('lab_orders', l, false);
        counts.labOrders = labOrders.length;
      }
      if (Array.isArray(dispensations)) {
        for (const d of dispensations) await this.put('dispensations', d, false);
        counts.dispensations = dispensations.length;
      }
      if (Array.isArray(vaccines)) {
        for (const v of vaccines) await this.put('vaccines', v, false);
        counts.vaccines = vaccines.length;
      }
      if (Array.isArray(appointments)) {
        for (const a of appointments) await this.put('appointments', a, false);
        counts.appointments = appointments.length;
      }
      if (Array.isArray(stocks)) {
        for (const s of stocks) await this.put('stocks', s, false);
        counts.stocks = stocks.length;
      }

      this.notify();
      return { success: true, importedCounts: counts };
    } catch (e: any) {
      console.error('Import error:', e);
      throw e;
    }
  }
}

export const localDb = new LocalDatabase();
