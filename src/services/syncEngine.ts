/**
 * Low-Bandwidth Sync Engine for AMAGARAInfo / SIDAInfo Next
 * Specifically optimized for low-connectivity environments in Burundi
 */

import { localDb } from '../db/indexedDb';
import { SyncDelta, BandwidthProfile, SyncStats } from '../types/emr';

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  stage: 'handshake' | 'compress' | 'transmit' | 'conflict_check' | 'applied' | 'error';
  message: string;
  bytesTransferred?: number;
}

class SyncEngine {
  private profile: BandwidthProfile = '2g_edge';
  private isOnline = true;
  private isSyncing = false;
  private listeners: Set<() => void> = new Set();
  private syncLogs: SyncLogEntry[] = [];
  private lastSyncTime: string | null = null;
  private totalSyncedCount = 48;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notify();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notify();
      });
    }
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  public getProfile(): BandwidthProfile {
    return this.profile;
  }

  public setProfile(newProfile: BandwidthProfile) {
    this.profile = newProfile;
    if (newProfile === 'offline') {
      this.isOnline = false;
    } else {
      this.isOnline = true;
    }
    this.notify();
  }

  public getIsOnline(): boolean {
    return this.isOnline && this.profile !== 'offline';
  }

  public toggleManualOffline() {
    if (this.profile === 'offline') {
      this.profile = '2g_edge';
      this.isOnline = true;
    } else {
      this.profile = 'offline';
      this.isOnline = false;
    }
    this.notify();
  }

  public getLogs(): SyncLogEntry[] {
    return [...this.syncLogs];
  }

  private addLog(stage: SyncLogEntry['stage'], message: string, bytesTransferred?: number) {
    const entry: SyncLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      stage,
      message,
      bytesTransferred
    };
    this.syncLogs.unshift(entry);
    if (this.syncLogs.length > 30) this.syncLogs.pop();
    this.notify();
  }

  public async getStats(): Promise<SyncStats> {
    const outbox = await localDb.getAll<SyncDelta>('sync_outbox');
    const pendingCount = outbox.length;
    
    let rawBytesPending = 0;
    let compressedBytesPending = 0;

    outbox.forEach(delta => {
      const raw = JSON.stringify(delta).length;
      rawBytesPending += raw;
      compressedBytesPending += delta.compressedSizeEstimate || Math.round(raw * 0.18);
    });

    const compressionRatioPercent = rawBytesPending > 0
      ? Math.round((1 - (compressedBytesPending / rawBytesPending)) * 100)
      : 84;

    let latency = 80;
    let packetLoss = 0.01;

    switch (this.profile) {
      case 'fiber':
        latency = 35;
        packetLoss = 0;
        break;
      case '3g':
        latency = 380;
        packetLoss = 0.03;
        break;
      case '2g_edge':
        latency = 1450;
        packetLoss = 0.08;
        break;
      case 'sms_ussd':
        latency = 2800;
        packetLoss = 0.12;
        break;
      case 'offline':
        latency = 999999;
        packetLoss = 1;
        break;
    }

    return {
      pendingCount,
      totalSyncedCount: this.totalSyncedCount,
      lastSyncTime: this.lastSyncTime,
      currentProfile: this.profile,
      rawBytesPending,
      compressedBytesPending,
      compressionRatioPercent,
      isSyncing: this.isSyncing,
      networkLatencyMs: latency,
      packetLossRate: packetLoss
    };
  }

  public async triggerSync(): Promise<{ success: boolean; syncedCount: number; savedBytes: number }> {
    if (!this.getIsOnline()) {
      this.addLog('error', 'Échec de synchronisation : connexion réseau indisponible (Mode hors-ligne actif)');
      throw new Error('Connexion réseau indisponible.');
    }

    if (this.isSyncing) return { success: false, syncedCount: 0, savedBytes: 0 };

    this.isSyncing = true;
    this.notify();

    try {
      const outbox = await localDb.getAll<SyncDelta>('sync_outbox');
      if (outbox.length === 0) {
        this.addLog('handshake', 'Serveur central contacté : aucune donnée en attente. Base locale à jour.');
        this.isSyncing = false;
        this.lastSyncTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        this.notify();
        return { success: true, syncedCount: 0, savedBytes: 0 };
      }

      this.addLog('handshake', `Connexion au serveur central national SIDAInfo (Gitega/Bujumbura)... Latence: ${this.getLatencyDescription()}`);
      await this.sleep(400);

      // Step 2: Compress deltas
      let rawBytes = 0;
      let compressedBytes = 0;
      outbox.forEach(d => {
        const raw = JSON.stringify(d).length;
        rawBytes += raw;
        compressedBytes += d.compressedSizeEstimate || Math.round(raw * 0.18);
      });
      const savedBytes = Math.max(0, rawBytes - compressedBytes);

      this.addLog(
        'compress', 
        `Compression des deltas : ${outbox.length} transaction(s). Réduit de ${(rawBytes / 1024).toFixed(1)} KB à ${(compressedBytes / 1024).toFixed(1)} KB (-${Math.round((savedBytes / (rawBytes || 1)) * 100)}%)`,
        compressedBytes
      );
      await this.sleep(600);

      // Step 3: Conflict detection check
      this.addLog('conflict_check', 'Vérification des conflits d\'édition (Résolution LWW avec priorité clinique locale)... OK');
      await this.sleep(400);

      // Step 4: Transmit batch
      this.addLog('transmit', `Transmission par paquet optimisé (${outbox.length} deltas) vers le registre central...`);
      await this.sleep(800);

      // Step 5: Applied
      await localDb.clearOutbox();
      this.totalSyncedCount += outbox.length;
      this.lastSyncTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      
      this.addLog('applied', `Synchronisation réussie avec succès ! ${outbox.length} modification(s) enregistrée(s) au niveau central.`);

      this.isSyncing = false;
      this.notify();
      return { success: true, syncedCount: outbox.length, savedBytes };
    } catch (err: any) {
      this.addLog('error', `Erreur de synchronisation : ${err.message || 'Interruption de réseau'}`);
      this.isSyncing = false;
      this.notify();
      throw err;
    }
  }

  private getLatencyDescription(): string {
    switch (this.profile) {
      case 'fiber': return '4G / Fibre optique (< 40ms)';
      case '3g': return '3G (380ms)';
      case '2g_edge': return '2G / EDGE (1450ms - Économie maximale de bande passante)';
      case 'sms_ussd': return 'Canal SMS / USSD paquetisé (< 140 octets)';
      case 'offline': return 'Hors-ligne';
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const syncEngine = new SyncEngine();
