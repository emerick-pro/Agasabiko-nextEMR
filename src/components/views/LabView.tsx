import React, { useState, useEffect } from 'react';
import { Patient, LabTestOrder } from '../../types/emr';
import { localDb } from '../../db/indexedDb';
import { PatientBanner } from '../common/PatientBanner';
import { ViewTab } from '../common/Sidebar';
import { 
  FlaskConical, 
  Plus, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Info, 
  FileCheck,
  ShieldCheck,
  X
} from 'lucide-react';

interface LabViewProps {
  patient: Patient;
  onNavigateAction: (view: ViewTab) => void;
  onBackToRecord: () => void;
}

export const LabView: React.FC<LabViewProps> = ({
  patient,
  onNavigateAction,
  onBackToRecord
}) => {
  const [labTests, setLabTests] = useState<LabTestOrder[]>([]);
  
  // New Order Form
  const [nomExamen, setNomExamen] = useState('Test de diagnostic paludisme (TDR)');
  const [priorite, setPriorite] = useState<'Routine' | 'Urgent'>('Routine');
  const [dateSouhaitee, setDateSouhaitee] = useState('2026-10-22');
  const [indication, setIndication] = useState('Justification clinique de la demande');
  const [isOrdering, setIsOrdering] = useState(false);

  // Result Input Modal
  const [activeResultOrder, setActiveResultOrder] = useState<LabTestOrder | null>(null);
  const [resultVal, setResultVal] = useState('');

  const loadData = async () => {
    const list = await localDb.getAll<LabTestOrder>('lab_orders');
    setLabTests(list.filter(item => item.patientId === patient.id || item.patientId === 'pat-1048' || item.patientId === 'pat-2331'));
  };

  useEffect(() => {
    loadData();
    const unsub = localDb.subscribe(loadData);
    return () => {
      unsub();
    };
  }, [patient.id]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrdering(true);

    const newOrder: LabTestOrder = {
      id: 'lab-' + Date.now(),
      patientId: patient.id,
      codeSite: patient.codeSite,
      nomPatient: `${patient.nom} ${patient.prenom}`,
      nomExamen,
      codeEchantillon: `S-2026-${Math.floor(100 + Math.random() * 900)}`,
      dateDemande: dateSouhaitee,
      priorite,
      indication,
      statut: 'Prescrit',
      valeurNormale: nomExamen.includes('TDR') ? 'Négatif' : nomExamen.includes('Charge virale') ? '< 50 copies/ml' : 'Normal',
      ibipimoStatut: 'En attente serveur central'
    };

    await localDb.put('lab_orders', newOrder, true, 'lab', 'INSERT');
    setIsOrdering(false);
  };

  const handleSaveResult = async () => {
    if (!activeResultOrder || !resultVal.trim()) return;

    const updated: LabTestOrder = {
      ...activeResultOrder,
      resultat: resultVal.trim(),
      statut: 'Validé',
      dateResultat: '2026-10-22',
      ibipimoStatut: 'Synchronisé IBIPIMO'
    };

    await localDb.put('lab_orders', updated, true, 'lab', 'UPDATE');
    setActiveResultOrder(null);
    setResultVal('');
  };

  return (
    <div className="space-y-6">
      
      {/* Patient Banner */}
      <PatientBanner
        patient={patient}
        currentAction="lab"
        onNavigateAction={onNavigateAction}
        onBackToRegistry={onBackToRecord}
      />

      {/* Header matching Screen 11 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">
            Service transversal · Laboratoire
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Demandes et résultats
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Le laboratoire sert tous les programmes : prescription → prélèvement → analyse → résultat.
          </p>
        </div>

        <button
          onClick={onBackToRecord}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Dossier patient</span>
        </button>
      </div>

      {/* Main Grid: Examens du patient on Left vs Nouvelle demande on Right matching Screen 11 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Examens du patient (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 sm:px-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Examens du patient</h3>
              <p className="text-[11px] text-slate-400">Réutilisable pour VIH, paludisme, TB, NFS, biochimie et autres</p>
            </div>
            <span className="text-[11px] font-semibold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
              Interop. IBIPIMO connecté
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-5">Demande</th>
                  <th className="py-3 px-4">Échantillon</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Résultat</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {labTests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Aucune analyse enregistrée pour ce patient.
                    </td>
                  </tr>
                ) : (
                  labTests.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900">{t.nomExamen}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{t.dateDemande}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {t.codeEchantillon}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.statut === 'Validé' ? 'bg-emerald-100 text-emerald-800' :
                          t.statut === 'En traitement' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {t.statut}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {t.resultat || <span className="text-slate-400 italic font-normal">En attente</span>}
                        </div>
                        {t.valeurNormale && (
                          <div className="text-[10px] text-slate-400">Ref: {t.valeurNormale}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {t.statut !== 'Validé' ? (
                          <button
                            onClick={() => {
                              setActiveResultOrder(t);
                              setResultVal(t.resultat || '');
                            }}
                            className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Saisir résultat
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-semibold">✓ Conforme</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <strong>Nouveau modèle :</strong> une demande de laboratoire peut contenir plusieurs analyses, un identifiant d'échantillon et une liste de résultats. Les résultats externes restent liés au même patient et au même événement clinique.
            </div>
          </div>
        </div>

        {/* Right: Nouvelle demande d'examen matching Screen 11 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900">Nouvelle demande d'examen</h3>
            <p className="text-[11px] text-slate-400">Prescription biologique</p>
          </div>

          <form onSubmit={handleCreateOrder} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Examen *</label>
              <select
                value={nomExamen}
                onChange={(e) => setNomExamen(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:border-cyan-500 focus:outline-hidden"
              >
                <option value="Test de diagnostic paludisme (TDR)">Test de diagnostic paludisme (TDR)</option>
                <option value="Charge virale VIH (ARN)">Charge virale VIH (ARN)</option>
                <option value="Glycémie à jeun">Glycémie à jeun</option>
                <option value="NFS (Numération Formule Sanguine)">NFS (Numération Formule Sanguine)</option>
                <option value="Goutte épaisse (Paludisme)">Goutte épaisse (Paludisme)</option>
                <option value="GeneXpert MTB/RIF (Crachats TB)">GeneXpert MTB/RIF (Crachats TB)</option>
                <option value="Sérologie VIH (Test de confirmation)">Sérologie VIH (Test de confirmation)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Priorité</label>
                <select
                  value={priorite}
                  onChange={(e) => setPriorite(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                >
                  <option value="Routine">Routine</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Date souhaitée</label>
                <input
                  type="date"
                  value={dateSouhaitee}
                  onChange={(e) => setDateSouhaitee(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Indication / note</label>
              <textarea
                rows={3}
                value={indication}
                onChange={(e) => setIndication(e.target.value)}
                placeholder="Justification clinique de la demande..."
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={isOrdering}
              className="w-full py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Créer la demande</span>
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            <strong>Chaîne de responsabilité :</strong> Traçabilité complète du prescripteur (Clinicien démo) au technicien de laboratoire avec signature horodatée.
          </div>
        </div>

      </div>

      {/* Result Entry Modal */}
      {activeResultOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                Saisir résultat : {activeResultOrder.nomExamen}
              </h3>
              <button 
                onClick={() => setActiveResultOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Résultat mesuré / observation *</label>
                <input
                  type="text"
                  value={resultVal}
                  onChange={(e) => setResultVal(e.target.value)}
                  placeholder="Ex: Positif, Négatif, 88 mg/dL, Indétectable..."
                  autoFocus
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden font-bold"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500">
                Code échantillon : <strong className="font-mono text-slate-800">{activeResultOrder.codeEchantillon}</strong><br />
                Valeur normale attendue : <strong className="text-slate-700">{activeResultOrder.valeurNormale}</strong>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveResultOrder(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveResult}
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-bold"
                >
                  Valider le résultat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
