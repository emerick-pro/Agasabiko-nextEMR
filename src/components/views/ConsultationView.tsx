import React, { useState, useEffect } from 'react';
import { Patient, ClinicalVitals, ConsultationDraft } from '../../types/emr';
import { localDb } from '../../db/indexedDb';
import { PatientBanner } from '../common/PatientBanner';
import { ViewTab } from '../common/Sidebar';
import { 
  Save, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Pill, 
  FlaskConical, 
  FileText, 
  Check, 
  Plus, 
  Trash2,
  Calendar,
  Sparkles
} from 'lucide-react';

interface ConsultationViewProps {
  patient: Patient;
  onNavigateAction: (view: ViewTab) => void;
  onBackToRecord: () => void;
}

export const ConsultationView: React.FC<ConsultationViewProps> = ({
  patient,
  onNavigateAction,
  onBackToRecord
}) => {
  const [activeStep, setActiveStep] = useState<'constantes' | 'diagnostic' | 'prescriptions' | 'plan'>('constantes');
  
  // Vitals State
  const [poids, setPoids] = useState<number | ''>(62.4);
  const [taille, setTaille] = useState<number | ''>(165);
  const [temperature, setTemperature] = useState<number | ''>(36.8);
  const [taSys, setTaSys] = useState<number | ''>(122);
  const [taDia, setTaDia] = useState<number | ''>(78);
  const [pouls, setPouls] = useState<number | ''>(77);
  const [motif, setMotif] = useState('Suivi VIH et renouvellement ARV semestriel');
  
  // Diagnostic State
  const [histoireMaladie, setHistoireMaladie] = useState('Patiente asymptomatique, bonne tolérance digestive du Dolutegravir.');
  const [diagnosticPrincipal, setDiagnosticPrincipal] = useState('Infection à VIH sous traitement antirétroviral stable');
  const [stadeOms, setStadeOms] = useState<'Stade I' | 'Stade II' | 'Stade III' | 'Stade IV'>('Stade I');

  // Prescriptions State
  const [prescriptions, setPrescriptions] = useState([
    { medicament: 'TDF / 3TC / DTG 300/300/50mg', posologie: '1 comprimé par jour au coucher', quantite: 30, dureeJours: 30 },
    { medicament: 'Cotrimoxazole 960mg (Bactrim)', posologie: '1 comprimé par jour', quantite: 30, dureeJours: 30 }
  ]);

  // Plan State
  const [prochainRdv, setProchainRdv] = useState('2026-11-19');
  const [conseils, setConseils] = useState('Renforcer l\'observance quotidienne à heure fixe. Prochaine charge virale semestrielle à programmer dans 4 mois.');

  const [draftSavedTime, setDraftSavedTime] = useState<string>('08:42');
  const [isSaving, setIsSaving] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState(false);

  // Auto-save draft locally
  const handleSaveDraft = async () => {
    setIsSaving(true);
    const draft: ConsultationDraft = {
      patientId: patient.id,
      date: '2026-10-22',
      vitals: {
        poidsKg: Number(poids),
        tailleCm: Number(taille),
        temperatureC: Number(temperature),
        taSystolique: Number(taSys),
        taDiastolique: Number(taDia),
        frequenceCardiaque: Number(pouls),
        imc: (Number(poids) && Number(taille)) ? +(Number(poids) / ((Number(taille)/100)**2)).toFixed(1) : undefined
      },
      motif,
      histoireMaladie,
      diagnosticPrincipal,
      diagnosticsAssocies: [],
      stadeOmsVih: stadeOms,
      prescriptions,
      examensDemandes: [],
      conseilsEtPlan: conseils,
      prochainRdvDate: prochainRdv,
      derniereSauvegarde: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    await localDb.put('consultation_drafts', draft, false);
    setDraftSavedTime(draft.derniereSauvegarde);
    setTimeout(() => setIsSaving(false), 400);
  };

  const handleValidateConsultation = async () => {
    await handleSaveDraft();
    
    // Also track in sync deltas
    const updatedPatient = {
      ...patient,
      derniereVisite: '2026-10-22',
      prochainRdv: prochainRdv,
      updatedAt: new Date().toISOString()
    };
    await localDb.put('patients', updatedPatient, true, 'consultation', 'INSERT');

    setValidationSuccess(true);
    setTimeout(() => {
      onBackToRecord();
    }, 1500);
  };

  const imc = (poids && taille) ? (Number(poids) / ((Number(taille)/100)**2)).toFixed(1) : '--';

  return (
    <div className="space-y-6">
      
      {/* Patient Banner */}
      <PatientBanner
        patient={patient}
        currentAction="consultation"
        onNavigateAction={onNavigateAction}
        onBackToRegistry={onBackToRecord}
      />

      {/* Header title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">
            Acte clinique · Dossier en contexte
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Nouvelle consultation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            La saisie se déroule sans perdre la bannière patient, avec étapes courtes et sauvegarde du brouillon local.
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

      {/* Main Grid: Form on Left vs Visit Pathway on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form area (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          
          {/* Step Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/60 px-5 pt-3 gap-2 overflow-x-auto text-xs font-bold">
            {[
              { id: 'constantes', label: 'Constantes' },
              { id: 'diagnostic', label: 'Diagnostic' },
              { id: 'prescriptions', label: 'Prescriptions' },
              { id: 'plan', label: 'Plan & RDV' },
            ].map((tab) => {
              const isActive = activeStep === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveStep(tab.id as any)}
                  className={`px-4 py-2 rounded-t-xl transition cursor-pointer ${
                    isActive 
                      ? 'bg-white text-cyan-800 border-t border-x border-slate-200 shadow-2xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="p-6 flex-1 space-y-5 text-xs">
            
            {activeStep === 'constantes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Constantes et motif de consultation
                  </h3>
                  <span className="text-[11px] font-mono text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded font-semibold">
                    IMC calculé : {imc} kg/m²
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Poids (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={poids}
                      onChange={(e) => setPoids(e.target.value ? parseFloat(e.target.value) : '')}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:border-cyan-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Taille (cm)</label>
                    <input
                      type="number"
                      value={taille}
                      onChange={(e) => setTaille(e.target.value ? parseInt(e.target.value) : '')}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:border-cyan-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Température (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value ? parseFloat(e.target.value) : '')}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:border-cyan-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Pression systolique (mmHg)</label>
                    <input
                      type="number"
                      value={taSys}
                      onChange={(e) => setTaSys(e.target.value ? parseInt(e.target.value) : '')}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:border-cyan-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Pression diastolique (mmHg)</label>
                    <input
                      type="number"
                      value={taDia}
                      onChange={(e) => setTaDia(e.target.value ? parseInt(e.target.value) : '')}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:border-cyan-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Fréquence cardiaque (bpm)</label>
                    <input
                      type="number"
                      value={pouls}
                      onChange={(e) => setPouls(e.target.value ? parseInt(e.target.value) : '')}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold focus:border-cyan-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Motif de consultation</label>
                  <textarea
                    rows={2}
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {activeStep === 'diagnostic' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-sm border-b pb-2">
                  Examen clinique & diagnostics
                </h3>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Anamnèse & histoire de la maladie</label>
                  <textarea
                    rows={3}
                    value={histoireMaladie}
                    onChange={(e) => setHistoireMaladie(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Diagnostic principal (CIM-10)</label>
                    <input
                      type="text"
                      value={diagnosticPrincipal}
                      onChange={(e) => setDiagnosticPrincipal(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Stade clinique OMS (VIH)</label>
                    <select
                      value={stadeOms}
                      onChange={(e) => setStadeOms(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                    >
                      <option value="Stade I">Stade I (Asymptomatique)</option>
                      <option value="Stade II">Stade II (Signes mineurs)</option>
                      <option value="Stade III">Stade III (Signes modérés)</option>
                      <option value="Stade IV">Stade IV (SIDA avéré)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 'prescriptions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Ordonnance médicale & traitements
                  </h3>
                  <button
                    type="button"
                    onClick={() => setPrescriptions([...prescriptions, { medicament: 'Paracétamol 500mg', posologie: '1 cp x 3/j si douleur', quantite: 20, dureeJours: 5 }])}
                    className="text-cyan-700 font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter un médicament</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {prescriptions.map((p, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 font-medium">Médicament</label>
                          <input
                            type="text"
                            value={p.medicament}
                            onChange={(e) => {
                              const next = [...prescriptions];
                              next[idx].medicament = e.target.value;
                              setPrescriptions(next);
                            }}
                            className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-medium">Posologie</label>
                          <input
                            type="text"
                            value={p.posologie}
                            onChange={(e) => {
                              const next = [...prescriptions];
                              next[idx].posologie = e.target.value;
                              setPrescriptions(next);
                            }}
                            className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="w-1/2">
                            <label className="text-[10px] text-slate-400 font-medium">Quantité</label>
                            <input
                              type="number"
                              value={p.quantite}
                              onChange={(e) => {
                                const next = [...prescriptions];
                                next[idx].quantite = parseInt(e.target.value) || 0;
                                setPrescriptions(next);
                              }}
                              className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                            />
                          </div>
                          <div className="w-1/2">
                            <label className="text-[10px] text-slate-400 font-medium">Jours</label>
                            <input
                              type="number"
                              value={p.dureeJours}
                              onChange={(e) => {
                                const next = [...prescriptions];
                                next[idx].dureeJours = parseInt(e.target.value) || 0;
                                setPrescriptions(next);
                              }}
                              className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPrescriptions(prescriptions.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeStep === 'plan' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-sm border-b pb-2">
                  Plan de soins & Prochain rendez-vous
                </h3>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date du prochain rendez-vous</label>
                  <input
                    type="date"
                    value={prochainRdv}
                    onChange={(e) => setProchainRdv(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:border-cyan-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Conseils d'observance & plan clinique</label>
                  <textarea
                    rows={3}
                    value={conseils}
                    onChange={(e) => setConseils(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Bottom Action Footer matching Screen 06 */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="text-emerald-700">●</span>
              <span>Brouillon local sauvegardé dans le navigateur ({draftSavedTime})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Enregistrement...' : 'Enregistrer le brouillon'}</span>
              </button>

              {activeStep !== 'plan' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeStep === 'constantes') setActiveStep('diagnostic');
                    else if (activeStep === 'diagnostic') setActiveStep('prescriptions');
                    else if (activeStep === 'prescriptions') setActiveStep('plan');
                  }}
                  className="px-5 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>Suivant</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleValidateConsultation}
                  className="px-6 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider la consultation</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Visit Pathway Tracker matching Screen 06 */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Parcours de cette visite
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                  ✓
                </div>
                <div>
                  <div className="font-bold text-slate-800">Identification</div>
                  <div className="text-[10px] text-slate-400">Vérifié à l'accueil</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-700 text-white flex items-center justify-center font-bold text-xs shrink-0 ring-2 ring-cyan-200">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-cyan-900">Consultation</div>
                  <div className="text-[10px] text-cyan-700 font-medium">Étape en cours de saisie</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs shrink-0">
                  <FlaskConical className="w-3 h-3" />
                </div>
                <div>
                  <div className="font-medium text-slate-600">Examens</div>
                  <div className="text-[10px]">Si prescrits au labo</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs shrink-0">
                  <Pill className="w-3 h-3" />
                </div>
                <div>
                  <div className="font-medium text-slate-600">Médicaments</div>
                  <div className="text-[10px]">Dispensation pharmacie</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs shrink-0">
                  <Calendar className="w-3 h-3" />
                </div>
                <div>
                  <div className="font-medium text-slate-600">Rendez-vous</div>
                  <div className="text-[10px]">Fixé au {prochainRdv}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs shrink-0">
                  ○
                </div>
                <div>
                  <div className="font-medium text-slate-600">Sortie</div>
                  <div className="text-[10px]">Clôture du contact</div>
                </div>
              </div>
            </div>
          </div>

          {/* Useful contextual reminders matching atlas */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 text-xs">
            <h4 className="font-bold text-slate-900 mb-2">Dernières informations utiles</h4>
            <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl space-y-1">
              <div className="font-bold text-cyan-900">Dernier résultat disponible</div>
              <div className="text-slate-600 text-[11px]">
                Charge virale ARN indétectable (&lt; 50 cp/ml) au 12/06/2026.
              </div>
            </div>
          </div>

        </div>

      </div>

      {validationSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-800 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <div>
            <div className="font-bold">Consultation validée et enregistrée en local !</div>
            <div className="text-emerald-200 text-[11px]">Ajoutée à la file de synchronisation bas débit.</div>
          </div>
        </div>
      )}

    </div>
  );
};
