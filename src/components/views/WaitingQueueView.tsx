import React, { useState } from 'react';
import { QueueContact, Patient, ProgramType, QueueStatus } from '../../types/emr';
import { localDb } from '../../db/indexedDb';
import { 
  Plus, 
  Info, 
  ArrowRight, 
  AlertCircle, 
  Clock, 
  UserPlus, 
  X,
  CheckCircle,
  Filter
} from 'lucide-react';

interface WaitingQueueViewProps {
  queue: QueueContact[];
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onNavigateToAdmission: () => void;
}

export const WaitingQueueView: React.FC<WaitingQueueViewProps> = ({
  queue,
  patients,
  onSelectPatient,
  onNavigateToAdmission
}) => {
  const [activeTab, setActiveTab] = useState<'Tous' | 'En attente' | 'En consultation' | 'À la pharmacie' | 'À prioriser'>('Tous');
  const [isArrivalModalOpen, setIsArrivalModalOpen] = useState(false);
  
  // Arrival form state
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [motifVisite, setMotifVisite] = useState('Suivi de routine et renouvellement');
  const [programme, setProgramme] = useState<ProgramType>('VIH');
  const [prioritaire, setPrioritaire] = useState(false);
  const [informationUtile, setInformationUtile] = useState('');

  const filteredContacts = queue.filter(contact => {
    if (activeTab === 'Tous') return true;
    if (activeTab === 'En attente') return contact.etapeActuelle === 'En attente';
    if (activeTab === 'En consultation') return contact.etapeActuelle === 'En consultation';
    if (activeTab === 'À la pharmacie') return contact.etapeActuelle === 'À la pharmacie';
    if (activeTab === 'À prioriser') return contact.prioritaire || contact.etapeActuelle === 'Vaccin dû';
    return true;
  });

  const handleRegisterArrival = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = patients.find(item => item.id === selectedPatientId);
    if (!p) return;

    const newContact: QueueContact = {
      id: 'qc-' + Date.now(),
      patientId: p.id,
      codeSite: p.codeSite,
      nomComplet: `${p.nom} ${p.prenom}`,
      heureArrivee: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      motifVisite,
      programme,
      etapeActuelle: 'En attente',
      prioritaire,
      informationUtile: informationUtile || 'Arrivée enregistrée en local',
      date: '2026-10-22'
    };

    await localDb.put('queue', newContact, true, 'contact', 'INSERT');
    setIsArrivalModalOpen(false);
  };

  const handleChangeStatus = async (contact: QueueContact, newStatus: QueueStatus) => {
    const updated = { ...contact, etapeActuelle: newStatus };
    await localDb.put('queue', updated, true, 'contact', 'UPDATE');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">
            Accueil · Flux Patient
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            File d'attente et contacts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Patient identifié → motif de visite → parcours de soins → acte → rendez-vous.
          </p>
        </div>

        <button
          onClick={() => setIsArrivalModalOpen(true)}
          className="px-4 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Enregistrer une arrivée</span>
        </button>
      </div>

      {/* Filter Tabs matching Screen 02 */}
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        {(['Tous', 'En attente', 'En consultation', 'À la pharmacie', 'À prioriser'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl border transition cursor-pointer ${
                isActive
                  ? 'bg-cyan-700 text-white border-cyan-700 shadow-2xs font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Triage Info Callout matching Screen 02 */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-sky-950">
        <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold text-sky-900">Pas de triage obligatoire :</strong> le personnel d'accueil choisit le motif de visite et oriente directement vers le service adapté. Les urgences restent identifiables et doivent suivre la procédure clinique locale.
        </div>
      </div>

      {/* Queue Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Contacts du 22 octobre · <strong className="text-slate-800">{filteredContacts.length} affichés</strong>
          </div>
          <span className="font-semibold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200 text-[11px]">
            Site de démonstration
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-3 px-5">Heure / Patient</th>
                <th className="py-3 px-4">Motif et programme</th>
                <th className="py-3 px-4">Étape actuelle</th>
                <th className="py-3 px-4">Information utile</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Aucun patient dans cette étape de la file.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => {
                  const patient = patients.find(p => p.id === contact.patientId);
                  const initial = patient?.sexe === 'Féminin' ? 'F' : 'M';
                  const avatarColor = patient?.sexe === 'Féminin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';

                  return (
                    <tr key={contact.id} className="hover:bg-slate-50/70 transition">
                      
                      {/* Heure / Patient */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl ${avatarColor} font-black flex items-center justify-center shrink-0`}>
                            {initial}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{contact.heureArrivee}</span>
                              <span className="text-slate-300">·</span>
                              <span>{patient ? `${patient.nom} ${patient.prenom}` : contact.nomComplet}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {contact.codeSite} {patient ? `· ${patient.age} ${patient.ageUnit || 'ans'}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Motif et programme */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{contact.motifVisite}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200">
                            {contact.programme}
                          </span>
                        </div>
                      </td>

                      {/* Étape actuelle */}
                      <td className="py-3.5 px-4">
                        <select
                          value={contact.etapeActuelle}
                          onChange={(e) => handleChangeStatus(contact, e.target.value as QueueStatus)}
                          className={`font-semibold text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                            contact.etapeActuelle === 'En attente' ? 'bg-slate-100 text-slate-800 border-slate-200' :
                            contact.etapeActuelle === 'En consultation' ? 'bg-cyan-100 text-cyan-900 border-cyan-200' :
                            contact.etapeActuelle === 'À la pharmacie' ? 'bg-purple-100 text-purple-900 border-purple-200' :
                            contact.etapeActuelle === 'Vaccin dû' ? 'bg-amber-100 text-amber-900 border-amber-200' :
                            'bg-emerald-100 text-emerald-900 border-emerald-200'
                          }`}
                        >
                          <option value="En attente">En attente</option>
                          <option value="En consultation">En consultation</option>
                          <option value="Au laboratoire">Au laboratoire</option>
                          <option value="À la pharmacie">À la pharmacie</option>
                          <option value="Vaccin dû">Vaccin dû</option>
                          <option value="Terminé">Terminé</option>
                        </select>
                      </td>

                      {/* Information utile */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="text-xs">{contact.informationUtile}</span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onSelectPatient(contact.patientId)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-cyan-600 hover:text-cyan-700 text-slate-700 font-semibold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Ouvrir</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Arrival Registration Modal */}
      {isArrivalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Enregistrer une arrivée</h3>
                <p className="text-xs text-slate-500">Ajout immédiat à la file d'attente du jour</p>
              </div>
              <button 
                onClick={() => setIsArrivalModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterArrival} className="p-6 space-y-4 text-xs">
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Patient dans le registre</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsArrivalModalOpen(false);
                      onNavigateToAdmission();
                    }}
                    className="text-cyan-700 hover:underline font-semibold flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Nouveau patient non enregistré</span>
                  </button>
                </div>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom} {p.prenom} ({p.codeSite} · {p.sexe} · {p.age} {p.ageUnit || 'ans'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Programme principal</label>
                  <select
                    value={programme}
                    onChange={(e) => setProgramme(e.target.value as ProgramType)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                  >
                    <option value="VIH">VIH / TARV</option>
                    <option value="Vaccination">Vaccination PEV</option>
                    <option value="SMI">Santé Mère-Enfant (SMI)</option>
                    <option value="Maternité">Maternité / CPN</option>
                    <option value="Paludisme">Paludisme</option>
                    <option value="TB">Tuberculose (TB)</option>
                    <option value="MNT">Maladies Non Transmissibles (MNT)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priorité clinique</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="prioCheck"
                      checked={prioritaire}
                      onChange={(e) => setPrioritaire(e.target.checked)}
                      className="rounded text-cyan-600 focus:ring-cyan-500 h-4 w-4"
                    />
                    <label htmlFor="prioCheck" className="text-slate-700 font-medium cursor-pointer">
                      Urgent / À prioriser (fièvre élevée, détresse)
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motif de visite</label>
                <input
                  type="text"
                  value={motifVisite}
                  onChange={(e) => setMotifVisite(e.target.value)}
                  placeholder="Ex: Suivi VIH semestriel, Toux chronique, CPN 3..."
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Information utile / Note d'accueil</label>
                <input
                  type="text"
                  value={informationUtile}
                  onChange={(e) => setInformationUtile(e.target.value)}
                  placeholder="Ex: Température 38.8°C relevée, renouvellement ordonnance..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsArrivalModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold cursor-pointer"
                >
                  Enregistrer l'arrivée
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
