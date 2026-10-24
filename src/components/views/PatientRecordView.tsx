import React from 'react';
import { Patient } from '../../types/emr';
import { PatientBanner } from '../common/PatientBanner';
import { ViewTab } from '../common/Sidebar';
import { 
  HeartHandshake, 
  Syringe, 
  Baby, 
  Stethoscope, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Activity,
  FileText,
  FlaskConical,
  Pill
} from 'lucide-react';

interface PatientRecordViewProps {
  patient: Patient;
  onNavigateAction: (view: ViewTab) => void;
  onBackToRegistry: () => void;
}

export const PatientRecordView: React.FC<PatientRecordViewProps> = ({
  patient,
  onNavigateAction,
  onBackToRegistry
}) => {
  return (
    <div className="space-y-6">
      
      {/* 360 Longitudinal Patient Banner */}
      <PatientBanner
        patient={patient}
        onNavigateAction={onNavigateAction}
        onBackToRegistry={onBackToRegistry}
      />

      {/* Main Grid: Episodes & Programs on Left vs Points of Attention on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Programmes et épisodes de soins */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Programmes et épisodes de soins</h3>
                <p className="text-[11px] text-slate-400">Le contenu s'ajuste aux programmes, pas à l'identité</p>
              </div>
              <button 
                onClick={() => onNavigateAction('pathway')}
                className="text-xs font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Gérer les parcours</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Program 1: VIH */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                        <HeartHandshake className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">VIH / TARV</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Actif
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Suivi clinique · prescriptions TARV et charge virale
                  </p>
                  {patient.vihData && (
                    <div className="text-[11px] font-mono text-purple-900 bg-purple-50 p-2 rounded-lg mb-3">
                      <div>Schéma : {patient.vihData.schemaARV}</div>
                      <div>CV : {patient.vihData.derniereChargeVirale.valeur}</div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onNavigateAction('hiv-tracking')}
                  className="w-full py-2 bg-white hover:bg-purple-50 text-purple-800 font-semibold text-xs rounded-lg border border-purple-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>Voir le module VIH</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Program 2: Vaccination */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                        <Syringe className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">Vaccination PEV</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      Disponible
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Calendrier vaccinal personnalisé, doses et rappels
                  </p>
                </div>
                <button
                  onClick={() => onNavigateAction('vaccination')}
                  className="w-full py-2 bg-white hover:bg-teal-50 text-teal-800 font-semibold text-xs rounded-lg border border-teal-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>Voir le module PEV</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Program 3: Santé mère-enfant */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center">
                        <Baby className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">Santé Mère-Enfant / CPN</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Actif
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Santé maternelle, consultations prénatales et PTME
                  </p>
                </div>
                <button
                  onClick={() => onNavigateAction('mch')}
                  className="w-full py-2 bg-white hover:bg-pink-50 text-pink-800 font-semibold text-xs rounded-lg border border-pink-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>Voir le module Mère/Enfant</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Program 4: Autres soins / Paludisme / MNT */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900">Autres soins / Soins généraux</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      Disponible
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Paludisme, MNT (HTA, Diabète), Tuberculose
                  </p>
                </div>
                <button
                  onClick={() => onNavigateAction('consultation')}
                  className="w-full py-2 bg-white hover:bg-sky-50 text-sky-800 font-semibold text-xs rounded-lg border border-sky-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>Démarrer consultation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

          {/* Historical timeline cards */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Historique des événements récents
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <Clock className="w-4 h-4 text-cyan-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800">20/10/2026 · Consultation de suivi & dispensation</div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Délivrance TDF/3TC/DTG 30 cp par Clinicien démo. Poids: 62.4 kg, TA: 122/78 mmHg.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <FlaskConical className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800">12/06/2026 · Charge virale VIH semestrielle</div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Résultat : Indétectable (&lt; 50 copies/ml). Synchronisé avec IBIPIMO central.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): Points d'attention & Actions de suivi */}
        <div className="space-y-6">
          
          {/* Points d'attention matching atlas */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Points d'attention</h3>
            
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                <div className="flex items-center gap-2 font-bold text-amber-900 mb-1">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>Rendez-vous</span>
                </div>
                <div className="text-[11px] text-amber-800">
                  Date prévue : {patient.prochainRdv || '15/10/2026'} · Suivi observance
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1">
                  <FlaskConical className="w-4 h-4 text-emerald-600" />
                  <span>Résultat récent</span>
                </div>
                <div className="text-[11px] text-emerald-800">
                  Charge virale indétectable (12/06/2026) · Excellente réponse virologique
                </div>
              </div>

              <div className="p-3 bg-cyan-50/70 border border-cyan-200/80 rounded-xl">
                <div className="flex items-center gap-2 font-bold text-cyan-900 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                  <span>Identification</span>
                </div>
                <div className="text-[11px] text-cyan-800">
                  Identifiant national unique synchronisé ({patient.uidNational})
                </div>
              </div>
            </div>
          </div>

          {/* Actions de suivi */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Actions de suivi</h3>
            
            <div className="space-y-2 text-xs">
              <button
                onClick={() => onNavigateAction('pharmacy')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-cyan-600 hover:bg-cyan-50/40 text-left transition font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
              >
                <span>Délivrer médicaments</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateAction('lab')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-cyan-600 hover:bg-cyan-50/40 text-left transition font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
              >
                <span>Prescrire examen labo</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigateAction('appointments')}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-cyan-600 hover:bg-cyan-50/40 text-left transition font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
              >
                <span>Planifier rendez-vous</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
