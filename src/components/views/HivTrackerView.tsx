import React, { useState } from 'react';
import { Patient } from '../../types/emr';
import { PatientBanner } from '../common/PatientBanner';
import { ViewTab } from '../common/Sidebar';
import { 
  HeartHandshake, 
  Pill, 
  FlaskConical, 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  Activity,
  History
} from 'lucide-react';

interface HivTrackerViewProps {
  patient: Patient;
  onNavigateAction: (view: ViewTab) => void;
  onBackToRecord: () => void;
}

export const HivTrackerView: React.FC<HivTrackerViewProps> = ({
  patient,
  onNavigateAction,
  onBackToRecord
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tarv' | 'viral_load' | 'adherence'>('overview');

  const vih = patient.vihData || {
    statutTraitement: 'Sous TARV',
    schemaARV: 'TDF / 3TC / DTG',
    ligneTraitement: '1ère ligne',
    dateInitiationTARV: '2021-03-15',
    derniereChargeVirale: {
      valeur: 'Indétectable (< 50 cp/ml)',
      date: '2026-06-12',
      indetectable: true
    },
    observance: 'Bonne (>95%)',
    prophylaxieCotrimoxazole: true,
    statutTB: 'Dépistage négatif'
  };

  return (
    <div className="space-y-6">
      
      {/* Patient Banner */}
      <PatientBanner
        patient={patient}
        currentAction="hiv-tracking"
        onNavigateAction={onNavigateAction}
        onBackToRegistry={onBackToRecord}
      />

      {/* Header matching Screen 08 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">
            Programme · SIDAInfo
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Suivi VIH / TARV
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Les fonctions historiques VIH restent un module complet, intégré au dossier patient unique.
          </p>
        </div>

        <button
          onClick={onBackToRecord}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Dossier</span>
        </button>
      </div>

      {/* Longitudinal Pathway Banner matching Screen 08 */}
      <div className="p-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl shadow-xs">
        <div className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">
          SIDAInfo · Module VIH
        </div>
        <div className="text-sm sm:text-base font-extrabold mt-0.5">
          Parcours VIH longitudinal
        </div>
        <div className="text-xs text-purple-200 mt-1 flex flex-wrap items-center gap-2">
          <span>Enrôlement</span>
          <span>→</span>
          <span>Évaluation</span>
          <span>→</span>
          <span className="font-bold text-white bg-purple-700/60 px-2 py-0.5 rounded">TARV</span>
          <span>→</span>
          <span>Charge virale</span>
          <span>→</span>
          <span>Observance</span>
          <span>→</span>
          <span>Rendez-vous / Relance</span>
        </div>
      </div>

      {/* 4 Status Metric Cards matching Screen 08 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Statut du traitement</div>
          <div className="text-base sm:text-lg font-black text-emerald-700 mt-1">
            {vih.statutTraitement}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Initiation : {vih.dateInitiationTARV}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Schéma ARV</div>
          <div className="text-base sm:text-lg font-black text-slate-900 font-mono mt-1">
            {vih.schemaARV}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{vih.ligneTraitement}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dernière charge virale</div>
          <div className="text-base sm:text-lg font-black text-slate-900 mt-1">
            Indétectable
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            {vih.derniereChargeVirale.date} · (&lt; 50 cp/ml)
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rendez-vous suivant</div>
          <div className="text-base sm:text-lg font-black text-purple-900 font-mono mt-1">
            {patient.prochainRdv || '15/10/2026'}
          </div>
          <div className="text-[10px] text-purple-700 font-semibold mt-0.5">Renouvellement ordonnance</div>
        </div>

      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dossier Clinique VIH (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Dossier clinique VIH</h3>
            <p className="text-[11px] text-slate-400">Consultations, TARV, CV, TB/INH et prévention</p>
          </div>

          <div className="space-y-3">
            
            {/* Row 1: Historique TARV */}
            <button
              onClick={() => onNavigateAction('pharmacy')}
              className="w-full p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/30 text-left transition flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-purple-800">Historique TARV</div>
                  <div className="text-[11px] text-slate-500">Délivrances précédentes et traitements actifs (TDF/3TC/DTG)</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition" />
            </button>

            {/* Row 2: Charge virale et IBIPIMO */}
            <button
              onClick={() => onNavigateAction('lab')}
              className="w-full p-4 rounded-xl border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/30 text-left transition flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center shrink-0">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-cyan-800">Charge virale et résultats</div>
                  <div className="text-[11px] text-slate-500">Prélèvements, résultats IBIPIMO, suivi suppression virologique</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-700 group-hover:translate-x-0.5 transition" />
            </button>

            {/* Row 3: Observance & TB/TPI */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Évaluation de l'observance thérapeutique</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                  {vih.observance}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Pilulier vérifié : 0 comprimé manqué sur les 30 derniers jours. Absence d'effets indésirables majeurs.
              </p>
              <div className="flex items-center gap-4 pt-1 text-[11px]">
                <span>Dépistage TB : <strong className="text-emerald-700">Négatif (4 signes d'alerte absents)</strong></span>
                <span>Prophylaxie CTX : <strong className="text-slate-800">En cours</strong></span>
              </div>
            </div>

          </div>
        </div>

        {/* Actions Rapides VIH matching Screen 08 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Actions rapides VIH</h3>
          
          <div className="space-y-2.5 text-xs">
            <button
              onClick={() => onNavigateAction('pharmacy')}
              className="w-full p-3 rounded-xl border border-slate-200 hover:border-purple-600 hover:bg-purple-50 text-left transition font-semibold text-slate-800 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-purple-700" />
                <span>Nouvelle délivrance ARV</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateAction('lab')}
              className="w-full p-3 rounded-xl border border-slate-200 hover:border-cyan-600 hover:bg-cyan-50 text-left transition font-semibold text-slate-800 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-cyan-700" />
                <span>Demande charge virale (ARN)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateAction('appointments')}
              className="w-full p-3 rounded-xl border border-slate-200 hover:border-amber-600 hover:bg-amber-50 text-left transition font-semibold text-slate-800 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>Rendez-vous / relance active</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
