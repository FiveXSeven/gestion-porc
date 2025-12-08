import { User, Truie, Verrat, Saillie, MiseBas, Portee, Vente, Depense, Alert } from '@/types';

const STORAGE_KEYS = {
  USER: 'porcherie_user',
  TRUIES: 'porcherie_truies',
  VERRATS: 'porcherie_verrats',
  SAILLIES: 'porcherie_saillies',
  MISES_BAS: 'porcherie_mises_bas',
  PORTEES: 'porcherie_portees',
  VENTES: 'porcherie_ventes',
  DEPENSES: 'porcherie_depenses',
  ALERTS: 'porcherie_alerts',
  IS_AUTHENTICATED: 'porcherie_authenticated',
};

// User management
export const getUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const saveUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED) === 'true';
};

export const setAuthenticated = (value: boolean): void => {
  localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, String(value));
};

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
};

// Generic CRUD helpers
function getItems<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveItems<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

// Truies
export const getTruies = (): Truie[] => getItems<Truie>(STORAGE_KEYS.TRUIES);
export const saveTruies = (items: Truie[]): void => saveItems(STORAGE_KEYS.TRUIES, items);
export const addTruie = (item: Truie): void => {
  const items = getTruies();
  items.push(item);
  saveTruies(items);
};
export const updateTruie = (id: string, updates: Partial<Truie>): void => {
  const items = getTruies();
  const index = items.findIndex(i => i.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    saveTruies(items);
  }
};
export const deleteTruie = (id: string): void => {
  const items = getTruies().filter(i => i.id !== id);
  saveTruies(items);
};

// Verrats
export const getVerrats = (): Verrat[] => getItems<Verrat>(STORAGE_KEYS.VERRATS);
export const saveVerrats = (items: Verrat[]): void => saveItems(STORAGE_KEYS.VERRATS, items);
export const addVerrat = (item: Verrat): void => {
  const items = getVerrats();
  items.push(item);
  saveVerrats(items);
};

// Saillies
export const getSaillies = (): Saillie[] => getItems<Saillie>(STORAGE_KEYS.SAILLIES);
export const saveSaillies = (items: Saillie[]): void => saveItems(STORAGE_KEYS.SAILLIES, items);
export const addSaillie = (item: Saillie): void => {
  const items = getSaillies();
  items.push(item);
  saveSaillies(items);
};
export const updateSaillie = (id: string, updates: Partial<Saillie>): void => {
  const items = getSaillies();
  const index = items.findIndex(i => i.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    saveSaillies(items);
  }
};

// Mises bas
export const getMisesBas = (): MiseBas[] => getItems<MiseBas>(STORAGE_KEYS.MISES_BAS);
export const saveMisesBas = (items: MiseBas[]): void => saveItems(STORAGE_KEYS.MISES_BAS, items);
export const addMiseBas = (item: MiseBas): void => {
  const items = getMisesBas();
  items.push(item);
  saveMisesBas(items);
};

// Portées
export const getPortees = (): Portee[] => getItems<Portee>(STORAGE_KEYS.PORTEES);
export const savePortees = (items: Portee[]): void => saveItems(STORAGE_KEYS.PORTEES, items);
export const addPortee = (item: Portee): void => {
  const items = getPortees();
  items.push(item);
  savePortees(items);
};
export const updatePortee = (id: string, updates: Partial<Portee>): void => {
  const items = getPortees();
  const index = items.findIndex(i => i.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    savePortees(items);
  }
};

// Ventes
export const getVentes = (): Vente[] => getItems<Vente>(STORAGE_KEYS.VENTES);
export const saveVentes = (items: Vente[]): void => saveItems(STORAGE_KEYS.VENTES, items);
export const addVente = (item: Vente): void => {
  const items = getVentes();
  items.push(item);
  saveVentes(items);
};

// Dépenses
export const getDepenses = (): Depense[] => getItems<Depense>(STORAGE_KEYS.DEPENSES);
export const saveDepenses = (items: Depense[]): void => saveItems(STORAGE_KEYS.DEPENSES, items);
export const addDepense = (item: Depense): void => {
  const items = getDepenses();
  items.push(item);
  saveDepenses(items);
};

// Alerts
export const getAlerts = (): Alert[] => getItems<Alert>(STORAGE_KEYS.ALERTS);
export const saveAlerts = (items: Alert[]): void => saveItems(STORAGE_KEYS.ALERTS, items);
export const addAlert = (item: Alert): void => {
  const items = getAlerts();
  items.push(item);
  saveAlerts(items);
};
export const markAlertRead = (id: string): void => {
  const items = getAlerts();
  const index = items.findIndex(i => i.id === id);
  if (index !== -1) {
    items[index].read = true;
    saveAlerts(items);
  }
};

