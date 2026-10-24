import React, { useState } from 'react';
import { Patient, ProgramType } from '../../types/emr';
import { 
  Plus, 
  Search, 
  Info, 
  ArrowRight, 
  Users, 
  ShieldAlert, 
  Filter,
  CheckCircle2
} from 'lucide-react';

interface PatientRegistryViewProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onNavigateToAdmission: () => void;
}

export const PatientRegistryView: React.FC<PatientRegistryViewProps> = ({
  patients,
  onSelectPatient,
  onNavigateToAdmission
}) => {
  const [selectedProgram, setSelectedProgram] = useState<string>('Tous');
  const [filterQuery, setFilterQuery] = useState('');

  const programs: Array<string> = ['Tous', 'VIH', 'Vaccination', 'SMI', 'Paludisme', 'MNT', 'TB', 'Maternité'];

  const filteredPatients = patients.filter(patient => {
    // Program match
    if (selectedProgram !== 'Tous') {
      if (!patient.programmes.includes(selectedProgram as ProgramType)) {
        return false;
      }
    }
    // Search query match
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      const match = 
        patient.nom.toLowerCase().includes(q) ||
        patient.prenom.toLowerCase().includes(q) ||
        patient.codeSite.toLowerCase().includes(q) ||
        patient.uidNational.toLowerCase().includes(q) ||
        patient.adresse.commune.toLowerCase().includes(q) ||
        patient.adresse.colline.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">
            Identité et Longitudinalité
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Registre unique des patients
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Une identité, des dossiers et des programmes multiples. Recherche par code, nom ou UID.
          </p>
        </div>

        <button
          onClick={onNavigateToAdmission}
          className="px-4 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Créer un dossier</span>
        </button>
      </div>

      {/* Program Filter Tabs matching Screen 03 */}
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        {programs.map((prg) => {
          const isActive = selectedProgram === prg;
          return (
            <button
              key={prg}
              onClick={() => setSelectedProgram(prg)}
              className={`px-3.5 py-1.5 rounded-xl border transition cursor-pointer ${
                isActive
                  ? 'bg-cyan-700 text-white border-cyan-700 shadow-2xs font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {prg}
            </button>
          );
        })}
      </div>

      {/* Info Callout from Screen 03 */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-sky-950">
        <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold text-sky-900">Prévention des doublons :</strong> La recherche vérifie les correspondances avant de créer un dossier afin de prévenir les doublons. L'UID peut être provisoire lorsqu'un site est hors connexion et sera consolidé lors du prochain contact réseau central.
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filtrer par nom, prénom, code PT, UID ou colline..."
          className="w-full pl-10 pr-4 py-2 bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-hidden transition"
        />
      </div>

      {/* Patient Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            <strong className="text-slate-800">{filteredPatients.length} patients</strong> affichés dans le registre
          </div>
          <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
            Identité transversale active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-3 px-5">Patient</th>
                <th className="py-3 px-4">Identifiant</th>
                <th className="py-3 px-4">Programmes</th>
                <th className="py-3 px-4">Rendez-vous</th>
                <th className="py-3 px-4 text-right">Accès</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Aucun patient correspondant au filtre.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const initial = patient.sexe === 'Féminin' ? 'F' : 'M';
                  const avatarColor = patient.sexe === 'Féminin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';

                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/70 transition">
                      
                      {/* Patient Details */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl ${avatarColor} font-black flex items-center justify-center shrink-0`}>
                            {initial}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {patient.nom} {patient.prenom}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {patient.age} {patient.ageUnit || 'ans'} · {patient.adresse.commune} / {patient.adresse.colline}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Identifiant */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-800">{patient.codeSite}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span>{patient.uidNational}</span>
                          {patient.isProvisionalUid && (
                            <span className="text-[9px] text-amber-800 bg-amber-50 px-1 rounded border border-amber-200">
                              Provisoire hors-ligne
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Programmes */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {patient.programmes.map((prg) => (
                            <span
                              key={prg}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                prg === 'VIH' ? 'bg-purple-100 text-purple-800' :
                                prg === 'SMI' ? 'bg-pink-100 text-pink-800' :
                                prg === 'Vaccination' ? 'bg-teal-100 text-teal-800' :
                                prg === 'Paludisme' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {prg}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Rendez-vous */}
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {patient.prochainRdv || 'Non défini'}
                      </td>

                      {/* Accès */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onSelectPatient(patient.id)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-cyan-600 hover:text-cyan-700 text-slate-700 font-semibold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Ouvrir le dossier</span>
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

    </div>
  );
};
