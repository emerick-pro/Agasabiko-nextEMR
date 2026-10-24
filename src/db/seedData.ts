import { Patient, QueueContact, StockItem, LabTestOrder, AppointmentRecord, VaccineDoseRecord } from '../types/emr';

export const SEED_PATIENTS: Patient[] = [
  {
    id: 'pat-1048',
    codeSite: 'PT-1048',
    uidNational: 'UID-784-1048',
    isProvisionalUid: false,
    nom: 'NININAHAZWE',
    prenom: 'Aline',
    sexe: 'Féminin',
    dateNaissance: '1992-04-12',
    age: 34,
    ageUnit: 'ans',
    telephone: '+257 79 123 456',
    adresse: {
      province: 'Gitega',
      commune: 'Nyabihanga',
      colline: 'Nyabihanga',
      contactUrgence: '+257 71 890 123 (Époux)'
    },
    programmes: ['VIH', 'SMI'],
    derniereVisite: '2026-10-20',
    prochainRdv: '2026-11-18',
    parcoursActif: 'Consultation VIH',
    pointsAttention: [
      'Rendez-vous de renouvellement ARV à sécuriser',
      'Charge virale récente indétectable (< 50 copies/ml au 12/06/2026)',
      'Identifiant unique national validé dans le registre central'
    ],
    vihData: {
      statutTraitement: 'Sous TARV',
      schemaARV: 'TDF / 3TC / DTG',
      ligneTraitement: '1ère ligne',
      dateInitiationTARV: '2021-03-15',
      derniereChargeVirale: {
        valeur: 'Indétectable (< 50 cp/ml)',
        date: '2026-06-12',
        indetectable: true
      },
      observance: 'Bonne (>95%)',
      prophylaxieCotrimoxazole: true,
      statutTB: 'Dépistage négatif'
    },
    smiData: {
      statutGrossesse: 'Non concernée',
      cpnVisitesEffectuees: 4,
      ptmeEnrolee: false
    },
    updatedAt: '2026-10-22T08:30:00Z',
    syncStatus: 'synced'
  },
  {
    id: 'pat-2331',
    codeSite: 'PT-2331',
    uidNational: 'UID-784-2331',
    isProvisionalUid: false,
    nom: 'NDAYISHIMIYE',
    prenom: 'Jean-Baptiste',
    sexe: 'Masculin',
    dateNaissance: '1985-08-24',
    age: 41,
    ageUnit: 'ans',
    telephone: '+257 76 543 210',
    adresse: {
      province: 'Gitega',
      commune: 'Giheta',
      colline: 'Giheta',
      contactUrgence: '+257 79 333 444'
    },
    programmes: ['Paludisme'],
    derniereVisite: '2026-10-22',
    prochainRdv: '2026-10-29',
    parcoursActif: 'Consultation générale - Paludisme',
    pointsAttention: [
      'Fièvre 38.9°C au triage ce matin',
      'TDR Paludisme positif attendu à la consultation'
    ],
    updatedAt: '2026-10-22T08:45:00Z',
    syncStatus: 'synced'
  },
  {
    id: 'pat-3015',
    codeSite: 'PT-3015',
    uidNational: 'UID-784-3015',
    isProvisionalUid: false,
    nom: 'IRAKOZE',
    prenom: 'Chantal',
    sexe: 'Féminin',
    dateNaissance: '2000-01-19',
    age: 26,
    ageUnit: 'ans',
    telephone: '+257 71 998 877',
    adresse: {
      province: 'Gitega',
      commune: 'Gitega',
      colline: 'Magarama',
      contactUrgence: '+257 79 112 233 (Mère)'
    },
    programmes: ['Maternité', 'SMI'],
    derniereVisite: '2026-10-07',
    prochainRdv: '2026-11-04',
    parcoursActif: 'Suivi prénatal / CPN 3',
    pointsAttention: [
      'Grossesse 28 SA - CPN 3 à réaliser',
      'Bilan biologique et échographie obstétricale à vérifier'
    ],
    smiData: {
      statutGrossesse: 'Enceinte',
      gestite: 2,
      parite: 1,
      dpa: '2026-12-28',
      cpnVisitesEffectuees: 2,
      ptmeEnrolee: true
    },
    updatedAt: '2026-10-22T09:00:00Z',
    syncStatus: 'synced'
  },
  {
    id: 'pat-4086',
    codeSite: 'PT-4086',
    uidNational: 'PROV-4086-GTE',
    isProvisionalUid: true,
    nom: 'MUGISHA',
    prenom: 'David',
    sexe: 'Masculin',
    dateNaissance: '2026-01-15',
    age: 9,
    ageUnit: 'mois',
    telephone: '+257 79 445 566 (Mère: N. Espérance)',
    adresse: {
      province: 'Gitega',
      commune: 'Nyabihanga',
      colline: 'Rutegama'
    },
    programmes: ['Vaccination', 'SMI'],
    derniereVisite: '2026-07-28',
    prochainRdv: '2026-10-22',
    parcoursActif: 'Vaccination PEV - 9 mois',
    pointsAttention: [
      'Dose Rougeole-Rubéole 1 (RR1) échue à 9 mois',
      'UID provisoire généré hors connexion - à rapprocher au prochain sync national'
    ],
    updatedAt: '2026-10-22T09:15:00Z',
    syncStatus: 'synced'
  },
  {
    id: 'pat-5102',
    codeSite: 'PT-5102',
    uidNational: 'UID-784-5102',
    isProvisionalUid: false,
    nom: 'BUKURU',
    prenom: 'Emmanuel',
    sexe: 'Masculin',
    dateNaissance: '1972-11-03',
    age: 53,
    ageUnit: 'ans',
    telephone: '+257 72 001 122',
    adresse: {
      province: 'Gitega',
      commune: 'Giheta',
      colline: 'Mubuga'
    },
    programmes: ['MNT', 'TB'],
    derniereVisite: '2026-09-30',
    prochainRdv: '2026-10-29',
    parcoursActif: 'Suivi HTA & Continuation TB',
    pointsAttention: [
      'Contrôle tension artérielle requis à chaque passage',
      'Phase de continuation traitement TB (RH 4 mois)'
    ],
    updatedAt: '2026-10-22T09:30:00Z',
    syncStatus: 'synced'
  }
];

