import React, { useState } from 'react';
import { Patient, ProgramType } from '../../types/emr';
import { ViewTab } from '../common/Sidebar';
import { 
  Activity, 
  Check, 
  Clock, 
  ArrowRight, 
  Info, 
  CheckCircle2, 
  ShieldCheck, 
  FileText,
  FlaskConical,
  Pill,
  Calendar,
  LogOut
} from 'lucide-react';

interface CarePathwayViewProps {
  patients: Patient[];
  selectedPatient: Patient;
  onSelectPatient: (patientId: string) => void;
  onNavigateAction: (view: ViewTab) => void;
}

export const CarePathwayView: React.FC<CarePathwayViewProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  onNavigateAction
}) => {
  const [pathwayType, setPathwayType] = useState('Consultation générale & Suivi VIH');
  const [currentStepIndex, setCurrentStepIndex] = useState(1); // Step 2 (Consultation)

  const steps = [
    { title: 'Accueil / identité', desc: 'Enregistrement de l\'arrivée et vérification UID', icon: Check, status: currentStepIndex > 0 ? 'Terminé' : 'En cours' },
    { title: 'Consultation', desc: 'Constantes vitales, anamnèse et examen clinique', icon: FileText, status: currentStepIndex === 1 ? 'En cours' : currentStepIndex > 1 ? 'Terminé' : 'À venir' },
    { title: 'Examens si indiqués', desc: 'Prélèvement labo ou TDR immédiat', icon: FlaskConical, status: currentStepIndex === 2 ? 'En cours' : currentStepIndex > 2 ? 'Terminé' : 'À venir' },
    { title: 'Traitement', desc: 'Dispensation pharmacie, TARV et conseils', icon: Pill, status: currentStepIndex === 3 ? 'En cours' : currentStepIndex > 3 ? 'Terminé' : 'À venir' },
    { title: 'Rendez-vous', desc: 'Planification du prochain passage clinique', icon: Calendar, status: currentStepIndex === 4 ? 'En cours' : currentStepIndex > 4 ? 'Terminé' : 'À venir' },
    { title: 'Sortie', desc: 'Clôture du contact et synchronisation', icon: LogOut, status: currentStepIndex === 5 ? 'Terminé' : 'À venir' }
  ];

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">
            Orchestration clinique
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Moteur de parcours patient
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Le parcours décrit les étapes requises selon le motif de visite et le programme, sans imposer les mêmes écrans à tous.
          </p>
        </div>

        <button
          onClick={() => onNavigateAction('consultation')}
          className="px-4 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-2 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>→ Ouvrir consultation</span>
        </button>
      </div>

      {/* Info Callout */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start justify-between gap-3 text-xs text-sky-950">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-sky-900">Une visite, plusieurs services, un seul contexte patient :</strong> Le chemin est configurable par la structure et le programme ; un clinicien peut ajouter ou passer une étape avec justification.
          </div>
        </div>
        <span className="hidden sm:inline-block font-semibold text-sky-800 bg-white px-2.5 py-1 rounded-lg border border-sky-200 text-[11px] shrink-0">
          Sans triage obligatoire
        </span>
      </div>

      {/* Selectors Bar matching Screen 07 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Type de parcours de soins</label>
          <select
            value={pathwayType}
            onChange={(e) => setPathwayType(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden font-semibold text-slate-800"
          >
            <option value="Consultation générale & Suivi VIH">Consultation générale & Suivi VIH (Complet)</option>
            <option value="Vaccination PEV seule">Vaccination PEV seule (Rapide)</option>
            <option value="Santé Mère-Enfant / CPN">Santé Mère-Enfant / CPN & PTME</option>
            <option value="Renouvellement pharmacie direct">Renouvellement pharmacie direct</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Patient sélectionné</label>
          <select
            value={selectedPatient.id}
            onChange={(e) => onSelectPatient(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden font-semibold text-slate-800"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.nom} {p.prenom} · {p.codeSite} ({p.sexe} · {p.age} {p.ageUnit || 'ans'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Horizontal Steps Cards matching Screen 07 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between text-xs">
          <h3 className="font-bold text-slate-900">
            Étapes du contact — {pathwayType}
          </h3>
          <span className="text-slate-400">
            Étape {currentStepIndex + 1} sur {steps.length}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {steps.map((st, i) => {
            const isCompleted = i < currentStepIndex;
            const isCurrent = i === currentStepIndex;
            return (
              <div
                key={st.title}
                onClick={() => setCurrentStepIndex(i)}
                className={`p-3 rounded-xl border text-xs text-left transition cursor-pointer flex flex-col justify-between ${
                  isCurrent 
                    ? 'border-cyan-600 bg-cyan-50/70 ring-1 ring-cyan-500' 
                    : isCompleted 
                      ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                      : 'border-slate-200 bg-slate-50/50 text-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCompleted ? 'bg-emerald-600 text-white' :
                      isCurrent ? 'bg-cyan-700 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isCompleted ? '✓' : i + 1}
                    </span>
                    <span className="text-[10px] font-medium">
                      {isCompleted ? 'Terminé' : isCurrent ? 'En cours' : 'À venir'}
                    </span>
                  </div>
                  <div className={`font-bold mt-1 leading-tight ${isCurrent ? 'text-cyan-950' : 'text-slate-800'}`}>
                    {st.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Detail + Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Current Step Action (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">Étape actuelle</div>
              <h3 className="text-base font-extrabold text-slate-900">{steps[currentStepIndex].title}</h3>
              <p className="text-xs text-slate-500">{steps[currentStepIndex].desc}</p>
            </div>
            <button
              onClick={handleNextStep}
              className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>Marquer l'étape comme terminée</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <p>
              Les tâches opérationnelles apparaissent ici selon l'étape, le programme, le rôle de l'utilisateur et les données déjà présentes au dossier.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => onNavigateAction('consultation')}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:border-cyan-600 text-slate-800 rounded-lg font-semibold"
              >
                Ouvrir l'écran dédié
              </button>
              <button
                onClick={handleNextStep}
                className="px-3 py-1.5 text-slate-500 hover:text-slate-800 font-medium"
              >
                Passer cette étape (non requis)
              </button>
            </div>
          </div>
        </div>

        {/* Platform Rules */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-xs">
          <h4 className="font-bold text-slate-900 text-sm">Règles de la plateforme</h4>

          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Parcours paramétrables</strong>
                <p className="text-[11px] text-slate-500">Éligibilité, étapes et formulaires liés au programme national de santé.</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Suivi longitudinal unifié</strong>
                <p className="text-[11px] text-slate-500">Les événements des différents services alimentent le même dossier unique sans double saisie.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
