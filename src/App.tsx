import React, { useState, useEffect } from 'react';
import { Patient, QueueContact } from './types/emr';
import { localDb } from './db/indexedDb';
import { syncEngine } from './services/syncEngine';

import { Navbar } from './components/common/Navbar';
import { Sidebar, ViewTab } from './components/common/Sidebar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { SyncDrawer } from './components/common/SyncDrawer';

import { DashboardView } from './components/views/DashboardView';
import { WaitingQueueView } from './components/views/WaitingQueueView';
import { PatientRegistryView } from './components/views/PatientRegistryView';
import { AdmissionView } from './components/views/AdmissionView';
import { PatientRecordView } from './components/views/PatientRecordView';
import { ConsultationView } from './components/views/ConsultationView';
import { CarePathwayView } from './components/views/CarePathwayView';
import { HivTrackerView } from './components/views/HivTrackerView';
import { VaccinationView } from './components/views/VaccinationView';
import { MchView } from './components/views/MchView';
import { LabView } from './components/views/LabView';
import { PharmacyView } from './components/views/PharmacyView';
import { AppointmentsView } from './components/views/AppointmentsView';
import { StocksView } from './components/views/StocksView';
import { ReportsView } from './components/views/ReportsView';

import { 
  WifiOff, 
  RefreshCw, 
  X, 
  Package, 
  BarChart3, 
  Settings, 
  ChevronRight,
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewTab>('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [queue, setQueue] = useState<QueueContact[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-1048');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [activeFacility, setActiveFacility] = useState('Centre de santé - Démo (Gitega)');
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  const loadData = async () => {
    await localDb.init();
    const patList = await localDb.getAll<Patient>('patients');
    setPatients(patList);
    const queueList = await localDb.getAll<QueueContact>('queue');
    setQueue(queueList);
    const stats = await syncEngine.getStats();
    setPendingSyncCount(stats.pendingCount);
    setIsOnline(syncEngine.getIsOnline());
  };

  useEffect(() => {
    loadData();
    const unsubDb = localDb.subscribe(loadData);
    const unsubSync = syncEngine.subscribe(loadData);
    return () => {
      unsubDb();
      unsubSync();
    };
  }, []);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentView('patient-record');
  };

  const handlePatientCreated = (newPatientId: string) => {
    setSelectedPatientId(newPatientId);
    setCurrentView('patient-record');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        onSelectPatient={handleSelectPatient}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        activeFacility={activeFacility}
        onChangeFacility={setActiveFacility}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop / Tablet Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => {
            if (view === 'sync') {
              setIsSyncModalOpen(true);
            } else {
              setCurrentView(view);
            }
          }}
          queueCount={queue.length}
          pendingSyncCount={pendingSyncCount}
        />

        {/* Dynamic Content Main View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 max-w-7xl mx-auto w-full">
          
          {/* Offline Toast Banner if disconnected */}
          {!isOnline && (
            <div className="mb-5 p-3.5 bg-amber-500 text-white rounded-2xl shadow-md flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                <span className="font-semibold">
                  Mode Hors-ligne actif — Toutes vos modifications sont enregistrées en local dans le navigateur et seront synchronisées au retour du réseau.
                </span>
              </div>
              <button
                onClick={() => setIsSyncModalOpen(true)}
                className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white font-bold text-[11px] cursor-pointer whitespace-nowrap ml-2"
              >
                Gérer sync
              </button>
            </div>
          )}

          {/* Active View Router */}
          {currentView === 'dashboard' && (
            <DashboardView
              queue={queue}
              patients={patients}
              onNavigate={setCurrentView}
              onSelectPatient={handleSelectPatient}
            />
          )}

          {currentView === 'queue' && (
            <WaitingQueueView
              queue={queue}
              patients={patients}
              onSelectPatient={handleSelectPatient}
              onNavigateToAdmission={() => setCurrentView('admission')}
            />
          )}

          {currentView === 'patients' && (
            <PatientRegistryView
              patients={patients}
              onSelectPatient={handleSelectPatient}
              onNavigateToAdmission={() => setCurrentView('admission')}
            />
          )}

          {currentView === 'admission' && (
            <AdmissionView
              onBackToRegistry={() => setCurrentView('patients')}
              onPatientCreated={handlePatientCreated}
            />
          )}

          {currentView === 'patient-record' && selectedPatient && (
            <PatientRecordView
              patient={selectedPatient}
              onNavigateAction={setCurrentView}
              onBackToRegistry={() => setCurrentView('patients')}
            />
          )}

          {currentView === 'consultation' && selectedPatient && (
            <ConsultationView
              patient={selectedPatient}
              onNavigateAction={setCurrentView}
              onBackToRecord={() => setCurrentView('patient-record')}
            />
          )}

          {currentView === 'pathway' && selectedPatient && (
            <CarePathwayView
              patients={patients}
              selectedPatient={selectedPatient}
              onSelectPatient={setSelectedPatientId}
              onNavigateAction={setCurrentView}
            />
          )}

          {currentView === 'hiv-tracking' && selectedPatient && (
            <HivTrackerView
              patient={selectedPatient}
              onNavigateAction={setCurrentView}
              onBackToRecord={() => setCurrentView('patient-record')}
            />
          )}

          {currentView === 'vaccination' && selectedPatient && (
            <VaccinationView
              patient={selectedPatient}
              onNavigateAction={setCurrentView}
              onBackToRecord={() => setCurrentView('patient-record')}
            />
          )}

          {currentView === 'mch' && selectedPatient && (
            <MchView
              patient={selectedPatient}
              onNavigateAction={setCurrentView}
              onBackToRecord={() => setCurrentView('patient-record')}
            />
          )}

          {currentView === 'lab' && selectedPatient && (
            <LabView
              patient={selectedPatient}
              onNavigateAction={setCurrentView}
              onBackToRecord={() => setCurrentView('patient-record')}
            />
          )}

          {currentView === 'pharmacy' && selectedPatient && (
            <PharmacyView
              patient={selectedPatient}
              onNavigateAction={setCurrentView}
              onBackToRecord={() => setCurrentView('patient-record')}
            />
          )}

          {currentView === 'appointments' && selectedPatient && (
            <AppointmentsView
              patient={selectedPatient}
              onNavigateAction={setCurrentView}
              onBackToRecord={() => setCurrentView('patient-record')}
            />
          )}

          {currentView === 'stocks' && <StocksView />}

          {currentView === 'reports' && <ReportsView />}

        </main>
      </div>

      {/* Mobile Bottom Navigation Bar matching Screen 17 */}
      <MobileBottomNav
        currentView={currentView}
        onNavigate={setCurrentView}
        queueCount={queue.length}
        onOpenMoreMenu={() => setIsMoreMenuOpen(true)}
      />

      {/* Mobile 'Plus / More' Action Sheet Drawer */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs lg:hidden">
          <div className="bg-white rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Services et modules AMAGARAInfo</span>
              </div>
              <button 
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => { setCurrentView('stocks'); setIsMoreMenuOpen(false); }}
                className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-left font-semibold flex items-center gap-2"
              >
                <Package className="w-4 h-4 text-cyan-700" />
                <span>Stocks & lots</span>
              </button>

              <button
                onClick={() => { setCurrentView('reports'); setIsMoreMenuOpen(false); }}
                className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-left font-semibold flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4 text-cyan-700" />
                <span>Rapports & DHIS2</span>
              </button>

              <button
                onClick={() => { setIsSyncModalOpen(true); setIsMoreMenuOpen(false); }}
                className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-left font-semibold flex items-center gap-2 col-span-2"
              >
                <RefreshCw className="w-4 h-4 text-emerald-600" />
                <span>Centre de synchronisation bas débit ({pendingSyncCount} en attente)</span>
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500">
              Site actif : <strong>{activeFacility}</strong> · Burundi
            </div>
          </div>
        </div>
      )}

      {/* Low-Bandwidth Synchronization Engine Center Modal */}
      <SyncDrawer
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />

    </div>
  );
}
