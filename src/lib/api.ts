import { User, Truie, Saillie, MiseBas, Portee, Vente, Depense, Alert, LotEngraissement, LotPostSevrage, Pesee, StockAliment, Mortalite, ConsommationAliment, Vaccination, Traitement } from '@/types';

const API_URL = 'http://localhost:3000/api';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

// Truies
export const getTruies = () => fetchJson<Truie[]>('/truies');
export const addTruie = (item: Truie) => fetchJson<Truie>('/truies', { method: 'POST', body: JSON.stringify(item) });
export const updateTruie = (id: string, updates: Partial<Truie>) => fetchJson<Truie>(`/truies/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteTruie = (id: string) => fetchJson<void>(`/truies/${id}`, { method: 'DELETE' });



// Saillies
export const getSaillies = () => fetchJson<Saillie[]>('/saillies');
export const addSaillie = (item: Saillie) => fetchJson<Saillie>('/saillies', { method: 'POST', body: JSON.stringify(item) });
export const updateSaillie = (id: string, updates: Partial<Saillie>) => fetchJson<Saillie>(`/saillies/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteSaillie = (id: string) => fetchJson<void>(`/saillies/${id}`, { method: 'DELETE' });
export const confirmSaillie = (id: string) => fetchJson<Saillie>(`/saillies/${id}/confirm`, { method: 'POST' });
export const failSaillie = (id: string) => fetchJson<Saillie>(`/saillies/${id}/fail`, { method: 'POST' });

// Mises bas
export const getMisesBas = () => fetchJson<MiseBas[]>('/mises-bas');
export const addMiseBas = (item: MiseBas) => fetchJson<MiseBas>('/mises-bas', { method: 'POST', body: JSON.stringify(item) });
export const updateMiseBas = (id: string, updates: Partial<MiseBas>) => fetchJson<MiseBas>(`/mises-bas/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteMiseBas = (id: string) => fetchJson<void>(`/mises-bas/${id}`, { method: 'DELETE' });

// Portées
export const getPortees = () => fetchJson<Portee[]>('/portees');
export const addPortee = (item: Portee) => fetchJson<Portee>('/portees', { method: 'POST', body: JSON.stringify(item) });
export const updatePortee = (id: string, updates: Partial<Portee>) => fetchJson<Portee>(`/portees/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deletePortee = (id: string) => fetchJson<void>(`/portees/${id}`, { method: 'DELETE' });

// Ventes
export const getVentes = () => fetchJson<Vente[]>('/ventes');
export const addVente = (item: Vente) => fetchJson<Vente>('/ventes', { method: 'POST', body: JSON.stringify(item) });
export const updateVente = (id: string, updates: Partial<Vente>) => fetchJson<Vente>(`/ventes/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteVente = (id: string) => fetchJson<void>(`/ventes/${id}`, { method: 'DELETE' });

// Dépenses
export const getDepenses = () => fetchJson<Depense[]>('/depenses');
export const addDepense = (item: Depense) => fetchJson<Depense>('/depenses', { method: 'POST', body: JSON.stringify(item) });
export const updateDepense = (id: string, updates: Partial<Depense>) => fetchJson<Depense>(`/depenses/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteDepense = (id: string) => fetchJson<void>(`/depenses/${id}`, { method: 'DELETE' });

// Alerts
export const getAlerts = () => fetchJson<Alert[]>('/alerts');
export const addAlert = (item: Alert) => fetchJson<Alert>('/alerts', { method: 'POST', body: JSON.stringify(item) });
export const updateAlert = (id: string, updates: Partial<Alert>) => fetchJson<Alert>(`/alerts/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteAlert = (id: string) => fetchJson<void>(`/alerts/${id}`, { method: 'DELETE' });
export const markAlertRead = (id: string) => updateAlert(id, { read: true });
export const generateAlerts = () => fetchJson<{ success: boolean; alertsGenerated: { miseBasAlerts: number; postSevrageAlerts: number; engraissementAlerts: number } }>('/alerts/generate', { method: 'POST' });

// Lots d'engraissement
// Lots d'engraissement
export const getLotsEngraissement = () => fetchJson<LotEngraissement[]>('/lots-engraissement');
export const addLotEngraissement = (item: LotEngraissement) => fetchJson<LotEngraissement>('/lots-engraissement', { method: 'POST', body: JSON.stringify(item) });
export const updateLotEngraissement = (id: string, updates: Partial<LotEngraissement>) => fetchJson<LotEngraissement>(`/lots-engraissement/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteLotEngraissement = (id: string) => fetchJson<void>(`/lots-engraissement/${id}`, { method: 'DELETE' });
export const markLotEngraissementReady = (id: string) => fetchJson<LotEngraissement>(`/lots-engraissement/${id}/mark-ready`, { method: 'POST' });

// Lots Post-Sevrage
export const getLotsPostSevrage = () => fetchJson<LotPostSevrage[]>('/lots-post-sevrage');
export const addLotPostSevrage = (item: LotPostSevrage) => fetchJson<LotPostSevrage>('/lots-post-sevrage', { method: 'POST', body: JSON.stringify(item) });
export const updateLotPostSevrage = (id: string, updates: Partial<LotPostSevrage>) => fetchJson<LotPostSevrage>(`/lots-post-sevrage/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteLotPostSevrage = (id: string) => fetchJson<void>(`/lots-post-sevrage/${id}`, { method: 'DELETE' });
export const markLotPostSevrageReady = (id: string) => fetchJson<LotPostSevrage>(`/lots-post-sevrage/${id}/mark-ready`, { method: 'POST' });

// Pesées
// Note: getPesees returns all pesees. We'll simulate getPeseesForLot by filtering on client side for now, 
// or optimally add a query param to backend.
export const getPesees = () => fetchJson<Pesee[]>('/pesees');
export const addPesee = (item: Pesee) => fetchJson<Pesee>('/pesees', { method: 'POST', body: JSON.stringify(item) });
// Helper to match old storage API - Warning: fetch all is not efficient but okay for mvp
export const getPeseesForLot = async (lotId: string): Promise<Pesee[]> => {
    const all = await getPesees();
    return all.filter(p => p.lotId === lotId).sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
};

// Stock Aliment
export const getStockAliments = () => fetchJson<StockAliment[]>('/stock-aliments');
export const addStockAliment = (item: StockAliment) => fetchJson<StockAliment>('/stock-aliments', { method: 'POST', body: JSON.stringify(item) });
export const updateStockAliment = (id: string, updates: Partial<StockAliment>) => fetchJson<StockAliment>(`/stock-aliments/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteStockAliment = (id: string) => fetchJson<void>(`/stock-aliments/${id}`, { method: 'DELETE' });

// Demo Data Initialization - skipped for API as backend should persist.
export const initializeDemoData = async () => {
    // Optional: Call a backend endpoint to seed data if needed
    console.log("Demo data initialization should be handled by backend seeding.");
};

// Mortalites
export const getMortalites = () => fetchJson<Mortalite[]>('/mortalites');
export const addMortalite = (item: Mortalite) => fetchJson<Mortalite>('/mortalites', { method: 'POST', body: JSON.stringify(item) });
export const deleteMortalite = (id: string) => fetchJson<void>(`/mortalites/${id}`, { method: 'DELETE' });
export const getMortalitesForLot = (lotType: 'engraissement' | 'post-sevrage', lotId: string) => 
    fetchJson<Mortalite[]>(`/mortalites/${lotType}/${lotId}`);

// Consommations
export const getConsommations = () => fetchJson<ConsommationAliment[]>('/consommations');
export const addConsommation = (item: ConsommationAliment) => fetchJson<ConsommationAliment>('/consommations', { method: 'POST', body: JSON.stringify(item) });
export const deleteConsommation = (id: string) => fetchJson<void>(`/consommations/${id}`, { method: 'DELETE' });

// Vaccinations
export const getVaccinations = () => fetchJson<Vaccination[]>('/sante/vaccinations');
export const addVaccination = (item: Vaccination) => fetchJson<Vaccination>('/sante/vaccinations', { method: 'POST', body: JSON.stringify(item) });
export const deleteVaccination = (id: string) => fetchJson<void>(`/sante/vaccinations/${id}`, { method: 'DELETE' });

// Traitements
export const getTraitements = () => fetchJson<Traitement[]>('/sante/traitements');
export const addTraitement = (item: Traitement) => fetchJson<Traitement>('/sante/traitements', { method: 'POST', body: JSON.stringify(item) });
export const deleteTraitement = (id: string) => fetchJson<void>(`/sante/traitements/${id}`, { method: 'DELETE' });
