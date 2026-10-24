import React, { useState } from 'react';
import { Patient } from '../../types/emr';
import { PatientBanner } from '../common/PatientBanner';
import { ViewTab } from '../common/Sidebar';
import { localDb } from '../../db/indexedDb';
import { 
  Baby, 
  HeartHandshake, 
  Calendar, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface MchViewProps {
  patient: Patient;
  onNavigateAction: (view: ViewTab) => void;
  onBackToRecord: () => void;
}

export const MchView: React.FC<MchViewProps> = ({
  patient,
  onNavigateAction,
  onBackToRecord
}) => {
  const [derniereDate, setDerniereDate] = useState('2026-10-07');
  const [prochainRdvCpn, setProchainRdvCpn] = useState('2026-11-04');
  const [typeSuivi, setTypeSuivi] = useState('CPN de routine');
  const [orientation, setOrientation] = useState('Suivi sur place');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveMch = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPatient = {
      ...patient,
      prochainRdv: prochainRdvCpn,
      smiData: {
        ...patient.smiData,
        statutGrossesse: 'Enceinte' as const,
        cpnVisitesEffectuees: (patient.smiData?.cpnVisitesEffectuees || 2) + 1,
        ptmeEnrolee: true
      },
      updatedAt: new Date().toISOString()
    };
    await localDb.put('patients', updatedPatient, true, 'patient', 'UPDATE');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Patient Banner */}
      <PatientBanner
        patient={patient}
        currentAction="mch"
        onNavigateAction={onNavigateAction}
        onBackToRegistry={onBackToRecord}
      />

      {/* Header matching Screen 10 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">
            Programme · Santé Mère-Enfant
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Grossesse et suivi du nourrisson
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Relation mère-enfant générique, sur laquelle les programmes PTME, CPN et vaccination se greffent.
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

      {/* Main Grid: Maternité/CPN on Left vs PTME Continuity on Right matching Screen 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Épisode de maternité (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-5">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Épisode de maternité</div>
              <h3 className="text-sm font-bold text-slate-900">Suivi de grossesse / CPN</h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Épisode ouvert
            </span>
          </div>

          {/* Stepper Tabs matching Screen 10 */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-1 text-[10px]">
                ✓
              </div>
              <span className="font-bold">Inscription</span>
            </div>

            <div className="p-3 bg-cyan-50 border border-cyan-600 rounded-xl text-cyan-950 ring-1 ring-cyan-500">
              <div className="w-5 h-5 rounded-full bg-cyan-700 text-white flex items-center justify-center mx-auto mb-1 text-[10px]">
                <Baby className="w-3 h-3" />
              </div>
              <span className="font-bold">CPN</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400">
              <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center mx-auto mb-1 text-[10px]">
                3
              </div>
              <span>Accouchement</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400">
              <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center mx-auto mb-1 text-[10px]">
                4
              </div>
              <span>Post-partum</span>
            </div>
          </div>

          <form onSubmit={handleSaveMch} className="space-y-4 text-xs pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Date du dernier suivi</label>
                <input
                  type="date"
                  value={derniereDate}
                  onChange={(e) => setDerniereDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Prochain rendez-vous CPN</label>
                <input
                  type="date"
                  value={prochainRdvCpn}
                  onChange={(e) => setProchainRdvCpn(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:border-cyan-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Type de suivi</label>
                <select
                  value={typeSuivi}
                  onChange={(e) => setTypeSuivi(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                >
                  <option value="CPN de routine">CPN de routine</option>
                  <option value="Grossesse à haut risque">Grossesse à haut risque</option>
                  <option value="Consultation d'urgence obstétricale">Consultation d'urgence</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                >
                  <option value="Suivi sur place">Suivi sur place (Centre de santé)</option>
                  <option value="Référé Hôpital de District Gitega">Référé Hôpital de District</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl flex items-center gap-2 transition shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer le suivi</span>
              </button>
            </div>

            {isSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Données de santé maternelle enregistrées et synchronisées en local !</span>
              </div>
            )}
          </form>
        </div>

        {/* Right: Parcours PTME - continuité SIDAInfo matching Screen 10 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900">Parcours PTME — continuité SIDAInfo</h3>
            <p className="text-[11px] text-slate-400">Prévention de la transmission mère-enfant</p>
          </div>

          <div className="space-y-3 text-xs">
            
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>Enrôlement PTME</span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                État de grossesse et traitement maternel TARV en cours (TDF/3TC/DTG)
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600">
              <div className="font-bold text-slate-800">Naissance / nouveau-né</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Date, lieu et issue de l'accouchement (À renseigner à l'accouchement)
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600">
              <div className="font-bold text-slate-800">Prophylaxie enfant</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Névirapine (NVP) sirop 6 semaines selon protocole national
              </p>
            </div>

            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-amber-950">
              <div className="font-bold text-amber-900">PCR / sérologie nourrisson</div>
              <p className="text-[11px] text-amber-800 mt-0.5">
                PCR 1 à 6 semaines de vie · Échantillon DBS envoyé au labo de référence
              </p>
            </div>

          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Échéance commune</div>
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className="font-bold text-slate-800">CPN suivante : 04/11/2026</span>
              <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                À planifier
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