// Initialize demo data
export const initializeDemoData = (): void => {
  if (getTruies().length === 0) {
    const demoTruies: Truie[] = [
      { id: '1', identification: 'TR-001', dateEntree: '2024-01-15', dateNaissance: '2022-06-10', poids: 180, statut: 'gestante', notes: 'Bonne reproductrice' },
      { id: '2', identification: 'TR-002', dateEntree: '2024-02-20', dateNaissance: '2022-08-15', poids: 175, statut: 'active', notes: '' },
      { id: '3', identification: 'TR-003', dateEntree: '2023-11-10', dateNaissance: '2021-12-05', poids: 190, statut: 'allaitante', notes: 'Portée de 12' },
      { id: '4', identification: 'TR-004', dateEntree: '2024-03-01', dateNaissance: '2023-01-20', poids: 165, statut: 'active', notes: 'Première saillie prévue' },
      { id: '5', identification: 'TR-005', dateEntree: '2023-08-15', dateNaissance: '2021-04-10', poids: 195, statut: 'gestante', notes: '3ème gestation' },
    ];
    saveTruies(demoTruies);
  }

  if (getVerrats().length === 0) {
    const demoVerrats: Verrat[] = [
      { id: '1', identification: 'VR-001', dateEntree: '2023-06-01', dateNaissance: '2022-01-15', poids: 250, statut: 'actif' },
      { id: '2', identification: 'VR-002', dateEntree: '2024-01-10', dateNaissance: '2022-09-20', poids: 230, statut: 'actif' },
    ];
    saveVerrats(demoVerrats);
  }

  if (getSaillies().length === 0) {
    const demoSaillies: Saillie[] = [
      { id: '1', truieId: '1', verratId: '1', date: '2024-10-15', methode: 'naturelle', employe: 'Jean Dupont', datePrevueMiseBas: '2025-02-05', statut: 'confirmee' },
      { id: '2', truieId: '5', verratId: '2', date: '2024-11-01', methode: 'insemination', employe: 'Marie Martin', datePrevueMiseBas: '2025-02-22', statut: 'confirmee' },
      { id: '3', truieId: '3', verratId: '1', date: '2024-08-20', methode: 'naturelle', employe: 'Jean Dupont', datePrevueMiseBas: '2024-12-10', statut: 'confirmee' },
    ];
    saveSaillies(demoSaillies);
  }

  if (getMisesBas().length === 0) {
    const demoMisesBas: MiseBas[] = [
      { id: '1', saillieId: '3', truieId: '3', date: '2024-12-08', nesVivants: 12, mortNes: 1, poidsMoyen: 1.4, notes: 'Mise bas normale' },
    ];
    saveMisesBas(demoMisesBas);
  }

  if (getPortees().length === 0) {
    const demoPortees: Portee[] = [
      { id: '1', miseBasId: '1', truieId: '3', nombreActuel: 12, dateSevrage: null, poidsSevrage: null, statut: 'allaitement' },
    ];
    savePortees(demoPortees);
  }

  if (getVentes().length === 0) {
    const demoVentes: Vente[] = [
      { id: '1', date: '2024-11-15', typeAnimal: 'porc_engraissement', quantite: 10, poidsTotal: 1150, prixUnitaire: 180, prixTotal: 1800, acheteur: 'Boucherie du Centre', notes: '' },
      { id: '2', date: '2024-11-28', typeAnimal: 'porcelet', quantite: 15, poidsTotal: 375, prixUnitaire: 45, prixTotal: 675, acheteur: 'Ferme Voisine', notes: 'Sevrés à 28 jours' },
      { id: '3', date: '2024-12-01', typeAnimal: 'porc_engraissement', quantite: 8, poidsTotal: 920, prixUnitaire: 175, prixTotal: 1400, acheteur: 'Marché Local', notes: '' },
    ];
    saveVentes(demoVentes);
  }

  if (getDepenses().length === 0) {
    const demoDepenses: Depense[] = [
      { id: '1', date: '2024-12-01', categorie: 'alimentation', montant: 850, description: 'Aliment complet porcs', fournisseur: 'Agralis' },
      { id: '2', date: '2024-11-25', categorie: 'sante', montant: 320, description: 'Vaccins et vermifuges', fournisseur: 'VetoPharma' },
      { id: '3', date: '2024-11-20', categorie: 'materiel', montant: 450, description: 'Abreuvoirs automatiques', fournisseur: 'AgriEquip' },
      { id: '4', date: '2024-12-05', categorie: 'alimentation', montant: 920, description: 'Aliment truies gestantes', fournisseur: 'Agralis' },
      { id: '5', date: '2024-11-15', categorie: 'main_oeuvre', montant: 1200, description: 'Salaire ouvrier novembre', fournisseur: '' },
    ];
    saveDepenses(demoDepenses);
  }

  if (getAlerts().length === 0) {
    const demoAlerts: Alert[] = [
      { id: '1', type: 'mise_bas', message: 'Mise bas prévue pour TR-001 dans 58 jours', date: '2024-12-08', read: false, relatedId: '1' },
      { id: '2', type: 'mise_bas', message: 'Mise bas prévue pour TR-005 dans 75 jours', date: '2024-12-08', read: false, relatedId: '5' },
      { id: '3', type: 'sevrage', message: 'Portée de TR-003 à sevrer dans 20 jours', date: '2024-12-08', read: false, relatedId: '3' },
    ];
    saveAlerts(demoAlerts);
  }
};
