import React, { useState, useEffect } from 'react';
import { syncEngine, SyncLogEntry } from '../../services/syncEngine';
import { localDb } from '../../db/indexedDb';
import { SyncStats, BandwidthProfile, SyncDelta } from '../../types/emr';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Download, 
  Upload, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  X, 
  Layers,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';

interface SyncDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncDrawer: React.FC<SyncDrawerProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [logs, setLogs] = useState<SyncLogEntry[]>([]);
  const [outboxItems, setOutboxItems] = useState<SyncDelta[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'outbox' | 'sneakernet' | 'logs'>('status');

  const loadData = async () => {
    const s = await syncEngine.getStats();
    setStats(s);
    setLogs(syncEngine.getLogs());
    const items = await localDb.getAll<SyncDelta>('sync_outbox');
    setOutboxItems(items);
  };

  useEffect(() => {
    loadData();
    const unsub1 = syncEngine.subscribe(loadData);
    const unsub2 = localDb.subscribe(loadData);
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  if (!isOpen) return null;

  const isOnline = syncEngine.getIsOnline();

  const handleProfileChange = (p: BandwidthProfile) => {
    syncEngine.setProfile(p);
  };

  const handleTriggerSync = async () => {
    try {
      await syncEngine.triggerSync();
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportUsb = async () => {
    setIsExporting(true);
    try {
      const bundleStr = await localDb.exportFullBundle();
      const blob = new Blob([bundleStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AMAGARA_SYNC_GITEGA_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const res = await localDb.importFullBundle(content);
        setImportStatus(`Import réussi : ${Object.values(res.importedCounts).reduce((a, b) => a + b, 0)} enregistrements intégrés.`);
        setTimeout(() => setImportStatus(null), 5000);
      } catch (err: any) {
        setImportStatus(`Erreur d'import : ${err.message || 'Fichier invalide'}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
              {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Centre de synchronisation bas débit</h2>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {isOnline ? 'Prêt pour échange' : 'Hors-ligne (Local)'}
                </span>
              </div>
              <p className="text-xs text-slate-500">Moteur d'optimisation réseau adapté au contexte rural du Burundi</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 px-6 gap-6 text-xs font-semibold text-slate-500">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 border-b-2 transition cursor-pointer ${activeTab === 'status' ? 'border-cyan-600 text-cyan-700' : 'border-transparent hover:text-slate-700'}`}
          >
            Statut réseau & profil
          </button>
          <button
            onClick={() => setActiveTab('outbox')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${activeTab === 'outbox' ? 'border-cyan-600 text-cyan-700' : 'border-transparent hover:text-slate-700'}`}
          >
            <span>File d'envoi locale</span>
            {outboxItems.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px]">
                {outboxItems.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sneakernet')}
            className={`py-3 border-b-2 transition cursor-pointer ${activeTab === 'sneakernet' ? 'border-cyan-600 text-cyan-700' : 'border-transparent hover:text-slate-700'}`}
          >
            Fiche navette / USB
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 border-b-2 transition cursor-pointer ${activeTab === 'logs' ? 'border-cyan-600 text-cyan-700' : 'border-transparent hover:text-slate-700'}`}
          >
            Journal des échanges
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-700">
          
          {activeTab === 'status' && (
            <div className="space-y-5">
              {/* Profile selector cards */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                  Sélection du profil de bande passante
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: '2g_edge', label: '2G / EDGE (Recommandé)', speed: '32-64 kbps · Burundi rural', desc: 'Compression extrême des deltas, requêtes regroupées' },
                    { id: '3g', label: '3G / Réseau mobile standard', speed: '100-300 kbps', desc: 'Compression active avec latence moyenne' },
                    { id: 'sms_ussd', label: 'Paquet ultra-réduit SMS/USSD', speed: '< 140 octets / chunk', desc: 'Format binaire sans en-tête pour zones isolées' },
                    { id: 'fiber', label: 'Haut débit (Fibre / 4G)', speed: 'Centre urbain Bujumbura', desc: 'Synchronisation instantanée' },
                    { id: 'offline', label: '100% Hors-ligne forcé', speed: 'Aucune émission', desc: 'Travail nomade sans signal' },
                  ].map((p) => {
                    const isSelected = stats?.currentProfile === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleProfileChange(p.id as BandwidthProfile)}
                        className={`text-left p-3 rounded-xl border text-xs transition cursor-pointer flex flex-col justify-between ${
                          isSelected 
                            ? 'border-cyan-600 bg-cyan-50/70 text-cyan-900 shadow-xs ring-1 ring-cyan-500' 
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-bold flex items-center gap-1.5">
                            <Radio className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-600' : 'text-slate-400'}`} />
                            {p.label}
                          </span>
                          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-white/80 border border-slate-200">
                            {p.speed}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 leading-tight">
                          {p.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Compression & bandwidth metrics */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-600" />
                    <span className="text-xs font-bold text-slate-900">Économie de données par delta binaire</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ~{stats?.compressionRatioPercent || 85}% d'économie
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-medium">Modifications locales</div>
                    <div className="text-base font-bold text-slate-800">{stats?.pendingCount || 0}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-medium">Taille JSON brut</div>
                    <div className="text-base font-bold text-slate-800">
                      {((stats?.rawBytesPending || 0) / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-medium">Taille compressée</div>
                    <div className="text-base font-bold text-cyan-700">
                      {((stats?.compressedBytesPending || 0) / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                  <span>Résolution des conflits : Priorité clinique locale garantie (Last-Write-Wins avec traçabilité)</span>
                </div>
              </div>

              {/* Action trigger button */}
              <div className="pt-1">
                <button
                  disabled={!isOnline || stats?.isSyncing}
                  onClick={handleTriggerSync}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs cursor-pointer ${
                    !isOnline 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : stats?.isSyncing
                        ? 'bg-cyan-600 text-white cursor-wait opacity-90'
                        : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/20 hover:shadow-md'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${stats?.isSyncing ? 'animate-spin' : ''}`} />
                  <span>
                    {stats?.isSyncing 
                      ? 'Transmission des deltas en cours...' 
                      : isOnline 
                        ? 'Synchroniser maintenant avec le niveau central'
                        : 'Synchronisation impossible en mode hors-ligne'}
                  </span>
                </button>
                <div className="text-center mt-2 text-[11px] text-slate-400">
                  Dernier échange réussi : {stats?.lastSyncTime || 'Aujourd\'hui 08:00'} · {stats?.totalSyncedCount || 48} dossiers centralisés
                </div>
              </div>
            </div>
          )}

          {activeTab === 'outbox' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Transactions enregistrées en local en attente d'émission vers le registre central SIDAInfo :
                </p>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {outboxItems.length} en attente
                </span>
              </div>

              {outboxItems.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">Toutes les données locales sont à jour !</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Aucun delta en attente dans la file d'envoi.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {outboxItems.map((item) => (
                    <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-lg text-xs hover:border-slate-300">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          {item.entityType.toUpperCase()} : {item.entityId}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(item.timestamp).toLocaleTimeString('fr-FR')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Action : <strong className="text-slate-700">{item.operation}</strong></span>
                        <span className="font-mono text-[10px] text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded">
                          ~{item.compressedSizeEstimate} octets
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sneakernet' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Mode Fiche Navette / Clé USB (Sans aucun réseau)</strong>
                  <p className="text-[11px] text-amber-800/90 mt-0.5">
                    Dans les postes de santé ruraux où le réseau mobile GSM est inexistant, exportez le fichier de données chiffré sur une clé USB ou carte SD pour transport physique mensuel vers l'Hôpital de District ou le Bureau de Province Sanitaire.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Download className="w-4 h-4 text-cyan-600" />
                      <h4 className="text-xs font-bold text-slate-900">Exporter paquet clinique</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">
                      Génère un lot complet contenant les patients, files d'attente, consultations et stocks pour la supervision.
                    </p>
                  </div>
                  <button
                    onClick={handleExportUsb}
                    disabled={isExporting}
                    className="w-full py-2 px-3 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isExporting ? 'Génération...' : 'Télécharger le paquet (.json)'}</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-bold text-slate-900">Importer mises à jour</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">
                      Intègre les résultats de laboratoire centraux (ex: Charge virale IBIPIMO) rapportés depuis le district.
                    </p>
                  </div>
                  <label className="w-full py-2 px-3 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sélectionner le fichier</span>
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={handleImportFile}
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {importStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
                  {importStatus}
                </div>
              )}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Historique récent des communications réseau :</span>
              </div>
              <div className="bg-slate-900 text-slate-200 font-mono text-[11px] p-3.5 rounded-xl max-h-72 overflow-y-auto space-y-1.5">
                {logs.length === 0 ? (
                  <div className="text-slate-500 italic">Aucun événement de synchronisation récent.</div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2">
                      <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                      <span className={`shrink-0 uppercase font-bold text-[10px] px-1 rounded ${
                        log.stage === 'applied' ? 'bg-emerald-900 text-emerald-300' :
                        log.stage === 'error' ? 'bg-rose-900 text-rose-300' :
                        log.stage === 'compress' ? 'bg-cyan-900 text-cyan-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {log.stage}
                      </span>
                      <span className="text-slate-300 break-all">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-600" />
            <span>Site actif : <strong>CDS Gitega (BDI-GTE-01)</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