export const SEED_QUEUE: QueueContact[] = [
  {
    id: 'qc-1',
    patientId: 'pat-1048',
    codeSite: 'PT-1048',
    nomComplet: 'Aline NININAHAZWE (Patient A-1048)',
    heureArrivee: '08:30',
    motifVisite: 'Suivi VIH et renouvellement ARV',
    programme: 'VIH',
    etapeActuelle: 'En attente',
    prioritaire: false,
    informationUtile: 'Rendez-vous en retard de 7 jours · Dossier complet',
    date: '2026-10-22'
  },
  {
    id: 'qc-2',
    patientId: 'pat-2331',
    codeSite: 'PT-2331',
    nomComplet: 'Jean-Baptiste NDAYISHIMIYE (Patient B-2331)',
    heureArrivee: '08:45',
    motifVisite: 'Fièvre, céphalées et frissons',
    programme: 'Paludisme',
    etapeActuelle: 'En consultation',
    prioritaire: true,
    informationUtile: 'Fièvre 38.9°C / examen TDR attendu',
    date: '2026-10-22'
  },
  {
    id: 'qc-3',
    patientId: 'pat-3015',
    codeSite: 'PT-3015',
    nomComplet: 'Chantal IRAKOZE (Patient C-3015)',
    heureArrivee: '09:00',
    motifVisite: 'Consultation prénatale (CPN 3)',
    programme: 'Maternité',
    etapeActuelle: 'En attente',
    prioritaire: false,
    informationUtile: 'CPN 3 à réaliser + test protéinurie bandelette',
    date: '2026-10-22'
  },
  {
    id: 'qc-4',
    patientId: 'pat-4086',
    codeSite: 'PT-4086',
    nomComplet: 'David MUGISHA (Enfant D-4086)',
    heureArrivee: '09:15',
    motifVisite: 'Vaccination de routine (9 mois)',
    programme: 'Vaccination',
    etapeActuelle: 'Vaccin dû',
    prioritaire: false,
    informationUtile: 'Dose RR1 (Rougeole 1) + Vitamine A à administrer',
    date: '2026-10-22'
  },
  {
    id: 'qc-5',
    patientId: 'pat-5102',
    codeSite: 'PT-5102',
    nomComplet: 'Emmanuel BUKURU (Patient E-5102)',
    heureArrivee: '09:30',
    motifVisite: 'Hypertension et suivi TB',
    programme: 'MNT',
    etapeActuelle: 'À la pharmacie',
    prioritaire: false,
    informationUtile: 'Contrôle tension artérielle 138/85 · Délivrance RH',
    date: '2026-10-22'
  }
];

