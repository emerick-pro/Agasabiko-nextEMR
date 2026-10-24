import React, { useState, useEffect } from 'react';
import { Patient, AppointmentRecord, ProgramType } from '../../types/emr';
import { localDb } from '../../db/indexedDb';
import { PatientBanner } from '../common/PatientBanner';
import { ViewTab } from '../common/Sidebar';
import { 
  Calendar, 
  Plus, 
  ArrowLeft, 
  PhoneCall, 
  Home, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  Save,
  Users
} from 'lucide-react';

interface AppointmentsViewProps {
  patient: Patient;
  onNavigateAction: (view: ViewTab) => void;
  onBackToRecord: () => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  patient,
  onNavigateAction,
  onBackToRecord
}) => {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  
  // Tracing attempt form
  const [moyen, setMoyen] = useState<'Appel téléphonique' | 'Visite à domicile ASC' | 'SMS de rappel' | 'Médiateur pair'>('Appel téléphonique');
  const [issue, setIssue] = useState<'Contact établi' | 'Promesse de venue' | 'Téléphone injoignable' | 'Déplacé' | 'Perdu de vue' | 'Refus'>('Contact établi');
  const [dateContact, setDateContact] = useState('2026-10-22');
  const [prochainRdv, setProchainRdv] = useState('2026-10-29');
  const [observation, setObservation] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // New Appointment Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newDate, setNewDate] = useState('2026-11-19');
  const [newMotif, setNewMotif] = useState('Renouvellement traitement ARV semestriel');
  const [newProg, setNewProg] = useState<ProgramType>('VIH');

  const loadData = async () => {
    const list = await localDb.getAll<AppointmentRecord>('appointments');
    setAppointments(list);
  };

  useEffect(() => {
    loadData();
    const unsub = localDb.subscribe(loadData);
    return () => {
      unsub();
    };
  }, []);

  const handleRecordContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetApt = appointments.find(a => a.patientId === patient.id) || appointments[0];

    if (targetApt) {
      const updated: AppointmentRecord = {
        ...targetApt,
        statut: issue === 'Contact établi' || issue === 'Promesse de venue' ? 'Programmé' : 'Manqué',
        datePrevue: prochainRdv,
        actionsRelance: [
          ...targetApt.actionsRelance,
          {
            date: dateContact,
            moyen,
            issue,
            observation: observation || 'Échange avec le patient pour sécuriser la rétention.',
            prochaineDate: prochainRdv
          }
        ]
      };
      await localDb.put('appointments', updated, true, 'appointment', 'UPDATE');
    }

    const updatedPatient = {
      ...patient,
      prochainRdv: prochainRdv,
      updatedAt: new Date().toISOString()
    };
    await localDb.put('patients', updatedPatient, true, 'patient', 'UPDATE');

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const newApt: AppointmentRecord = {
      id: 'apt-' + Date.now(),
      patientId: patient.id,
      codeSite: patient.codeSite,
      nomPatient: `${patient.nom} ${patient.prenom}`,
      programme: newProg,
      motif: newMotif,
      datePrevue: newDate,
      statut: 'Programmé',
      actionsRelance: []
    };

    await localDb.put('appointments', newApt, true, 'appointment', 'INSERT');
    setIsNewModalOpen(false);
  };

  const upcomingApts = [
    { title: 'Consultation programmée', date: '22 oct. · Aujourd\'hui · suivi clinique', icon: Clock },
    { title: 'Contrôle TB / MNT', date: '29 oct. · Échéance à confirmer', icon: Calendar },
    { title: 'Consultation prénatale (CPN)', date: '04 nov. · Suivi de grossesse', icon: Users },
    { title: 'Renouvellement de traitement', date: '19 nov. · Pharmacie / suivi VIH', icon: Clock }
  ];

  return (
    <div className="space-y-6">
      
      {/* Patient Banner */}
      <PatientBanner
        patient={patient}
        currentAction="appointments"
        onNavigateAction={onNavigateAction}
        onBackToRegistry={onBackToRecord}
      />

      {/* Header matching Screen 13 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">
            Continuité des soins · Rétention
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Rendez-vous et recherche active
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Rappels et tracing utilisables pour VIH, vaccination, TB, maternité et MNT.
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

      {/* Main Grid: RDV à venir & Campagnes on Left vs Enregistrer contact on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: RDV et activités à venir (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Rendez-vous et activités à venir</h3>
                <p className="text-[11px] text-slate-400">Les délais sont calculés par le moteur de parcours</p>
              </div>
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nouveau RDV</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {upcomingApts.map((apt) => {
                const Icon = apt.icon;
                return (
                  <div key={apt.title} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-cyan-700 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{apt.title}</div>
                        <div className="text-[11px] text-slate-500">{apt.date}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigateAction('consultation')}
                      className="px-3 py-1 bg-white hover:bg-cyan-50 border border-slate-200 text-slate-700 hover:text-cyan-800 rounded-lg font-semibold text-xs transition cursor-pointer"
                    >
                      Ouvrir
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Campagnes et recherche active matching Screen 13 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Campagnes et recherche active</h3>
            <p className="text-[11px] text-slate-400 mb-4">Relance communautaire des perdus de vue avec les ASC</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="text-xs font-bold text-purple-900">VIH / TARV</div>
                <div className="text-lg font-black text-purple-700 mt-1">2 à relancer</div>
                <div className="text-[10px] text-purple-600">Rupture de prise d'ARV</div>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                <div className="text-xs font-bold text-teal-900">Vaccination PEV</div>
                <div className="text-lg font-black text-teal-700 mt-1">3 à relancer</div>
                <div className="text-[10px] text-teal-600">Nourrissons 9 mois RR1</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs font-bold text-slate-900">MNT / Autres</div>
                <div className="text-lg font-black text-slate-700 mt-1">1 à relancer</div>
                <div className="text-[10px] text-slate-500">Contrôle HTA / TB</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Enregistrer une tentative de contact matching Screen 13 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-sm font-bold text-slate-900">Enregistrer une tentative de contact</h3>
            <p className="text-[11px] text-slate-400">Tracing actif & médiation</p>
          </div>

          <form onSubmit={handleRecordContact} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Moyen de contact</label>
              <select
                value={moyen}
                onChange={(e) => setMoyen(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:border-cyan-500 focus:outline-hidden"
              >
                <option value="Appel téléphonique">Appel téléphonique</option>
                <option value="Visite à domicile ASC">Visite à domicile ASC (Agent de Santé Communautaire)</option>
                <option value="SMS de rappel">SMS de rappel automatique</option>
                <option value="Médiateur pair">Médiateur pair / Relais VIH</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Issue</label>
              <select
                value={issue}
                onChange={(e) => setIssue(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:border-cyan-500 focus:outline-hidden"
              >
                <option value="Contact établi">Contact établi</option>
                <option value="Promesse de venue">Promesse de venue confirmée</option>
                <option value="Téléphone injoignable">Téléphone injoignable / éteint</option>
                <option value="Déplacé">Déplacé temporairement</option>
                <option value="Perdu de vue">Perdu de vue (recherche approfondie)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Date</label>
                <input
                  type="date"
                  value={dateContact}
                  onChange={(e) => setDateContact(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Prochain rendez-vous</label>
                <input
                  type="date"
                  value={prochainRdv}
                  onChange={(e) => setProchainRdv(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-cyan-800 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Observation</label>
              <textarea
                rows={3}
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Informations de suivi / médiateur..."
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer le contact</span>
            </button>

            {isSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Tentative de contact consignée avec succès dans l'historique !</span>
              </div>
            )}
          </form>
        </div>

      </div>

      {/* New Appointment Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Programmer un nouveau rendez-vous</h3>
            
            <form onSubmit={handleCreateAppointment} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Programme</label>
                <select
                  value={newProg}
                  onChange={(e) => setNewProg(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                >
                  <option value="VIH">VIH / TARV</option>
                  <option value="Vaccination">Vaccination PEV</option>
                  <option value="Maternité">Maternité / CPN</option>
                  <option value="TB">Tuberculose (TB)</option>
                  <option value="MNT">MNT (HTA / Diabète)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Date prévue</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motif</label>
                <input
                  type="text"
                  value={newMotif}
                  onChange={(e) => setNewMotif(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-700 text-white font-bold rounded-xl"
                >
                  Enregistrer RDV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
