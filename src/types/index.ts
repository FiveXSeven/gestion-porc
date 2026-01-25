export interface User {
  id?: string;
  email: string;
  pin?: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Truie {
  id: string;
  identification: string;
  race: 'large_white' | 'landrace' | 'pietrain' | 'duroc' | 'autre';
  dateEntree: string;
  dateNaissance: string;
  poids: number;
  statut: 'active' | 'gestante' | 'allaitante' | 'reformee' | 'vendue';
  notes: string;
}

export interface Verrat {
  id: string;
  identification: string;
  race: 'large_white' | 'landrace' | 'pietrain' | 'duroc' | 'autre';
  dateNaissance: string;
  dateEntree: string;
  poids: number;
  statut: 'actif' | 'reforme' | 'vendu';
  notes: string;
}

export interface Saillie {
  id: string;
  truieId: string;
  verratId?: string; // Optionnel - pour lier la saillie au verrat
  date: string;
  methode: 'naturelle' | 'insemination';
  employe: string;
  datePrevueMiseBas: string;
  dateRetourChaleur: string;
  statut: 'en_cours' | 'confirmee' | 'echouee';
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
  type: 'mise_bas' | 'sevrage' | 'vente' | 'sante' | 'post_sevrage_pret' | 'engraissement_pret' | 'retour_chaleur';
  message: string;
  date: string;
  read: boolean;
  relatedId?: string;
}

export interface LotEngraissement {
  id: string;
  identification: string;
  dateCreation: string;
  origine: 'sevrage' | 'achat' | 'post-sevrage';
  porteeId?: string;
  nombreInitial: number;
  nombreActuel: number;
  poidsEntree: number;
  dateEntree: string;
  poidsCible: number;
  statut: 'en_cours' | 'vendu' | 'partiel' | 'pret' | 'termine';
  notes: string;
}


export interface LotPostSevrage {
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
  statut: 'en_cours' | 'transfere' | 'vendu' | 'partiel' | 'pret' | 'termine';
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

export interface StockAliment {
  id: string;
  nom: string;
  type: string;
  quantite: number;
  poidsSac: 25 | 40 | number;
  dateMiseAJour: string;
}

export interface Mortalite {
  id: string;
  date: string;
  nombre: number;
  cause: 'maladie' | 'accident' | 'faiblesse' | 'autre';
  notes: string;
  lotEngraissementId?: string;
  lotPostSevrageId?: string;
}

export interface ConsommationAliment {
  id: string;
  date: string;
  quantiteSacs: number;
  stockAlimentId: string;
  lotEngraissementId?: string;
  lotPostSevrageId?: string;
  notes: string;
}

export interface Vaccination {
  id: string;
  date: string;
  nom: string;
  type: 'obligatoire' | 'preventif' | 'curatif';
  lotType: 'post-sevrage' | 'engraissement' | 'truie' | 'verrat';
  lotId?: string;
  truieId?: string;
  verratId?: string;
  dateRappel?: string;
  notes: string;
}

export interface Traitement {
  id: string;
  date: string;
  nom: string;
  medicament: string;
  dureeJours: number;
  lotType: 'post-sevrage' | 'engraissement' | 'truie' | 'verrat';
  lotId?: string;
  truieId?: string;
  verratId?: string;
  notes: string;
}

// Traçabilité
export interface Mouvement {
  id: string;
  date: string;
  typeMouvement: 'entree' | 'sortie';
  typeAnimal: 'truie' | 'verrat' | 'porcelet' | 'porc_engraissement';
  motif: 'naissance' | 'achat' | 'vente' | 'mortalite' | 'reforme' | 'transfert';
  quantite: number;
  identification?: string;
  origine?: string;
  destination?: string;
  poids?: number;
  notes: string;
  createdAt?: string;
}