export const SEED_LAB_TESTS: LabTestOrder[] = [
  {
    id: 'lab-1',
    patientId: 'pat-1048',
    codeSite: 'PT-1048',
    nomPatient: 'Patient A-1048',
    nomExamen: 'Charge virale VIH (ARN)',
    codeEchantillon: 'S-2026-0091',
    dateDemande: '2026-06-12',
    priorite: 'Routine',
    indication: 'Bilan semestriel sous TARV (1ère ligne)',
    statut: 'Validé',
    resultat: 'Indétectable (< 50 copies/ml)',
    valeurNormale: '< 50 copies/ml',
    dateResultat: '2026-06-16',
    ibipimoStatut: 'Synchronisé IBIPIMO'
  },
  {
    id: 'lab-2',
    patientId: 'pat-1048',
    codeSite: 'PT-1048',
    nomPatient: 'Patient A-1048',
    nomExamen: 'Glycémie à jeun',
    codeEchantillon: 'S-2026-0132',
    dateDemande: '2026-08-10',
    priorite: 'Routine',
    indication: 'Bilan métabolique sous Dolutegravir',
    statut: 'Validé',
    resultat: '88 mg/dL',
    valeurNormale: '70 - 110 mg/dL',
    dateResultat: '2026-08-10',
    ibipimoStatut: 'Synchronisé IBIPIMO'
  },
  {
    id: 'lab-3',
    patientId: 'pat-2331',
    codeSite: 'PT-2331',
    nomPatient: 'Patient B-2331',
    nomExamen: 'NFS (Numération Formule Sanguine)',
    codeEchantillon: 'S-2026-0144',
    dateDemande: '2026-10-22',
    priorite: 'Urgent',
    indication: 'Suspicion anémie sévère sur syndrome fébrile',
    statut: 'En traitement',
    valeurNormale: 'Hb: 13-17 g/dL',
    ibipimoStatut: 'En attente serveur central'
  },
  {
    id: 'lab-4',
    patientId: 'pat-2331',
    codeSite: 'PT-2331',
    nomPatient: 'Patient B-2331',
    nomExamen: 'Test de diagnostic rapide paludisme (TDR)',
    codeEchantillon: 'S-2026-0150',
    dateDemande: '2026-10-22',
    priorite: 'Urgent',
    indication: 'Fièvre aiguë 38.9°C, frissons, céphalées',
    statut: 'Prescrit',
    valeurNormale: 'Négatif',
    ibipimoStatut: 'En attente serveur central'
  }
];

