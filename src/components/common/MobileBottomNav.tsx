import React from 'react';
import { ViewTab } from './Sidebar';
import { LayoutGrid, Clock, Users, Activity, Calendar, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  currentView: ViewTab;
  onNavigate: (view: ViewTab) => void;
  queueCount: number;
  onOpenMoreMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  queueCount,
  onOpenMoreMenu
}) => {
  const tabs = [
    { id: 'dashboard' as ViewTab, label: 'Accueil', icon: LayoutGrid },
    { id: 'queue' as ViewTab, label: 'File', icon: Clock, badge: queueCount },
    { id: 'patients' as ViewTab, label: 'Patients', icon: Users },
    { id: 'pathway' as ViewTab, label: 'Soins', icon: Activity },
    { id: 'appointments' as ViewTab, label: 'RDV', icon: Calendar },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg flex items-center justify-around safe-bottom">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id || 
          (tab.id === 'patients' && (currentView === 'patient-record' || currentView === 'admission')) ||
          (tab.id === 'pathway' && (currentView === 'consultation' || currentView === 'hiv-tracking' || currentView === 'vaccination' || currentView === 'mch' || currentView === 'lab' || currentView === 'pharmacy'));

        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition cursor-pointer relative ${
              isActive ? 'text-cyan-700 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-bold px-1 rounded-full">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
          </button>
        );
      })}

      {/* More / Menu */}
      <button
        onClick={onOpenMoreMenu}
        className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-slate-400 hover:text-slate-700 transition cursor-pointer"
        title="Menu complet"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 tracking-tight">Plus</span>
      </button>
    </nav>
  );
};
