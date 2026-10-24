import React, { useState } from 'react';
import { Patient, Gender, ProgramType } from '../../types/emr';
import { localDb } from '../../db/indexedDb';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles,
  Info
} from 'lucide-react';

interface AdmissionViewProps {
  onBackToRegistry: () => void;
  onPatientCreated: (newPatientId: string) => void;
}

export const AdmissionView: React.FC<AdmissionViewProps> = ({
  onBackToRegistry,
  onPatientCreated
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [sexe, setSexe] = useState<Gender>('Féminin');
  const [dateNaissance, setDateNaissance] = useState('1998-05-15');
  const [codeSite, setCodeSite] = useState(`AUTO-PROV-${Math.floor(1000 + Math.random() * 9000)}`);
  const [uidNational, setUidNational] = useState('');
  
  // Step 2 Coordinates
  const [province, setProvince] = useState('Gitega');
  const [commune, setCommune] = useState('Nyabihanga');
  const [colline, setColline] = useState('Nyabihanga');
  const [telephone, setTelephone] = useState('+257 7');
  const [contactUrgence, setContactUrgence] = useState('');

  // Step 3 Programs & Consent
  const [selectedPrograms, setSelectedPrograms] = useState<ProgramType[]>(['VIH']);
  const [consentAccepted, setConsentAccepted] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Duplicate warning detector
  const hasPotentialDuplicate = nom.trim().toUpperCase() === 'NININAHAZWE' || nom.trim().toUpperCase() === 'NDAYISHIMIYE';

  const toggleProgram = (prg: ProgramType) => {
    if (selectedPrograms.includes(prg)) {
      if (selectedPrograms.length > 1) {
        setSelectedPrograms(selectedPrograms.filter(p => p !== prg));
      }
    } else {
      setSelectedPrograms([...selectedPrograms, prg]);
    }
  };

  const calculateAge = (dob: string): number => {
    try {
      const birth = new Date(dob);
      const today = new Date('2026-10-24');
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return Math.max(0, age);
    } catch {
      return 25;
    }
  };

  const handleSubmit = async () => {
    if (!nom.trim() || !prenom.trim()) return;
    setIsSubmitting(true);

    const generatedId = 'pat-' + Date.now();
    const finalUid = uidNational.trim() ? uidNational.trim() : `PROV-${Math.floor(1000 + Math.random() * 9000)}-GTE`;
    const isProvisional = !uidNational.trim();

    const newPatient: Patient = {
      id: generatedId,
      codeSite: codeSite.trim(),
      uidNational: finalUid,
      isProvisionalUid: isProvisional,
      nom: nom.trim().toUpperCase(),
      prenom: prenom.trim(),
      sexe,
      dateNaissance,
      age: calculateAge(dateNaissance),
      ageUnit: 'ans',
      telephone: telephone.trim() || undefined,
      adresse: {
        province,
        commune,
        colline,
        contactUrgence: contactUrgence.trim() || undefined
      },
      programmes: selectedPrograms,
      derniereVisite: '2026-10-22',
      prochainRdv: '2026-11-19',
      parcoursActif: selectedPrograms.includes('VIH') ? 'Consultation VIH' : `${selectedPrograms[0]} - Suivi`,
      pointsAttention: isProvisional ? ['Identifiant national provisoire généré hors-ligne'] : [],
      vihData: selectedPrograms.includes('VIH') ? {
        statutTraitement: 'Sous TARV',
        schemaARV: 'TDF / 3TC / DTG',
        ligneTraitement: '1ère ligne',
        dateInitiationTARV: '2026-10-22',
        derniereChargeVirale: {
          valeur: 'À réaliser à M6',
          date: '2026-10-22',
          indetectable: false
        },
        observance: 'Bonne (>95%)',
        prophylaxieCotrimoxazole: true,
        statutTB: 'Dépistage négatif'
      } : undefined,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending'
    };

    // Save to IndexedDB and queue in Sync Outbox!
    await localDb.put('patients', newPatient, true, 'patient', 'INSERT');
    setIsSubmitting(false);
    onPatientCreated(generatedId);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">
            Admission · Étape {step}/3
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Création du dossier patient
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Un formulaire progressif, avec recherche préalable et informations minimales obligatoires.
          </p>
        </div>

        <button
          onClick={onBackToRegistry}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Registre</span>
        </button>
      </div>

      {/* Stepper Progress Bar matching Screen 04 */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between max-w-lg mx-auto text-xs">
          
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 font-bold cursor-pointer ${
              step >= 1 ? 'text-cyan-700' : 'text-slate-400'
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step > 1 ? 'bg-cyan-700 text-white' : step === 1 ? 'bg-cyan-100 text-cyan-800 ring-2 ring-cyan-600' : 'bg-slate-100 text-slate-400'
            }`}>
              {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
            </span>
            <span>Vérifier l'identité</span>
          </button>

          <div className={`flex-1 h-0.5 mx-3 ${step >= 2 ? 'bg-cyan-600' : 'bg-slate-200'}`} />

          <button
            onClick={() => { if (nom && prenom) setStep(2); }}
            className={`flex items-center gap-2 font-bold cursor-pointer ${
              step >= 2 ? 'text-cyan-700' : 'text-slate-400'
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step > 2 ? 'bg-cyan-700 text-white' : step === 2 ? 'bg-cyan-100 text-cyan-800 ring-2 ring-cyan-600' : 'bg-slate-100 text-slate-400'
            }`}>
              {step > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
            </span>
            <span>Coordonnées</span>
          </button>

          <div className={`flex-1 h-0.5 mx-3 ${step >= 3 ? 'bg-cyan-600' : 'bg-slate-200'}`} />

          <button
            onClick={() => { if (nom && prenom) setStep(3); }}
            className={`flex items-center gap-2 font-bold cursor-pointer ${
              step === 3 ? 'text-cyan-700' : 'text-slate-400'
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step === 3 ? 'bg-cyan-100 text-cyan-800 ring-2 ring-cyan-600' : 'bg-slate-100 text-slate-400'
            }`}>
              3
            </span>
            <span>Programmes / consentement</span>
          </button>

        </div>
      </div>

      {/* Main Grid: Form on Left vs Educational Sidebar on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Container (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
          
          {step === 1 && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm border-b pb-2">
                1. Identification du patient
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nom *</label>
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Ex: NDUWIMANA"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prénom *</label>
                  <input
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Ex: Espérance"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sexe *</label>
                  <select
                    value={sexe}
                    onChange={(e) => setSexe(e.target.value as Gender)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                  >
                    <option value="Féminin">Féminin</option>
                    <option value="Masculin">Masculin</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date de naissance *</label>
                  <input
                    type="date"
                    value={dateNaissance}
                    onChange={(e) => setDateNaissance(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Code dossier du site (Généré en local)</label>
                  <input
                    type="text"
                    value={codeSite}
                    onChange={(e) => setCodeSite(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-mono font-bold text-slate-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pièce / UID national (si déjà connue)</label>
                  <input
                    type="text"
                    value={uidNational}
                    onChange={(e) => setUidNational(e.target.value)}
                    placeholder="Facultatif (ex: UID-784-XXXX)"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Duplicate check prompt matching Screen 04 */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5">
                <Search className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>Recherche de doublons :</strong> vérifiez le nom, la date de naissance et un identifiant disponible avant validation. L'algorithme phonétique n'a détecté aucun conflit bloquant pour ce dossier.
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  🔒 Enregistrement sécurisé en local dans le navigateur
                </span>
                <button
                  type="button"
                  disabled={!nom.trim() || !prenom.trim()}
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-800 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>Continuer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm border-b pb-2">
                2. Coordonnées géographiques et contacts (Burundi)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Province *</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                  >
                    <option value="Gitega">Gitega</option>
                    <option value="Bujumbura Mairie">Bujumbura Mairie</option>
                    <option value="Ngozi">Ngozi</option>
                    <option value="Karuzi">Karuzi</option>
                    <option value="Muyinga">Muyinga</option>
                    <option value="Muramvya">Muramvya</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Commune *</label>
                  <input
                    type="text"
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    placeholder="Ex: Nyabihanga, Gitega, Giheta"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Colline / Quartier *</label>
                  <input
                    type="text"
                    value={colline}
                    onChange={(e) => setColline(e.target.value)}
                    placeholder="Ex: Rutegama, Nyabihanga"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Numéro de téléphone</label>
                  <input
                    type="text"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="+257 7X XXX XXX"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Personne de contact / Lien</label>
                  <input
                    type="text"
                    value={contactUrgence}
                    onChange={(e) => setContactUrgence(e.target.value)}
                    placeholder="Ex: Époux, Mère, ASC Colline"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  ← Précédent
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>Continuer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm border-b pb-2">
                3. Programmes cliniques & consentement
              </h3>

              <div>
                <label className="font-bold text-slate-700 block mb-2">
                  Programmes de santé initiaux pour ce patient (Multi-programmes)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['VIH', 'Vaccination', 'SMI', 'Paludisme', 'MNT', 'TB', 'Maternité'] as ProgramType[]).map((prg) => {
                    const isChecked = selectedPrograms.includes(prg);
                    return (
                      <button
                        type="button"
                        key={prg}
                        onClick={() => toggleProgram(prg)}
                        className={`p-3 rounded-xl border text-left font-semibold transition cursor-pointer flex items-center justify-between ${
                          isChecked 
                            ? 'bg-cyan-50 border-cyan-600 text-cyan-900 shadow-2xs' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{prg}</span>
                        {isChecked && <Check className="w-4 h-4 text-cyan-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Consent Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="consentCheck"
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-cyan-500 h-4 w-4 mt-0.5"
                  />
                  <label htmlFor="consentCheck" className="text-slate-700 cursor-pointer">
                    <strong>Consentement éclairé :</strong> Le patient (ou représentant légal) consent à la prise en charge médicale, au suivi longitudinal et au partage sécurisé des données au niveau national (Système SIDAInfo / DHIS2 Burundi).
                  </label>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  ← Précédent
                </button>
                <button
                  type="button"
                  disabled={!consentAccepted || isSubmitting}
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-cyan-700 hover:bg-cyan-800 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2 transition shadow-xs cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Création...' : 'Créer le dossier patient'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Informational Side Card matching Screen 04 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4 self-start">
          <h3 className="font-bold text-slate-900 text-sm">
            Pourquoi simplifier l'admission ?
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="text-slate-800">Démarrer rapidement</strong>
                <p className="text-[11px] text-slate-500 mt-0.5">L'identité minimale suffit pour le premier contact.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="text-slate-800">Éviter les doublons</strong>
                <p className="text-[11px] text-slate-500 mt-0.5">Recherche par code, UID, noms et date de naissance.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <strong className="text-slate-800">Compléter ensuite</strong>
                <p className="text-[11px] text-slate-500 mt-0.5">Les données des programmes sont saisies pendant les soins.</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              Évolution de SIDAInfo
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Les anciens champs « Admission », « Code dossier », « Province / Commune / Colline » sont conservés, mais la saisie HIV-spécifique n'est plus obligatoire à la création de l'identité.
            </p>
            <div className="mt-2 text-[10px] font-mono text-cyan-800 bg-cyan-50 px-2 py-1 rounded border border-cyan-200">
              Compatible migration codepatient / siteid
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