export const SEED_STOCKS: StockItem[] = [
  {
    id: 'stk-1',
    nomProduit: 'TDF / 3TC / DTG 300/300/50mg',
    codeProduit: 'MED-ARV-01',
    programme: 'VIH',
    numeroLot: 'LOT-ARV-011',
    dateExpiration: '2027-05-31',
    quantiteDisponible: 890,
    unite: 'boîtes (30 cp)',
    seuilAlerte: 150,
    statut: 'Disponible'
  },
  {
    id: 'stk-2',
    nomProduit: 'Cotrimoxazole 960mg (Bactrim)',
    codeProduit: 'MED-IO-02',
    programme: 'VIH',
    numeroLot: 'LOT-CTX-042',
    dateExpiration: '2027-03-31',
    quantiteDisponible: 124,
    unite: 'boîtes (30 cp)',
    seuilAlerte: 100,
    statut: 'Surveiller'
  },
  {
    id: 'stk-3',
    nomProduit: 'Vaccin Pentavalent (DTC-HepB-Hib)',
    codeProduit: 'VAC-PEV-03',
    programme: 'Vaccination',
    numeroLot: 'LOT-VAC-002',
    dateExpiration: '2026-11-30',
    quantiteDisponible: 24,
    unite: 'flacons (10 doses)',
    seuilAlerte: 40,
    statut: 'Expiration proche'
  },
  {
    id: 'stk-4',
    nomProduit: 'Vaccin Rougeole-Rubéole (RR)',
    codeProduit: 'VAC-PEV-04',
    programme: 'Vaccination',
    numeroLot: 'LOT-VAC-005',
    dateExpiration: '2027-08-31',
    quantiteDisponible: 76,
    unite: 'doses',
    seuilAlerte: 30,
    statut: 'Disponible'
  },
  {
    id: 'stk-5',
    nomProduit: 'TDR Paludisme (Pf/Pan Ag)',
    codeProduit: 'LAB-TDR-05',
    programme: 'Paludisme',
    numeroLot: 'LOT-RDT-001',
    dateExpiration: '2026-12-31',
    quantiteDisponible: 18,
    unite: 'tests',
    seuilAlerte: 50,
    statut: 'Surveiller'
  },
  {
    id: 'stk-6',
    nomProduit: 'ACT Coartem pédiatrique (6x1)',
    codeProduit: 'MED-PAL-06',
    programme: 'Paludisme',
    numeroLot: 'LOT-ACT-009',
    dateExpiration: '2027-02-28',
    quantiteDisponible: 0,
    unite: 'plaquettes',
    seuilAlerte: 40,
    statut: 'Rupture'
  },
  {
    id: 'stk-7',
    nomProduit: 'Isoniazide 300mg (TPI - Prophylaxie TB)',
    codeProduit: 'MED-TB-07',
    programme: 'TB',
    numeroLot: 'LOT-INH-018',
    dateExpiration: '2027-09-30',
    quantiteDisponible: 340,
    unite: 'boîtes',
    seuilAlerte: 80,
    statut: 'Disponible'
  }
];

export const SEED_APPOINTMENTS: AppointmentRecord[] = [
  {
    id: 'apt-1',
    patientId: 'pat-1048',
    codeSite: 'PT-1048',
    nomPatient: 'Aline NININAHAZWE',
    programme: 'VIH',
    motif: 'Consultation programmée et renouvellement TARV',
    datePrevue: '2026-10-15',
    statut: 'En retard',
    actionsRelance: [
      {
        date: '2026-10-18',
        moyen: 'Appel téléphonique',
        issue: 'Contact établi',
        observation: 'La patiente a confirmé sa venue pour ce jeudi 22 octobre (voyage familial).',
        prochaineDate: '2026-10-22'
      }
    ]
  },
  {
    id: 'apt-2',
    patientId: 'pat-5102',
    codeSite: 'PT-5102',
    nomPatient: 'Emmanuel BUKURU',
    programme: 'TB',
    motif: 'Contrôle crachats fin 2ème mois TB & HTA',
    datePrevue: '2026-10-29',
    statut: 'Programmé',
    actionsRelance: []
  },
  {
    id: 'apt-3',
    patientId: 'pat-3015',
    codeSite: 'PT-3015',
    nomPatient: 'Chantal IRAKOZE',
    programme: 'Maternité',
    motif: 'Consultation prénatale CPN 3',
    datePrevue: '2026-11-04',
    statut: 'Programmé',
    actionsRelance: []
  },
  {
    id: 'apt-4',
    patientId: 'pat-4086',
    codeSite: 'PT-4086',
    nomPatient: 'David MUGISHA',
    programme: 'Vaccination',
    motif: 'Vaccin Rougeole-Rubéole 1 (9 mois)',
    datePrevue: '2026-10-20',
    statut: 'En retard',
    actionsRelance: [
      {
        date: '2026-10-21',
        moyen: 'Visite à domicile ASC',
        issue: 'Promesse de venue',
        observation: "L'ASC Colline Rutegama a sensibilisé la mère sur l'importance du vaccin contre la rougeole.",
        prochaineDate: '2026-10-22'
      }
    ]
  }
];

