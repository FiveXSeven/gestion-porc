export interface User {
  email: string;
  pin: string;
  name: string;
}

export interface Truie {
  id: string;
  identification: string;
  dateEntree: string;
  dateNaissance: string;
  poids: number;
  statut: 'active' | 'gestante' | 'allaitante' | 'reformee' | 'vendue';
  notes: string;
}

export interface Verrat {
  id: string;
  identification: string;
  dateEntree: string;
  dateNaissance: string;
  poids: number;
  statut: 'actif' | 'reforme';
}

export interface Saillie {
  id: string;
  truieId: string;
  verratId: string;
  date: string;
  methode: 'naturelle' | 'insemination';
  employe: string;
  datePrevueMiseBas: string;
  statut: 'en_attente' | 'confirmee' | 'echouee';
}

export interface MiseBas {
  id: string;
  saillieId: string;
  truieId: string;
  date: string;
  nesVivants: number;
  mortNes: number;
  poidsMoyen: number;
  notes: string;
}

export interface Portee {
  id: string;
  miseBasId: string;
  truieId: string;
  nombreActuel: number;
  dateSevrage: string | null;
  poidsSevrage: number | null;
  statut: 'allaitement' | 'sevree' | 'transferee';
}

export interface Vente {
  id: string;
  date: string;
  typeAnimal: 'porcelet' | 'porc_engraissement' | 'truie_reforme' | 'verrat_reforme';
  quantite: number;
  poidsTotal: number;
  prixUnitaire: number;
  prixTotal: number;
  acheteur: string;
  notes: string;
}

export interface Depense {
  id: string;
  date: string;
  categorie: 'alimentation' | 'sante' | 'materiel' | 'main_oeuvre' | 'infrastructure' | 'autre';
  montant: number;
  description: string;
  fournisseur: string;
}

export interface Alert {
  id: string;
  type: 'mise_bas' | 'sevrage' | 'vente' | 'sante';
  message: string;
  date: string;
  read: boolean;
  relatedId?: string;
}

export interface LotEngraissement {
  id: string;
  identification: string;
  dateCreation: string;
  origine: 'sevrage' | 'achat';
  porteeId?: string;
  nombreInitial: number;
  nombreActuel: number;
  poidsEntree: number;
  dateEntree: string;
  poidsCible: number;
  statut: 'en_cours' | 'vendu' | 'partiel';
  notes: string;
}

export interface Pesee {
  id: string;
  lotId: string;
  date: string;
  poidsMoyen: number;
  nombrePeses: number;
  notes: string;
}
