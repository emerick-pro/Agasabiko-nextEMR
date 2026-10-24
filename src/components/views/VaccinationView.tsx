import React, { useState, useEffect } from 'react';
import { Patient, VaccineDoseRecord, StockItem } from '../../types/emr';
import { localDb } from '../../db/indexedDb';
import { PatientBanner } from '../common/PatientBanner';
import { ViewTab } from '../common/Sidebar';
import { 
  Syringe, 
  Check, 
  Calendar, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Package
} from 'lucide-react';

interface VaccinationViewProps {
  patient: Patient;
  onNavigateAction: (view: ViewTab) => void;
  onBackToRecord: () => void;
}

export const VaccinationView: React.FC<VaccinationViewProps> = ({
  patient,
  onNavigateAction,
  onBackToRecord
}) => {
  const [doses, setDoses] = useState<VaccineDoseRecord[]>([]);
  const [vaccineStocks, setVaccineStocks] = useState<StockItem[]>([]);
  
  // Registration Form State
  const [antigene, setAntigene] = useState('Rougeole 1 (RR1)');
  const [dateAdmin, setDateAdmin] = useState('2026-10-22');
  const [lotNumero, setLotNumero] = useState('LOT-VAC-005');
  const [dateExpiration, setDateExpiration] = useState('2027-08-31');
  const [lieuAdmin, setLieuAdmin] = useState('Centre de santé - Démo (Gitega)');
  const [observation, setObservation] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadData = async () => {
    const list = await localDb.getAll<VaccineDoseRecord>('vaccines');
    setDoses(list.filter(d => d.patientId === patient.id || d.patientId === 'pat-1048'));
    const stocks = await localDb.getAll<StockItem>('stocks');
    setVaccineStocks(stocks.filter(s => s.programme === 'Vaccination'));
  };

  useEffect(() => {
    loadData();
    const unsub = localDb.subscribe(loadData);
    return () => {
      unsub();
    };
  }, [patient.id]);

  const pevCalendar = [
    { antigene: 'BCG', age: 'Naissance · 20 janv. 2026', done: true, date: '1992-04-14' },
    { antigene: 'VPO 0', age: 'Naissance · 20 janv. 2026', done: true, date: '1992-04-14' },
    { antigene: 'Penta 1', age: '6 semaines · 03 mars 2026', done: true, date: '1992-05-26' },
    { antigene: 'Penta 2', age: '10 semaines · 31 mars 2026', done: true, date: '1992-06-23' },
    { antigene: 'Penta 3', age: '14 semaines · 28 avr. 2026', done: true, date: '1992-07-21' },
    { antigene: 'Rougeole 1 (RR1)', age: '9 mois · 20 oct. 2026', done: false, date: undefined, isDue: true },
    { antigene: 'Fièvre Jaune', age: '9 mois · 20 oct. 2026', done: false, date: undefined, isDue: true },
    { antigene: 'Rougeole 2 (RR2)', age: '18 mois', done: false, date: undefined, isDue: false },
  ];

  const handleRegisterDose = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: VaccineDoseRecord = {
      id: 'vac-' + Date.now(),
      patientId: patient.id,
      antigene,
      doseIndex: 1,
      dateAdministration: dateAdmin,
      numeroLot: lotNumero,
      dateExpirationLot: dateExpiration,
      lieuAdministration: lieuAdmin,
      administrePar: 'CD - Clinicien démo',
      observation
    };

    await localDb.put('vaccines', newRecord, true, 'vaccine', 'INSERT');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Patient Banner */}
      <PatientBanner
        patient={patient}
        currentAction="vaccination"
        onNavigateAction={onNavigateAction}
        onBackToRegistry={onBackToRecord}
      />

      {/* Header matching Screen 09 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">
            Programme · PEV Burundi
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Calendrier de vaccination
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Doses, échéances, antécédents et traçabilité des lots depuis le dossier patient.
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

      {/* Main Grid: Calendrier on Left vs Enregistrer dose on Right matching Screen 09 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Calendrier vaccinal (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Calendrier vaccinal national</h3>
              <p className="text-[11px] text-slate-400">Règles, doses et âges configurables par le PEV Burundi</p>
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              1 échéance à vacciner
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {pevCalendar.map((item, idx) => {
              const registered = doses.some(d => d.antigene.toLowerCase().includes(item.antigene.toLowerCase()));
              const isDone = item.done || registered;

              return (
                <div
                  key={item.antigene}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                    isDone 
                      ? 'bg-slate-50/60 border-slate-200' 
                      : item.isDue 
                        ? 'bg-amber-50/40 border-amber-200 ring-1 ring-amber-400' 
                        : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isDone 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : item.isDue 
                          ? 'bg-amber-500 text-white font-mono' 
                          : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{item.antigene}</div>
                      <div className="text-[11px] text-slate-500">{item.age}</div>
                    </div>
                  </div>

                  <div>
                    {isDone ? (
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-[11px]">
                        Administré
                      </span>
                    ) : item.isDue ? (
                      <button
                        onClick={() => setAntigene(item.antigene)}
                        className="px-3 py-1 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
                      >
                        Administrer
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">À venir</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Enregistrer une dose matching Screen 09 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900">Enregistrer une dose</h3>
            <p className="text-[11px] text-slate-400">Traçabilité des lots et péremptions</p>
          </div>

          <form onSubmit={handleRegisterDose} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Antigène / dose *</label>
              <select
                value={antigene}
                onChange={(e) => setAntigene(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:border-cyan-500 focus:outline-hidden"
              >
                <option value="Rougeole 1 (RR1)">Rougeole 1 (RR1)</option>
                <option value="Fièvre Jaune">Fièvre Jaune</option>
                <option value="Penta 3">Penta 3</option>
                <option value="VPI">Poliomyélite injectable (VPI)</option>
                <option value="Vitamine A">Vitamine A (100.000 UI)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Date d'administration</label>
                <input
                  type="date"
                  value={dateAdmin}
                  onChange={(e) => setDateAdmin(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Numéro de Lot</label>
                <input
                  type="text"
                  value={lotNumero}
                  onChange={(e) => setLotNumero(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:border-cyan-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Expiration du lot</label>
                <input
                  type="date"
                  value={dateExpiration}
                  onChange={(e) => setDateExpiration(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lieu</label>
                <select
                  value={lieuAdmin}
                  onChange={(e) => setLieuAdmin(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                >
                  <option value="Centre de santé - Démo (Gitega)">Centre de santé</option>
                  <option value="Stratégie avancée / Colline">Stratégie avancée</option>
                  <option value="Maternité">Maternité</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Observation post-vaccination</label>
              <textarea
                rows={2}
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Information facultative (tolérance, absence de réaction indésirable immédiate)"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer la dose</span>
            </button>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Dose enregistrée en local et ajoutée à la file sync !</span>
              </div>
            )}
          </form>
        </div>

      </div>

    </div>
  );
};
