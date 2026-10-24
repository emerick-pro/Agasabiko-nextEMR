/**
 * AMAGARAInfo / SIDAInfo Next - Data Models & Types
 * Conforme au système de santé du Burundi (Province de Gitega)
 */

export type ProgramType = 
  | 'VIH' 
  | 'Vaccination' 
  | 'SMI' 
  | 'Paludisme' 
  | 'MNT' 
  | 'TB' 
  | 'Maternité';

export type QueueStatus = 'En attente' | 'En consultation' | 'À la pharmacie' | 'Au laboratoire' | 'Vaccin dû' | 'Terminé';

export type Gender = 'Féminin' | 'Masculin';

export interface Patient {
  id: string; // Internal unique ID
  codeSite: string; // e.g. PT-1048
  uidNational: string; // e.g. UID-784-1048 or PROV-xxxx
  isProvisionalUid: boolean;
  nom: string;
  prenom: string;
  sexe: Gender;
  dateNaissance: string;
  age: number;
  ageUnit?: 'ans' | 'mois';
  telephone?: string;
  adresse: {
    province: string; // e.g. Gitega
    commune: string;  // e.g. Nyabihanga, Gitega, Giheta
    colline: string;  // e.g. Nyabihanga, Rutegama
    contactUrgence?: string;
  };
  programmes: ProgramType[];
  derniereVisite: string;
  prochainRdv: string;
  parcoursActif: string; // e.g. "Consultation VIH", "Suivi prénatal", "Vaccination"
  pointsAttention?: string[];
  // VIH specific profile (SIDAInfo)
  vihData?: {
    statutTraitement: 'Sous TARV' | 'Arrêt' | 'Perdu de vue' | 'Non initié';
    schemaARV: string; // e.g. "TDF / 3TC / DTG"
    ligneTraitement: '1ère ligne' | '2ème ligne' | '3ème ligne';
    dateInitiationTARV: string;
    derniereChargeVirale: {
      valeur: string; // "Indétectable (< 50 copies/ml)" or numeric
      date: string;
      indetectable: boolean;
    };
    observance: 'Bonne (>95%)' | 'Moyenne (80-95%)' | 'Faible (<80%)';
    prophylaxieCotrimoxazole: boolean;
    statutTB: 'Dépistage négatif' | 'Sous TPI (Isoniazide)' | 'TB active confirmée';
  };
  // Maternal / Child specific
  smiData?: {
    statutGrossesse?: 'Enceinte' | 'Post-partum' | 'Non concernée';
    gestite?: number;
    parite?: number;
    dpa?: string; // Date prévue accouchement
    cpnVisitesEffectuees?: number;
    ptmeEnrolee?: boolean;
    enfantExposeVih?: boolean;
  };
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface QueueContact {
  id: string;
  patientId: string;
  codeSite: string;
  nomComplet: string;
  heureArrivee: string;
  motifVisite: string;
  programme: ProgramType;
  etapeActuelle: QueueStatus;
  prioritaire: boolean;
  informationUtile: string;
  date: string;
}

export interface ClinicalVitals {
  poidsKg?: number;
  tailleCm?: number;
  temperatureC?: number;
  taSystolique?: number;
  taDiastolique?: number;
  frequenceCardiaque?: number;
  frequenceRespiratoire?: number;
  imc?: number;
}

export interface ConsultationDraft {
  patientId: string;
  date: string;
  vitals: ClinicalVitals;
  motif: string;
  histoireMaladie: string;
  diagnosticPrincipal: string;
  diagnosticsAssocies: string[];
  stadeOmsVih?: 'Stade I' | 'Stade II' | 'Stade III' | 'Stade IV';
  prescriptions: Array<{
    medicament: string;
    posologie: string;
    quantite: number;
    dureeJours: number;
  }>;
  examensDemandes: string[];
  conseilsEtPlan: string;
  prochainRdvDate: string;
  derniereSauvegarde: string;
}

export interface LabTestOrder {
  id: string;
  patientId: string;
  codeSite: string;
  nomPatient: string;
  nomExamen: string;
  codeEchantillon: string; // e.g. S-2026-0091
  dateDemande: string;
  priorite: 'Routine' | 'Urgent';
  indication: string;
  statut: 'Prescrit' | 'Prélevé' | 'En traitement' | 'Validé';
  resultat?: string;
  valeurNormale?: string;
  dateResultat?: string;
  ibipimoStatut: 'Non transmis' | 'Synchronisé IBIPIMO' | 'En attente serveur central';
}

export interface DispensationRecord {
  id: string;
  patientId: string;
  codeSite: string;
  nomPatient: string;
  medicament: string;
  lotNumero: string;
  quantiteDelivree: number;
  dureeJours: number;
  dateDelivrance: string;
  rendezVousRenouvellement: string;
  observation?: string;
  dispensePar: string;
}

export interface VaccineDoseRecord {
  id: string;
  patientId: string;
  antigene: string; // BCG, Penta 1, Rougeole 1, etc.
  doseIndex: number;
  dateAdministration: string;
  numeroLot: string;
  dateExpirationLot: string;
  lieuAdministration: string;
  administrePar: string;
  observation?: string;
}

export interface AppointmentRecord {
  id: string;
  patientId: string;
  codeSite: string;
  nomPatient: string;
  programme: ProgramType;
  motif: string;
  datePrevue: string;
  statut: 'Programmé' | 'Honoré' | 'En retard' | 'Manqué' | 'Annulé';
  actionsRelance: Array<{
    date: string;
    moyen: 'Appel téléphonique' | 'Visite à domicile ASC' | 'SMS de rappel' | 'Médiateur pair';
    issue: 'Contact établi' | 'Promesse de venue' | 'Téléphone injoignable' | 'Déplacé' | 'Perdu de vue' | 'Refus';
    observation: string;
    prochaineDate?: string;
  }>;
}

export interface StockItem {
  id: string;
  nomProduit: string;
  codeProduit: string;
  programme: ProgramType;
  numeroLot: string;
  dateExpiration: string;
  quantiteDisponible: number;
  unite: string; // comprimés, doses, tests, kits
  seuilAlerte: number;
  statut: 'Disponible' | 'Surveiller' | 'Expiration proche' | 'Rupture';
}

export interface SyncDelta {
  id: string;
  timestamp: number;
  isoDate: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  entityType: 'patient' | 'contact' | 'consultation' | 'lab' | 'dispensation' | 'vaccine' | 'appointment' | 'stock';
  entityId: string;
  payload: Record<string, unknown>;
  author: string;
  facilityId: string;
  synced: boolean;
  compressedSizeEstimate: number; // in bytes
}

export type BandwidthProfile = 'fiber' | '3g' | '2g_edge' | 'sms_ussd' | 'offline';

export interface SyncStats {
  pendingCount: number;
  totalSyncedCount: number;
  lastSyncTime: string | null;
  currentProfile: BandwidthProfile;
  rawBytesPending: number;
  compressedBytesPending: number;
  compressionRatioPercent: number;
  isSyncing: boolean;
  networkLatencyMs: number;
  packetLossRate: number;
}
