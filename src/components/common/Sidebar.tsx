import React from 'react';
import { 
  LayoutGrid, 
  Clock, 
  Users, 
  Activity, 
  FileText, 
  FlaskConical, 
  Pill, 
  Calendar, 
  Package, 
  BarChart3, 
  RefreshCw, 
  ShieldCheck, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export type ViewTab = 
  | 'dashboard'
  | 'queue'
  | 'patients'
  | 'admission'
  | 'patient-record'
  | 'consultation'
  | 'pathway'
  | 'hiv-tracking'
  | 'vaccination'
  | 'mch'
  | 'lab'
  | 'pharmacy'
  | 'appointments'
  | 'stocks'
  | 'reports'
  | 'sync';

interface SidebarProps {
  currentView: ViewTab;
  onNavigate: (view: ViewTab) => void;
  queueCount: number;
  pendingSyncCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  queueCount,
  pendingSyncCount
}) => {
  const priseEnChargeItems: Array<{ id: ViewTab; label: string; icon: React.FC<any>; badge?: number }> = [
    { id: 'dashboard', label: 'Tableau du jour', icon: LayoutGrid },
    { id: 'queue', label: "File d'attente", icon: Clock, badge: queueCount },
    { id: 'patients', label: 'Patients / dossiers', icon: Users },
    { id: 'pathway', label: 'Parcours de soins', icon: Activity },
    { id: 'consultation', label: 'Consultations', icon: FileText },
    { id: 'lab', label: 'Laboratoire', icon: FlaskConical },
    { id: 'pharmacy', label: 'Pharmacie', icon: Pill },
    { id: 'appointments', label: 'Rendez-vous', icon: Calendar },
  ];

  const gestionItems: Array<{ id: ViewTab; label: string; icon: React.FC<any>; badge?: number }> = [
    { id: 'stocks', label: 'Stocks & lots', icon: Package },
    { id: 'reports', label: 'Rapports & qualité', icon: BarChart3 },
    { id: 'sync', label: 'Synchronisation bas débit', icon: RefreshCw, badge: pendingSyncCount },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col shrink-0 select-none hidden lg:flex">
      
      {/* Site Header Context */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Site Actif
        </div>
        <div className="font-bold text-slate-900 text-sm leading-tight">
          Centre de santé – Démo
        </div>
        <div className="text-xs text-slate-500 mt-0.5">
          Province de Gitega · Burundi
        </div>
      </div>

      {/* Nav groups */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        
        {/* Prise en charge */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Prise en charge
          </div>
          <nav className="space-y-1">
            {priseEnChargeItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id || 
                (item.id === 'patients' && currentView === 'patient-record') ||
                (item.id === 'patients' && currentView === 'admission') ||
                (item.id === 'pathway' && (currentView === 'hiv-tracking' || currentView === 'vaccination' || currentView === 'mch'));
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-cyan-50 text-cyan-800 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-700' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Gestion & Suivi */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Gestion & Suivi
          </div>
          <nav className="space-y-1">
            {gestionItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-cyan-50 text-cyan-800 font-bold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-700' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

      </div>

      {/* User profile footer matching atlas */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition">
          <div className="w-8 h-8 rounded-lg bg-cyan-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
            CD
          </div>
          <div className="min-w-0 flex-1 text-left">
            <div className="text-xs font-bold text-slate-900 truncate">
              Clinicien démo
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              Profil polyvalent · site actif
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
};
