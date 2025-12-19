import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import * as api from '@/lib/api';
import { Truie, Saillie, MiseBas, Portee, Vente, Depense, LotEngraissement, LotPostSevrage } from '@/types';
import { FileText, Printer, TrendingUp, TrendingDown, PiggyBank, Scale, Baby, ShoppingCart, Receipt, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

const Rapports = () => {
  const [truies, setTruies] = useState<Truie[]>([]);
  const [saillies, setSaillies] = useState<Saillie[]>([]);
  const [misesBas, setMisesBas] = useState<MiseBas[]>([]);
  const [portees, setPortees] = useState<Portee[]>([]);
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [lots, setLots] = useState<LotEngraissement[]>([]);
  const [lotsPS, setLotsPS] = useState<LotPostSevrage[]>([]);
  const [periode, setPeriode] = useState<'mois' | 'trimestre' | 'annee'>('mois');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [truiesData, sailliesData, misesBasData, porteesData, ventesData, depensesData, lotsData, lotsPSData] = await Promise.all([
        api.getTruies(),
        api.getSaillies(),
        api.getMisesBas(),
        api.getPortees(),
        api.getVentes(),
        api.getDepenses(),
        api.getLotsEngraissement(),
        api.getLotsPostSevrage(),
      ]);
      setTruies(truiesData);
      setSaillies(sailliesData);
      setMisesBas(misesBasData);
      setPortees(porteesData);
      setVentes(ventesData);
      setDepenses(depensesData);
      setLots(lotsData);
      setLotsPS(lotsPSData);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement des données');
    }
  };

  const getDateRange = () => {
    const now = new Date();
    if (periode === 'mois') {
      return { start: startOfMonth(now), end: endOfMonth(now) };
    } else if (periode === 'trimestre') {
      return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
    } else {
      return { start: startOfMonth(subMonths(now, 11)), end: endOfMonth(now) };
    }
  };

  const filterByDate = <T extends { date: string }>(items: T[]): T[] => {
    const { start, end } = getDateRange();
    return items.filter(item => {
      const date = new Date(item.date);
      return date >= start && date <= end;
    });
  };

  // Stats calculations
  const truiesActives = truies.filter(t => t.statut !== 'reformee' && t.statut !== 'vendue').length;
  const truiesGestantes = truies.filter(t => t.statut === 'gestante').length;
  
  const ventesFiltered = filterByDate(ventes);
  const depensesFiltered = filterByDate(depenses);
  const sailliesFiltered = filterByDate(saillies);
  
  const totalRecettes = ventesFiltered.reduce((sum, v) => sum + v.prixTotal, 0);
  const totalDepenses = depensesFiltered.reduce((sum, d) => sum + d.montant, 0);
  const benefice = totalRecettes - totalDepenses;
  
  const animauxVendus = ventesFiltered.reduce((sum, v) => sum + v.quantite, 0);
  
  const sailliesConfirmees = sailliesFiltered.filter(s => s.statut === 'confirmee').length;
  const tauxFertilite = sailliesFiltered.length > 0 
    ? Math.round((sailliesConfirmees / sailliesFiltered.length) * 100)
    : 0;

  const lotsEnCours = lots.filter(l => l.statut === 'en_cours');
  const totalAnimauxEngraissement = lotsEnCours.reduce((sum, l) => sum + l.nombreActuel, 0);
  
  const lotsPSEnCours = lotsPS.filter(l => l.statut === 'en_cours');
  const totalAnimauxPS = lotsPSEnCours.reduce((sum, l) => sum + l.nombreActuel, 0);

  const handlePrint = () => {
    window.print();
  };

  const periodeLabel = periode === 'mois' ? 'Ce mois' : periode === 'trimestre' ? 'Ce trimestre' : 'Cette année';

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in print:hidden">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Rapports</h1>
            <p className="text-muted-foreground mt-1">Résumé de votre activité</p>
          </div>
          <div className="flex gap-2">
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(['mois', 'trimestre', 'annee'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriode(p)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    periode === p 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background hover:bg-muted'
                  }`}
                >
                  {p === 'mois' ? 'Mois' : p === 'trimestre' ? 'Trimestre' : 'Année'}
                </button>
              ))}
            </div>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimer
            </Button>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold">PorcGestion - Rapport {periodeLabel}</h1>
          <p className="text-gray-500">Généré le {format(new Date(), "d MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
        </div>

        {/* Financial Summary */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-card print:shadow-none print:border-gray-300">
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Résumé Financier - {periodeLabel}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-success/10 print:bg-gray-100">
              <p className="text-sm text-muted-foreground">Recettes</p>
              <p className="text-2xl font-bold text-success">{totalRecettes.toLocaleString()} FCFA</p>
              <p className="text-xs text-muted-foreground mt-1">{animauxVendus} animaux vendus</p>
            </div>
            <div className="p-4 rounded-xl bg-destructive/10 print:bg-gray-100">
              <p className="text-sm text-muted-foreground">Dépenses</p>
              <p className="text-2xl font-bold text-destructive">{totalDepenses.toLocaleString()} FCFA</p>
              <p className="text-xs text-muted-foreground mt-1">{depensesFiltered.length} transactions</p>
            </div>
            <div className={`p-4 rounded-xl print:bg-gray-100 ${benefice >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
              <p className="text-sm text-muted-foreground">Bénéfice Net</p>
              <p className={`text-2xl font-bold ${benefice >= 0 ? 'text-success' : 'text-destructive'}`}>
                {benefice >= 0 ? '+' : ''}{benefice.toLocaleString()} FCFA
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Marge: {totalRecettes > 0 ? Math.round((benefice / totalRecettes) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Livestock Summary */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-card print:shadow-none print:border-gray-300">
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-primary" />
            État du Cheptel
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-primary/10 print:bg-gray-100 text-center">
              <PiggyBank className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{truiesActives}</p>
              <p className="text-sm text-muted-foreground">Truies actives</p>
              <p className="text-xs text-muted-foreground">{truiesGestantes} gestantes</p>
            </div>
            <div className="p-4 rounded-xl bg-accent/10 print:bg-gray-100 text-center">
              <Baby className="h-8 w-8 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold">{totalAnimauxPS}</p>
              <p className="text-sm text-muted-foreground">Post-sevrage</p>
              <p className="text-xs text-muted-foreground">{lotsPSEnCours.length} lots</p>
            </div>
            <div className="p-4 rounded-xl bg-warning/10 print:bg-gray-100 text-center">
              <Scale className="h-8 w-8 mx-auto mb-2 text-warning" />
              <p className="text-2xl font-bold">{totalAnimauxEngraissement}</p>
              <p className="text-sm text-muted-foreground">Engraissement</p>
              <p className="text-xs text-muted-foreground">{lotsEnCours.length} lots</p>
            </div>
            <div className="p-4 rounded-xl bg-info/10 print:bg-gray-100 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-info" />
              <p className="text-2xl font-bold">{tauxFertilite}%</p>
              <p className="text-sm text-muted-foreground">Taux fertilité</p>
              <p className="text-xs text-muted-foreground">{sailliesConfirmees}/{sailliesFiltered.length} confirmées</p>
            </div>
          </div>
        </div>

        {/* Ventes by Type */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-card print:shadow-none print:border-gray-300">
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-success" />
            Détail des Ventes - {periodeLabel}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-semibold">Type</th>
                  <th className="text-right py-2 font-semibold">Quantité</th>
                  <th className="text-right py-2 font-semibold">Montant</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { type: 'porcelet', label: 'Porcelets' },
                  { type: 'porc_engraissement', label: 'Porcs engraissement' },
                  { type: 'truie_reforme', label: 'Truies réformées' },
                ].map(({ type, label }) => {
                  const items = ventesFiltered.filter(v => v.typeAnimal === type);
                  const qty = items.reduce((sum, v) => sum + v.quantite, 0);
                  const montant = items.reduce((sum, v) => sum + v.prixTotal, 0);
                  return (
                    <tr key={type} className="border-b border-border/50">
                      <td className="py-2">{label}</td>
                      <td className="text-right py-2">{qty}</td>
                      <td className="text-right py-2 font-medium">{montant.toLocaleString()} FCFA</td>
                    </tr>
                  );
                })}
                <tr className="font-bold">
                  <td className="py-2">Total</td>
                  <td className="text-right py-2">{animauxVendus}</td>
                  <td className="text-right py-2">{totalRecettes.toLocaleString()} FCFA</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Dépenses by Category */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-card print:shadow-none print:border-gray-300">
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-destructive" />
            Détail des Dépenses - {periodeLabel}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-semibold">Catégorie</th>
                  <th className="text-right py-2 font-semibold">Nb</th>
                  <th className="text-right py-2 font-semibold">Montant</th>
                  <th className="text-right py-2 font-semibold">%</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: 'alimentation', label: 'Alimentation' },
                  { cat: 'sante', label: 'Santé' },
                  { cat: 'materiel', label: 'Matériel' },
                  { cat: 'main_oeuvre', label: 'Main d\'œuvre' },
                  { cat: 'infrastructure', label: 'Infrastructure' },
                  { cat: 'autre', label: 'Autre' },
                ].map(({ cat, label }) => {
                  const items = depensesFiltered.filter(d => d.categorie === cat);
                  const montant = items.reduce((sum, d) => sum + d.montant, 0);
                  const pct = totalDepenses > 0 ? Math.round((montant / totalDepenses) * 100) : 0;
                  if (montant === 0) return null;
                  return (
                    <tr key={cat} className="border-b border-border/50">
                      <td className="py-2">{label}</td>
                      <td className="text-right py-2">{items.length}</td>
                      <td className="text-right py-2 font-medium">{montant.toLocaleString()} FCFA</td>
                      <td className="text-right py-2 text-muted-foreground">{pct}%</td>
                    </tr>
                  );
                })}
                <tr className="font-bold">
                  <td className="py-2">Total</td>
                  <td className="text-right py-2">{depensesFiltered.length}</td>
                  <td className="text-right py-2">{totalDepenses.toLocaleString()} FCFA</td>
                  <td className="text-right py-2">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Print Footer */}
        <div className="hidden print:block text-center mt-8 text-sm text-gray-500 border-t pt-4">
          <p>PorcGestion © {new Date().getFullYear()} - Rapport généré automatiquement</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Rapports;
