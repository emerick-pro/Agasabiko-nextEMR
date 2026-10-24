import React, { useState, useEffect, useRef } from 'react';
import { Patient } from '../../types/emr';
import { localDb } from '../../db/indexedDb';
import { syncEngine } from '../../services/syncEngine';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  Search, 
  Wifi, 
  WifiOff, 
  Bell, 
  Layers, 
  User, 
  ShieldCheck, 
  ArrowRight,
  ChevronDown,
  Building2,
  CalendarDays
} from 'lucide-react';

interface NavbarProps {
  onSelectPatient: (patientId: string) => void;
  onOpenSyncModal: () => void;
  activeFacility: string;
  onChangeFacility: (facility: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectPatient,
  onOpenSyncModal,
  activeFacility,
  onChangeFacility
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredResults, setFilteredResults] = useState<Patient[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [currentProfile, setCurrentProfile] = useState(syncEngine.getProfile());
  const searchRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    const list = await localDb.getAll<Patient>('patients');
    setPatients(list);
    const stats = await syncEngine.getStats();
    setPendingCount(stats.pendingCount);
    setIsOnline(syncEngine.getIsOnline());
    setCurrentProfile(syncEngine.getProfile());
  };

  useEffect(() => {
    loadData();
    const unsub1 = localDb.subscribe(loadData);
    const unsub2 = syncEngine.subscribe(loadData);
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredResults([]);
      setIsSearchOpen(false);
      return;
    }
    const q = searchQuery.toLowerCase();
    const res = patients.filter(p => 
      p.nom.toLowerCase().includes(q) ||
      p.prenom.toLowerCase().includes(q) ||
      p.codeSite.toLowerCase().includes(q) ||
      p.uidNational.toLowerCase().includes(q) ||
      p.adresse.colline.toLowerCase().includes(q)
    );
    setFilteredResults(res);
    setIsSearchOpen(true);
  }, [searchQuery, patients]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getProfileLabel = () => {
    if (!isOnline) return 'Hors ligne';
    switch (currentProfile) {
      case '2g_edge': return 'Connecté (2G/EDGE)';
      case '3g': return 'Connecté (3G)';
      case 'sms_ussd': return 'Connecté (SMS)';
      case 'fiber': return 'Connecté (4G/Fibre)';
      default: return 'Connecté';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 gap-3">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-teal-700 flex items-center justify-center text-white shadow-xs font-bold text-lg">
              +
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  AMAGARA<span className="text-cyan-700">Info</span>
                </span>
                <span className="hidden md:inline-block text-[10px] font-bold px-1.5 py-0.2 bg-cyan-50 text-cyan-800 rounded border border-cyan-200 uppercase tracking-wider">
                  SIDAInfo Next
                </span>
              </div>
              <div className="text-[11px] text-slate-500 hidden sm:block leading-none">
                Conception patient-centrée · Hors-ligne d'abord
              </div>
            </div>
          </div>

          {/* Facility indicator */}
          <div className="hidden xl:flex items-center gap-1.5 ml-3 pl-3 border-l border-slate-200 text-xs text-slate-600">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={activeFacility}
              onChange={(e) => onChangeFacility(e.target.value)}
              className="bg-transparent font-medium text-slate-700 hover:text-slate-900 focus:outline-hidden cursor-pointer"
            >
              <option value="Centre de santé - Démo (Gitega)">CDS Démo · Province de Gitega</option>
              <option value="CDS Nyabihanga">CDS Nyabihanga · Gitega</option>
              <option value="CDS Giheta">CDS Giheta · Gitega</option>
              <option value="Hôpital Régional de Gitega">Hôpital Régional de Gitega</option>
            </select>
          </div>
        </div>

        {/* Center: Global Patient Omni-Search */}
        <div ref={searchRef} className="relative flex-1 max-w-md mx-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Patient, code ou UID (ex: PT-1048, Aline)..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-100 hover:bg-slate-150 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-transparent focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-hidden transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 max-h-80 overflow-y-auto">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {filteredResults.length} résultat(s) trouvé(s)
              </div>
              {filteredResults.length === 0 ? (
                <div className="px-3 py-4 text-xs text-slate-500 text-center">
                  Aucun patient correspondant dans la base locale.
                </div>
              ) : (
                filteredResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPatient(p.id);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-cyan-50/70 flex items-center justify-between text-xs transition cursor-pointer border-b border-slate-100 last:border-b-0"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{p.nom} {p.prenom}</span>
                        <span className="font-mono text-[10px] text-cyan-700 bg-cyan-100/60 px-1.5 py-0.2 rounded font-semibold">
                          {p.codeSite}
                        </span>
                        {p.isProvisionalUid && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-medium">
                            UID Provisoire
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {p.sexe} · {p.age} {p.ageUnit || 'ans'} · {p.adresse.commune}/{p.adresse.colline}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-cyan-700 font-semibold text-[11px]">
                      <span>Ouvrir</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Reactive Date */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
            <span>Jeudi 22 octobre 2026</span>
          </div>

          {/* Network Sync Status Pill */}
          <button
            onClick={onOpenSyncModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
            }`}
            title="Gérer la synchronisation et le profil de réseau bas débit"
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="hidden sm:inline">{getProfileLabel()}</span>
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Quick Offline toggle for easy clinician/reviewer demo */}
          <button
            onClick={() => syncEngine.toggleManualOffline()}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 border border-slate-200 transition cursor-pointer text-xs flex items-center gap-1"
            title={isOnline ? 'Simuler une coupure de connexion (Hors-ligne)' : 'Restaurer la connexion'}
          >
            {isOnline ? <WifiOff className="w-3.5 h-3.5 text-amber-600" /> : <Wifi className="w-3.5 h-3.5 text-emerald-600" />}
            <span className="hidden xl:inline text-[11px] font-medium">
              {isOnline ? 'Couper réseau' : 'Rétablir réseau'}
            </span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* User profile avatar */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-cyan-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-cyan-100">
              CD
            </div>
            <div className="hidden 2xl:block text-left text-xs leading-tight">
              <div className="font-bold text-slate-800">Clinicien démo</div>
              <div className="text-[10px] text-slate-400">Profil polyvalent · site actif</div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
