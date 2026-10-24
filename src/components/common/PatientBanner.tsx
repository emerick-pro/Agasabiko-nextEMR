import React from 'react';
import { Patient } from '../../types/emr';
import { 
  FileText, 
  FlaskConical, 
  Pill, 
  Syringe, 
  HeartHandshake, 
  Baby, 
  Calendar,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { ViewTab } from './Sidebar';

interface PatientBannerProps {
  patient: Patient;
  currentAction?: string;
  onNavigateAction: (view: ViewTab) => void;
  onBackToRegistry?: () => void;
}

export const PatientBanner: React.FC<PatientBannerProps> = ({
  patient,
  currentAction,
  onNavigateAction,
  onBackToRegistry
}) => {
  const initial = patient.sexe === 'Féminin' ? 'F' : 'M';
  const avatarBg = patient.sexe === 'Féminin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';

  const quickActions = [
    { id: 'consultation' as ViewTab, label: 'Consultation', icon: FileText },
    { id: 'lab' as ViewTab, label: 'Laboratoire', icon: FlaskConical },
    { id: 'pharmacy' as ViewTab, label: 'Délivrance', icon: Pill },
    { id: 'vaccination' as ViewTab, label: 'Vaccination', icon: Syringe },
    { id: 'hiv-tracking' as ViewTab, label: 'Suivi VIH', icon: HeartHandshake },
    { id: 'mch' as ViewTab, label: 'Mère / enfant', icon: Baby },
    { id: 'appointments' as ViewTab, label: 'Rendez-vous', icon: Calendar },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden mb-6">
      
      {/* Top Patient Summary */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
        
        <div className="flex items-start gap-3.5">
          {onBackToRegistry && (
            <button 
              onClick={onBackToRegistry}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition mr-1 cursor-pointer"
              title="Retour au registre"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className={`w-12 h-12 rounded-2xl ${avatarBg} font-black text-lg flex items-center justify-center shrink-0 shadow-2xs`}>
            {initial}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {patient.nom} {patient.prenom}
              </h2>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {patient.codeSite}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {patient.sexe} · {patient.age} {patient.ageUnit || 'ans'} · {patient.adresse.province} / {patient.adresse.commune}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                Dossier unique
              </span>
              {patient.programmes.map((prg) => (
                <span 
                  key={prg} 
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    prg === 'VIH' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                    prg === 'SMI' ? 'bg-pink-50 text-pink-700 border border-pink-200' :
                    prg === 'Vaccination' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                    'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {prg}
                </span>
              ))}
              {patient.isProvisionalUid && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  UID Hors-Ligne Provisoire
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button: Nouvelle consultation */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateAction('consultation')}
            className="w-full sm:w-auto px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>+ Nouvelle consultation</span>
          </button>
        </div>

      </div>

      {/* 4 Metadata Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50/50 text-xs">
        <div className="p-3 sm:px-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Identifiant National</div>
          <div className="font-mono font-bold text-slate-800 mt-0.5">{patient.uidNational}</div>
        </div>
        <div className="p-3 sm:px-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dernière Visite</div>
          <div className="font-semibold text-slate-800 mt-0.5">{patient.derniereVisite || 'Non renseignée'}</div>
        </div>
        <div className="p-3 sm:px-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prochain Rendez-Vous</div>
          <div className="font-semibold text-slate-800 mt-0.5 text-cyan-800 font-mono">{patient.prochainRdv || 'À planifier'}</div>
        </div>
        <div className="p-3 sm:px-5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Parcours Actif</div>
          <div className="font-semibold text-slate-800 mt-0.5 truncate">{patient.parcoursActif}</div>
        </div>
      </div>

      {/* Quick Action Navigation Toolbar */}
      <div className="px-3 py-2 bg-white flex items-center gap-1 sm:gap-2 overflow-x-auto border-t border-slate-100">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const isActive = currentAction === action.id;
          return (
            <button
              key={action.id}
              onClick={() => onNavigateAction(action.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-cyan-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
