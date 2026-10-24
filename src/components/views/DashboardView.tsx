import React from 'react';
import { QueueContact, Patient } from '../../types/emr';
import { ViewTab } from '../common/Sidebar';
import { 
  Users, 
  Clock, 
  FlaskConical, 
  CalendarX, 
  Search, 
  FilePlus, 
  Syringe, 
  FileCheck, 
  ArrowRight, 
  AlertCircle,
  Plus,
  HeartHandshake,
  Baby
} from 'lucide-react';

interface DashboardViewProps {
  queue: QueueContact[];
  patients: Patient[];
  onNavigate: (view: ViewTab) => void;
  onSelectPatient: (patientId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  queue,
  patients,
  onNavigate,
  onSelectPatient
}) => {
  return (
    <div className="space-y-6">
      
      {/* Top Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">
            Vue opérationnelle
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Bonjour, équipe soignante <span>👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Une vue des personnes à prendre en charge, pas seulement des indicateurs.
          </p>
        </div>

        <button
          onClick={() => onNavigate('admission')}
          className="px-4 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nouveau patient</span>
        </button>
      </div>

      {/* 4 Primary Operational Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1 */}
        <div 
          onClick={() => onNavigate('queue')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-cyan-400 hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Patients attendus aujourd'hui</span>
            <Users className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            24
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <strong className="text-emerald-700 font-semibold">8 déjà reçus</strong> · Centre de santé
          </div>
        </div>

        {/* Card 2 */}
        <div 
          onClick={() => onNavigate('queue')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-cyan-400 hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">En attente de soins</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {queue.length || 12}
          </div>
          <div className="text-[11px] text-amber-800 mt-1 font-medium">
            4 à prioriser · Voir la file
          </div>
        </div>

        {/* Card 3 */}
        <div 
          onClick={() => onNavigate('lab')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-cyan-400 hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Actes / examens à réaliser</span>
            <FlaskConical className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            7
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <strong className="text-cyan-800">3 prélèvements</strong> · 4 autres actes
          </div>
        </div>

        {/* Card 4 */}
        <div 
          onClick={() => onNavigate('appointments')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-cyan-400 hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Rendez-vous manqués</span>
            <CalendarX className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700">
            6
          </div>
          <div className="text-[11px] text-rose-700/80 mt-1 font-medium">
            2 nécessitent un appel
          </div>
        </div>

      </div>

      {/* 4 Direct Action Shortcuts matching atlas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        <button
          onClick={() => onNavigate('patients')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/40 text-left transition flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-100/70 text-cyan-800 flex items-center justify-center shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-cyan-800">Recherche patient</div>
              <div className="text-[10px] text-slate-500">Ouvrir un dossier</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-700 group-hover:translate-x-0.5 transition" />
        </button>

        <button
          onClick={() => onNavigate('consultation')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/40 text-left transition flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-100/70 text-teal-800 flex items-center justify-center shrink-0">
              <FilePlus className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-teal-800">Nouvelle consultation</div>
              <div className="text-[10px] text-slate-500">Démarrer un contact</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-700 group-hover:translate-x-0.5 transition" />
        </button>

        <button
          onClick={() => onNavigate('vaccination')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/40 text-left transition flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
              <Syringe className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">Vaccination PEV</div>
              <div className="text-[10px] text-slate-500">Calendrier et doses</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-700 group-hover:translate-x-0.5 transition" />
        </button>

        <button
          onClick={() => onNavigate('lab')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/40 text-left transition flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100/70 text-indigo-800 flex items-center justify-center shrink-0">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-800">Résultat labo</div>
              <div className="text-[10px] text-slate-500">Demandes & IBIPIMO</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-700 group-hover:translate-x-0.5 transition" />
        </button>

      </div>

      {/* Main Two-Column Split: File de soins du jour vs À traiter en priorité */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): File de soins du jour */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">File de soins du jour</h2>
              <p className="text-[11px] text-slate-400">Accès direct au dossier et au parcours clinique</p>
            </div>
            <button
              onClick={() => onNavigate('queue')}
              className="text-xs font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Voir toute la file</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {queue.slice(0, 5).map((contact) => {
              const patient = patients.find(p => p.id === contact.patientId);
              const initial = patient?.sexe === 'Féminin' ? 'F' : 'M';
              const avatarColor = patient?.sexe === 'Féminin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';

              return (
                <div 
                  key={contact.id} 
                  className="p-4 hover:bg-slate-50 transition flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl ${avatarColor} font-black flex items-center justify-center shrink-0`}>
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 truncate">
                          {patient ? `${patient.nom} ${patient.prenom}` : contact.nomComplet}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                          {contact.codeSite}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {contact.heureArrivee} · {contact.motifVisite}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      contact.etapeActuelle === 'En attente' ? 'bg-slate-100 text-slate-700' :
                      contact.etapeActuelle === 'En consultation' ? 'bg-cyan-100 text-cyan-800' :
                      contact.etapeActuelle === 'Vaccin dû' ? 'bg-amber-100 text-amber-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {contact.etapeActuelle}
                    </span>

                    <button
                      onClick={() => onSelectPatient(contact.patientId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-700 hover:bg-cyan-50 transition cursor-pointer"
                      title="Ouvrir le dossier patient"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 Col): À traiter en priorité */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">À traiter en priorité</h2>
            <p className="text-[11px] text-slate-400">Listes actionnables, filtrées par besoin</p>
          </div>

          <div className="p-4 space-y-3 flex-1">
            
            {/* Priority Item 1: VIH */}
            <button
              onClick={() => onNavigate('appointments')}
              className="w-full p-3 rounded-xl border border-amber-200/80 bg-amber-50/50 hover:bg-amber-100/50 text-left transition flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900">Rappels VIH en retard</div>
                  <div className="text-[11px] text-slate-500">Ouvrir les personnes concernées</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition" />
            </button>

            {/* Priority Item 2: Vaccination */}
            <button
              onClick={() => onNavigate('vaccination')}
              className="w-full p-3 rounded-xl border border-teal-200/80 bg-teal-50/50 hover:bg-teal-100/50 text-left transition flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900">Vaccinations à échéance</div>
                  <div className="text-[11px] text-slate-500">Planifier les doses manquantes</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition" />
            </button>

            {/* Priority Item 3: Lab results */}
            <button
              onClick={() => onNavigate('lab')}
              className="w-full p-3 rounded-xl border border-cyan-200/80 bg-cyan-50/50 hover:bg-cyan-100/50 text-left transition flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-cyan-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900">Résultats labo attendus</div>
                  <div className="text-[11px] text-slate-500">Consulter les demandes & IBIPIMO</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-700 group-hover:translate-x-0.5 transition" />
            </button>

            {/* Priority Item 4: Mother-Child */}
            <button
              onClick={() => onNavigate('mch')}
              className="w-full p-3 rounded-xl border border-pink-200/80 bg-pink-50/50 hover:bg-pink-100/50 text-left transition flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-pink-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900">Suivi mère-enfant (PTME)</div>
                  <div className="text-[11px] text-slate-500">Bilan nourrisson à programmer</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-pink-700 group-hover:translate-x-0.5 transition" />
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};
