import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { AlertsList } from '@/components/dashboard/AlertsList';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import * as api from '@/lib/api';
import { Truie, Saillie, Portee, Vente, Depense, Alert, LotEngraissement, LotPostSevrage, Pesee, MiseBas } from '@/types';
import { PiggyBank, Heart, Baby, TrendingUp, TrendingDown, CalendarDays, Scale, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user } = useAuth();
  const [truies, setTruies] = useState<Truie[]>([]);
  const [saillies, setSaillies] = useState<Saillie[]>([]);
  const [portees, setPortees] = useState<Portee[]>([]);
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lots, setLots] = useState<LotEngraissement[]>([]);
  const [lotsPS, setLotsPS] = useState<LotPostSevrage[]>([]);
  const [pesees, setPesees] = useState<Pesee[]>([]);
  const [misesBas, setMisesBas] = useState<MiseBas[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [
        truiesData,
        sailliesData,
        porteesData,
        ventesData,
        depensesData,
        alertsData,
        lotsData,
        lotsPSData,
        peseesData,
        misesBasData
      ] = await Promise.all([
        api.getTruies(),
        api.getSaillies(),
        api.getPortees(),
        api.getVentes(),
        api.getDepenses(),
        api.getAlerts(),
        api.getLotsEngraissement(),
        api.getLotsPostSevrage(),
        api.getPesees(),
        api.getMisesBas()
      ]);

      setTruies(truiesData);
      setSaillies(sailliesData);
      setPortees(porteesData);
      setVentes(ventesData);
      setDepenses(depensesData);
      setAlerts(alertsData);
      setLots(lotsData);
      setLotsPS(lotsPSData);
      setPesees(peseesData);
      setMisesBas(misesBasData);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement des données du tableau de bord');
    }
  };

  const handleMarkAlertRead = async (id: string) => {
    try {
      await api.markAlertRead(id);
      const updatedAlerts = await api.getAlerts();
      setAlerts(updatedAlerts);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la mise à jour de l\'alerte');
    }
  };

  // Calculate stats
  const truiesActives = truies.filter(t => t.statut !== 'reformee' && t.statut !== 'vendue').length;
  const truiesGestantes = truies.filter(t => t.statut === 'gestante').length;
  const porteesEnCours = portees.filter(p => p.statut === 'allaitement').length;

  const totalRecettes = ventes.reduce((sum, v) => sum + v.prixTotal, 0);
  const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);
  const benefice = totalRecettes - totalDepenses;

  // Engraissement stats
  const lotsEnCours = lots.filter(l => l.statut === 'en_cours');
  const totalAnimauxEngraissement = lotsEnCours.reduce((sum, l) => sum + l.nombreActuel, 0);

  // Completed stats (termine or vendu)
  const lotsPSTermines = lotsPS.filter(l => l.statut === 'termine' || l.statut === 'vendu' || l.statut === 'transfere');
  const totalPorceletsTermines = lotsPSTermines.reduce((sum, l) => sum + l.nombreInitial, 0);
  
  const lotsEngTermines = lots.filter(l => l.statut === 'termine' || l.statut === 'vendu');
  const totalPorcsTermines = lotsEngTermines.reduce((sum, l) => sum + l.nombreInitial, 0);

  const getPeseesForLot = (lotId: string) => {
    return pesees.filter(p => p.lotId === lotId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Calcul du GMQ moyen
  const calculateGMQ = (lot: LotEngraissement): number => {
    const lotPesees = getPeseesForLot(lot.id);
    if (lotPesees.length < 2) return 0;
    const firstPesee = lotPesees[0];
    const lastPesee = lotPesees[lotPesees.length - 1];
    const days = differenceInDays(new Date(lastPesee.date), new Date(firstPesee.date));
    if (days === 0) return 0;
    return (lastPesee.poidsMoyen - firstPesee.poidsMoyen) / days;
  };

  const gmqMoyen = lotsEnCours.length > 0
    ? lotsEnCours.reduce((sum, lot) => sum + calculateGMQ(lot), 0) / lotsEnCours.length
    : 0;

  // NEW KPIs
  
  // 1. Fertility Rate: Confirmed sailies / Total saillies
  const totalSaillies = saillies.length;
  const sailliesConfirmees = saillies.filter(s => s.statut === 'confirmee').length;
  const tauxFertilite = totalSaillies > 0 
    ? Math.round((sailliesConfirmees / totalSaillies) * 100) 
    : 0;

  // 2. Average live births per litter
  const totalNesVivants = misesBas.reduce((sum, mb) => sum + mb.nesVivants, 0);
  const moyenneNesVivants = misesBas.length > 0 
    ? Math.round((totalNesVivants / misesBas.length) * 10) / 10
    : 0;

  // 3. Average mortality rate (stillbirths / total births)
  const totalMortNes = misesBas.reduce((sum, mb) => sum + mb.mortNes, 0);
  const totalNaissances = totalNesVivants + totalMortNes;
  const tauxMortaliteNaissance = totalNaissances > 0
    ? Math.round((totalMortNes / totalNaissances) * 1000) / 10
    : 0;

  // 4. Average fattening duration (for completed lots)
  const lotsTerminesAvecDuree = lotsEngTermines.filter(lot => {
    const lotPesees = getPeseesForLot(lot.id);
    return lotPesees.length >= 2;
  });
  const dureeMoyenneEngraissement = lotsTerminesAvecDuree.length > 0
    ? Math.round(lotsTerminesAvecDuree.reduce((sum, lot) => {
        const lotPesees = getPeseesForLot(lot.id);
        if (lotPesees.length >= 2) {
          return sum + differenceInDays(new Date(lotPesees[lotPesees.length - 1].date), new Date(lot.dateEntree));
        }
        return sum;
      }, 0) / lotsTerminesAvecDuree.length)
    : 0;

  // Filter out saillies that already have a mise bas (only show those without a birth yet)
  const sailliesWithMiseBas = new Set(misesBas.map(m => m.saillieId));
  const prochainsMisesBas = saillies
    .filter(s => (s.statut === 'confirmee' || s.statut === 'en_cours') && !sailliesWithMiseBas.has(s.id))
    .sort((a, b) => new Date(a.datePrevueMiseBas).getTime() - new Date(b.datePrevueMiseBas).getTime())
    .slice(0, 5);


  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            Bonjour, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Aperçu de votre élevage
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <StatCard
            title="Truies actives"
            value={truiesActives}
            subtitle={`${truiesGestantes} en gestation`}
            icon={PiggyBank}
            variant="primary"
          />
          <StatCard
            title="Saillies confirmées"
            value={saillies.filter(s => s.statut === 'confirmee').length}
            subtitle="Mises bas à venir"
            icon={Heart}
            variant="accent"
          />
          <StatCard
            title="Portées en cours"
            value={porteesEnCours}
            subtitle="En allaitement"
            icon={Baby}
            variant="success"
          />
          <StatCard
            title="En engraissement"
            value={totalAnimauxEngraissement}
            subtitle={`GMQ: ${gmqMoyen.toFixed(3)} kg/j`}
            icon={Scale}
            variant="warning"
          />
          <StatCard
            title="Terminés"
            value={totalPorceletsTermines + totalPorcsTermines}
            subtitle={`${totalPorceletsTermines} PS | ${totalPorcsTermines} Eng`}
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="Bénéfice"
            value={`${benefice.toLocaleString()} FCFA`}
            subtitle={`Recettes: ${totalRecettes.toLocaleString()} FCFA`}
            icon={benefice >= 0 ? TrendingUp : TrendingDown}
            variant={benefice >= 0 ? 'success' : 'warning'}
          />
        </div>

        {/* KPIs Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-card rounded-lg border border-border p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fertilité</p>
            <p className="text-xl font-display font-bold text-primary mt-1">{tauxFertilite}%</p>
            <p className="text-xs text-muted-foreground mt-1">{sailliesConfirmees}/{totalSaillies}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nés/portée</p>
            <p className="text-xl font-display font-bold text-success mt-1">{moyenneNesVivants}</p>
            <p className="text-xs text-muted-foreground mt-1">{misesBas.length} mises bas</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mortalité</p>
            <p className="text-xl font-display font-bold text-destructive mt-1">{tauxMortaliteNaissance}%</p>
            <p className="text-xs text-muted-foreground mt-1">{totalMortNes}/{totalNaissances}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Durée eng.</p>
            <p className="text-xl font-display font-bold text-info mt-1">{dureeMoyenneEngraissement}j</p>
            <p className="text-xs text-muted-foreground mt-1">{lotsEngTermines.length} lots</p>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Chart */}
          <div className="xl:col-span-2 bg-card rounded-lg border border-border p-4 animate-slide-up">
            <h2 className="font-display text-base font-semibold text-foreground mb-4">
              Évolution financière
            </h2>
            <RevenueChart ventes={ventes} depenses={depenses} />
          </div>

          {/* Alerts */}
          <div className="bg-card rounded-lg border border-border p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-semibold text-foreground">
                Alertes
              </h2>
              <span className="px-2 py-1 rounded text-xs font-semibold bg-destructive/10 text-destructive">
                {alerts.filter(a => !a.read).length}
              </span>
            </div>
            <AlertsList alerts={alerts} onMarkRead={handleMarkAlertRead} />
          </div>
        </div>

        {/* Upcoming events */}
        <div className="bg-card rounded-lg border border-border p-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="font-display text-base font-semibold text-foreground">
              Prochaines mises bas
            </h2>
          </div>

          {prochainsMisesBas.length === 0 ? (
            <p className="text-muted-foreground text-center py-6 text-sm">
              Aucune mise bas prévue prochainement
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {prochainsMisesBas.map((saillie, index) => {
                const truie = truies.find(t => t.id === saillie.truieId);
                return (
                  <div
                    key={saillie.id}
                    className="p-3 rounded-lg bg-accent/5 border border-accent/20 animate-slide-up"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center">
                        <Baby className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{truie?.identification}</p>
                        <p className="text-xs text-muted-foreground">Truie</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Date prévue:</p>
                    <p className="font-medium text-sm text-foreground">
                      {format(new Date(saillie.datePrevueMiseBas), "d MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>


      </div>
    </MainLayout>
  );
};

export default Dashboard;