export const SEED_VACCINES_PATIENT_A: VaccineDoseRecord[] = [
  {
    id: 'v-1',
    patientId: 'pat-1048',
    antigene: 'BCG',
    doseIndex: 1,
    dateAdministration: '1992-04-14',
    numeroLot: 'HIST-BCG-92',
    dateExpirationLot: '1993-04-14',
    lieuAdministration: 'Maternité Nyabihanga',
    administrePar: 'Sage-femme',
    observation: 'Cicatrisation normale observée'
  },
  {
    id: 'v-2',
    patientId: 'pat-1048',
    antigene: 'VPO 0',
    doseIndex: 0,
    dateAdministration: '1992-04-14',
    numeroLot: 'HIST-VPO-92',
    dateExpirationLot: '1993-04-14',
    lieuAdministration: 'Maternité Nyabihanga',
    administrePar: 'Sage-femme'
  },
  {
    id: 'v-3',
    patientId: 'pat-1048',
    antigene: 'Penta 1',
    doseIndex: 1,
    dateAdministration: '1992-05-26',
    numeroLot: 'HIST-PEN-01',
    dateExpirationLot: '1993-05-26',
    lieuAdministration: 'CDS Nyabihanga',
    administrePar: 'Infirmier PEV'
  },
  {
    id: 'v-4',
    patientId: 'pat-1048',
    antigene: 'Penta 2',
    doseIndex: 2,
    dateAdministration: '1992-06-23',
    numeroLot: 'HIST-PEN-02',
    dateExpirationLot: '1993-06-23',
    lieuAdministration: 'CDS Nyabihanga',
    administrePar: 'Infirmier PEV'
  },
  {
    id: 'v-5',
    patientId: 'pat-1048',
    antigene: 'Penta 3',
    doseIndex: 3,
    dateAdministration: '1992-07-21',
    numeroLot: 'HIST-PEN-03',
    dateExpirationLot: '1993-07-21',
    lieuAdministration: 'CDS Nyabihanga',
    administrePar: 'Infirmier PEV'
  }
];

export const PEV_CALENDAR_STANDARDS = [
  { antigene: 'BCG', ageCible: 'Naissance', description: 'Tuberculose' },
  { antigene: 'VPO 0', ageCible: 'Naissance', description: 'Poliomyélite buccale' },
  { antigene: 'Penta 1', ageCible: '6 semaines', description: 'Diphtérie, Tétanos, Coqueluche, Hépatite B, Hib' },
  { antigene: 'VPO 1', ageCible: '6 semaines', description: 'Poliomyélite buccale' },
  { antigene: 'Pneumo 1', ageCible: '6 semaines', description: 'Infections à Pneumocoque' },
  { antigene: 'Rota 1', ageCible: '6 semaines', description: 'Diarrhées à Rotavirus' },
  { antigene: 'Penta 2', ageCible: '10 semaines', description: '2ème dose Pentavalent' },
  { antigene: 'VPO 2', ageCible: '10 semaines', description: 'Poliomyélite buccale' },
  { antigene: 'Pneumo 2', ageCible: '10 semaines', description: 'Infections à Pneumocoque' },
  { antigene: 'Rota 2', ageCible: '10 semaines', description: 'Diarrhées à Rotavirus' },
  { antigene: 'Penta 3', ageCible: '14 semaines', description: '3ème dose Pentavalent' },
  { antigene: 'VPO 3', ageCible: '14 semaines', description: 'Poliomyélite buccale' },
  { antigene: 'VPI', ageCible: '14 semaines', description: 'Poliomyélite injectable' },
  { antigene: 'Pneumo 3', ageCible: '14 semaines', description: 'Infections à Pneumocoque' },
  { antigene: 'Rougeole 1 (RR1)', ageCible: '9 mois', description: 'Rougeole - Rubéole 1ère dose' },
  { antigene: 'Fièvre Jaune', ageCible: '9 mois', description: 'Fièvre jaune amarile' },
  { antigene: 'Rougeole 2 (RR2)', ageCible: '18 mois', description: 'Rougeole - Rubéole rappel' }
];
