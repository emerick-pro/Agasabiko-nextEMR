import React, { useState } from 'react';
import { 
  BarChart3, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Filter,
  FileSpreadsheet,
  Check
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Soins');
  const [dateDebut, setDateDebut] = useState('2026-10-01');
  const [dateFin, setDateFin] = useState('2026-10-22');
  const [dhisExportSuccess, setDhisExportSuccess] = useState(false);

  const monthlyBars = [
    { label: 'S1', value: 45, height: '40%' },
    { label: 'S2', value: 58, height: '52%' },
    { label: 'S3', value: 50, height: '45%' },
    { label: 'S4', value: 80, height: '72%' },
    { label: 'S5', value: 72, height: '65%' },
    { label: 'S6', value: 92, height: '82%' },
    { label: 'S7', value: 65, height: '58%' },
    { label: 'S8', value: 105, height: '94%' },
    { label: 'S9', value: 88, height: '78%' },
    { label: 'S10', value: 95, height: '85%' },
    { label: 'S11', value: 85, height: '76%' },
    { label: 'S12', value: 112, height: '100%' },
  ];

  const handleExportDhis2 = () => {
    const dhis2Payload = {
      dataSet: "BDI_MOH_MONTHLY_ROUTINE",
      completeDate: new Date().toISOString(),
      period: "202610",
      orgUnit: "BDI_GTE_CDS_DEMO",
      dataValues: [
        { dataElement: "TOTAL_CONSULTATIONS", value: "314" },
        { dataElement: "DISTINCT_PATIENTS", value: "287" },
        { dataElement: "VIH_ACTIVE_COHORT", value: "142" },
        { dataElement: "VIH_VIRAL_SUPPRESSION_PCT", value: "98.2" },
        { dataElement: "PEV_ROUGEOLE1_DOSES", value: "76" },
        { dataElement: "CPN_TOTAL_VISITS", value: "54" },
        { dataElement: "DATA_COMPLETENESS_SCORE", value: "96" }
      ]
    };

    const blob = new Blob([JSON.stringify(dhis2Payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DHIS2_EXPORT_GITEGA_202610.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDhisExportSuccess(true);
    setTimeout(() => setDhisExportSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header matching Screen 15 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">
            Pilotage · Indicateurs
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Rapports et qualité des données
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Conserver les tableaux historiques SIDAInfo et expliquer chaque indicateur jusqu'aux patients concernés.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Imprimer</span>
          </button>

          <button
            onClick={handleExportDhis2}
            className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exporter DHIS2 (.json)</span>
          </button>
        </div>
      </div>

      {/* Program Tabs matching Screen 15 */}
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        {['Soins', 'VIH', 'Vaccination', 'Maternité', 'Maladies'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-xl border transition cursor-pointer ${
              activeTab === tab
                ? 'bg-cyan-700 text-white border-cyan-700 shadow-2xs font-bold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Date Filters matching Screen 15 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Du</label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="w-full p-2 rounded-xl border border-slate-300 focus:outline-hidden"
          />
        </div>
        <div>
          <label className="font-bold text-slate-700 block mb-1">Au</label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="w-full p-2 rounded-xl border border-slate-300 focus:outline-hidden"
          />
        </div>
        <div>
          <label className="font-bold text-slate-700 block mb-1">Site</label>
          <select className="w-full p-2 rounded-xl border border-slate-300 font-semibold focus:outline-hidden">
            <option>Centre de santé – Démo (Gitega)</option>
            <option>Tous les sites du district</option>
          </select>
        </div>
      </div>

      {/* 4 Metric Cards matching Screen 15 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Contacts enregistrés</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">314</div>
          <div className="text-[11px] text-slate-400 mt-1">Tous soins combinés</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Patients distincts</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">287</div>
          <div className="text-[11px] text-slate-400 mt-1">Multi-programmes</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Données complètes</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">96%</div>
          <div className="text-[11px] text-emerald-800 font-semibold mt-1">Contrôles de cohérence</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Éléments à vérifier</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">8</div>
          <div className="text-[11px] text-amber-800 font-medium mt-1">Liste d'action qualité</div>
        </div>

      </div>

      {/* Main Grid: Bar Chart on Left vs Quality Audits on Right matching Screen 15 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Activité du mois (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="border-b pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Activité du mois · Soins</h3>
              <p className="text-[11px] text-slate-400">Exemple illustratif agrégé pour le rapport national</p>
            </div>
            <span className="text-[11px] font-mono text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 font-semibold">
              Octobre 2026
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-52 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
            {monthlyBars.map((bar) => (
              <div key={bar.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[9px] font-mono text-slate-400 group-hover:text-cyan-700 font-bold opacity-0 group-hover:opacity-100 transition">
                  {bar.value}
                </span>
                <div 
                  style={{ height: bar.height }} 
                  className="w-full bg-cyan-600 group-hover:bg-cyan-700 rounded-t-lg transition shadow-2xs"
                />
                <span className="text-[10px] font-semibold text-slate-500 mt-1">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            Tendance schématique · agrégats mensuels pour alimentation de la pyramide sanitaire
          </div>
        </div>

        {/* Right: Qualité et traçabilité matching Screen 15 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Qualité et traçabilité</h3>
          <p className="text-[11px] text-slate-400 mb-3">Détection automatisée d'anomalies de saisie</p>

          <div className="space-y-2.5 text-xs">
            
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  4
                </span>
                <span className="font-semibold text-slate-800">Dates ou champs incohérents</span>
              </div>
              <button className="px-2.5 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-50 rounded-lg">
                Voir
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="font-semibold text-slate-800">Rendez-vous sans issue</span>
              </div>
              <button className="px-2.5 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-50 rounded-lg">
                Voir
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-cyan-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="font-semibold text-slate-800">Résultat labo en attente</span>
              </div>
              <button className="px-2.5 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-50 rounded-lg">
                Voir
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-purple-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="font-semibold text-slate-800">Dossier à rapprocher / doublon</span>
              </div>
              <button className="px-2.5 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-50 rounded-lg">
                Voir
              </button>
            </div>

          </div>

          {dhisExportSuccess && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Fichier d'échange DHIS2 généré avec succès !</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
