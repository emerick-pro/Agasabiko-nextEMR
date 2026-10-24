import React, { useState, useEffect } from 'react';
import { Patient, DispensationRecord, StockItem } from '../../types/emr';
import { localDb } from '../../db/indexedDb';
import { PatientBanner } from '../common/PatientBanner';
import { ViewTab } from '../common/Sidebar';
import { 
  Pill, 
  Check, 
  Calendar, 
  ArrowLeft, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';

interface PharmacyViewProps {
  patient: Patient;
  onNavigateAction: (view: ViewTab) => void;
  onBackToRecord: () => void;
}

export const PharmacyView: React.FC<PharmacyViewProps> = ({
  patient,
  onNavigateAction,
  onBackToRecord
}) => {
  const [dispensations, setDispensations] = useState<DispensationRecord[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  
  // Dispensation Form State
  const [medicament, setMedicament] = useState('TDF / 3TC / DTG — 30 comprimés');
  const [quantite, setQuantite] = useState<number>(30);
  const [dureeJours, setDureeJours] = useState<number>(30);
  const [dateDelivrance, setDateDelivrance] = useState('2026-10-22');
  const [rdvRenouvellement, setRdvRenouvellement] = useState('2026-11-21');
  const [observation, setObservation] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadData = async () => {
    const list = await localDb.getAll<DispensationRecord>('dispensations');
    setDispensations(list.filter(d => d.patientId === patient.id || d.patientId === 'pat-1048'));
    const stockList = await localDb.getAll<StockItem>('stocks');
    setStocks(stockList);
  };

  useEffect(() => {
    loadData();
    const unsub = localDb.subscribe(loadData);
    return () => {
      unsub();
    };
  }, [patient.id]);

  // Automatically update renewal date when duration changes
  const handleDurationChange = (days: number) => {
    setDureeJours(days);
    try {
      const d = new Date(dateDelivrance);
      d.setDate(d.getDate() + days);
      setRdvRenouvellement(d.toISOString().slice(0, 10));
    } catch {}
  };

  const handleDispense = async (e: React.FormEvent) => {
    e.preventDefault();
    const matchingStock = stocks.find(s => s.nomProduit.toLowerCase().includes(medicament.toLowerCase().slice(0, 6)));

    const newRecord: DispensationRecord = {
      id: 'disp-' + Date.now(),
      patientId: patient.id,
      codeSite: patient.codeSite,
      nomPatient: `${patient.nom} ${patient.prenom}`,
      medicament,
      lotNumero: matchingStock ? matchingStock.numeroLot : 'LOT-ARV-011',
      quantiteDelivree: quantite,
      dureeJours,
      dateDelivrance,
      rendezVousRenouvellement: rdvRenouvellement,
      observation: observation || 'Observance renforcée, tolérance normale',
      dispensePar: 'CD - Clinicien démo'
    };

    // Save dispensation and update patient's next appointment
    await localDb.put('dispensations', newRecord, true, 'dispensation', 'INSERT');
    const updatedPatient = {
      ...patient,
      prochainRdv: rdvRenouvellement,
      updatedAt: new Date().toISOString()
    };
    await localDb.put('patients', updatedPatient, true, 'patient', 'UPDATE');

    // Decrement stock if available
    if (matchingStock && matchingStock.quantiteDisponible >= quantite) {
      const updatedStock: StockItem = {
        ...matchingStock,
        quantiteDisponible: Math.max(0, matchingStock.quantiteDisponible - quantite)
      };
      await localDb.put('stocks', updatedStock, true, 'stock', 'UPDATE');
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Patient Banner */}
      <PatientBanner
        patient={patient}
        currentAction="pharmacy"
        onNavigateAction={onNavigateAction}
        onBackToRegistry={onBackToRecord}
      />

      {/* Header matching Screen 12 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">
            Service transversal · Pharmacie
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Dispensation des médicaments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Un moteur commun pour TARV, prophylaxie, médicaments courants et produits de programmes.
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

      {/* Main Grid: Délivrer on Left vs Contrôles de sécurité on Right matching Screen 12 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Délivrer un produit (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900">Délivrer un produit</h3>
            <p className="text-[11px] text-slate-400">TARV, prophylaxies opportunistes et ordonnances courantes</p>
          </div>

          <form onSubmit={handleDispense} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Médicament / combinaison *</label>
              <select
                value={medicament}
                onChange={(e) => setMedicament(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:border-cyan-500 focus:outline-hidden"
              >
                <option value="TDF / 3TC / DTG — 30 comprimés">TDF / 3TC / DTG — 30 comprimés (ARV 1ère ligne)</option>
                <option value="Cotrimoxazole 960mg (Bactrim) — 30 comprimés">Cotrimoxazole 960mg (Bactrim) — 30 comprimés (Prophylaxie IO)</option>
                <option value="Isoniazide 300mg (TPI) — 30 comprimés">Isoniazide 300mg (TPI) — 30 comprimés (Prévention TB)</option>
                <option value="ACT Coartem (Artéméther/Luméfantrine)">ACT Coartem (Artéméther/Luméfantrine) — 24 cp</option>
                <option value="Amoxicilline 500mg — 20 gélules">Amoxicilline 500mg — 20 gélules</option>
                <option value="Paracétamol 500mg — 20 comprimés">Paracétamol 500mg — 20 comprimés</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Quantité délivrée</label>
                <input
                  type="number"
                  value={quantite}
                  onChange={(e) => setQuantite(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Durée (jours)</label>
                <input
                  type="number"
                  value={dureeJours}
                  onChange={(e) => handleDurationChange(parseInt(e.target.value) || 30)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:border-cyan-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Date de délivrance</label>
                <input
                  type="date"
                  value={dateDelivrance}
                  onChange={(e) => setDateDelivrance(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rendez-vous de renouvellement</label>
                <input
                  type="date"
                  value={rdvRenouvellement}
                  onChange={(e) => setRdvRenouvellement(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-cyan-800 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Observation</label>
              <textarea
                rows={2}
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Adhérence, counseling, problème de délivrance, vérification pilulier..."
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
              />
            </div>

            {/* Stock Availability Info Callout matching Screen 12 */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>Disponibilité à confirmer :</strong> le lot et la quantité doivent être vérifiés avant validation. Les règles de dérogation sont spécifiques au produit et au programme national.
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl flex items-center gap-2 transition shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Valider la délivrance</span>
            </button>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Délivrance enregistrée ! Stock décrémenté et synchronisation locale mise à jour.</span>
              </div>
            )}
          </form>
        </div>

        {/* Right: Contrôles de sécurité & Lien ancien SIDAInfo matching Screen 12 */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Contrôles de sécurité</h3>

            <div className="space-y-3 text-xs">
              
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Vérifier le patient</strong>
                  <p className="text-[11px] text-slate-500">Bannière persistante et dossier unique transversal.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Revoir la prescription</strong>
                  <p className="text-[11px] text-slate-500">Indication, quantité et traitement précédent.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Vérifier le stock</strong>
                  <p className="text-[11px] text-slate-500">Numéro de lot, expiration, seuil et dérogation.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Fixer le rendez-vous</strong>
                  <p className="text-[11px] text-slate-500">Suivi basé sur la durée délivrée (30j / 90j multi-mois).</p>
                </div>
              </div>

            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">Lien avec l'ancien SIDAInfo</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Les écrans « Dispensation ARV » et « Dispensation Méd IO » fusionnent dans un service unique, avec règles propres aux ARV, CTX, INH et autres produits. L'historique clinique et le stock sont conservés.
            </p>
            <button
              onClick={() => onNavigateAction('stocks')}
              className="text-cyan-700 font-bold flex items-center gap-1 hover:underline cursor-pointer pt-1"
            >
              <span>Consulter les lots en stock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
