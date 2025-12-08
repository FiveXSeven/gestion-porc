import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { AlertsList } from '@/components/dashboard/AlertsList';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { getTruies, getSaillies, getPortees, getVentes, getDepenses, getAlerts, markAlertRead } from '@/lib/storage';
import { Truie, Saillie, Portee, Vente, Depense, Alert } from '@/types';
import { PiggyBank, Heart, Baby, TrendingUp, TrendingDown, AlertCircle, CalendarDays } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const [truies, setTruies] = useState<Truie[]>([]);
  const [saillies, setSaillies] = useState<Saillie[]>([]);
  const [portees, setPortees] = useState<Portee[]>([]);
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTruies(getTruies());
    setSaillies(getSaillies());
    setPortees(getPortees());
    setVentes(getVentes());
    setDepenses(getDepenses());
    setAlerts(getAlerts());
  };

  const handleMarkAlertRead = (id: string) => {
    markAlertRead(id);
    setAlerts(getAlerts());
  };

  // Calculate stats
  const truiesActives = truies.filter(t => t.statut !== 'reformee' && t.statut !== 'vendue').length;
  const truiesGestantes = truies.filter(t => t.statut === 'gestante').length;
  const porteesEnCours = portees.filter(p => p.statut === 'allaitement').length;
  
  const totalRecettes = ventes.reduce((sum, v) => sum + v.prixTotal, 0);
  const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);
  const benefice = totalRecettes - totalDepenses;

  const prochainsMisesBas = saillies
    .filter(s => s.statut === 'confirmee')
    .sort((a, b) => new Date(a.datePrevueMiseBas).getTime() - new Date(b.datePrevueMiseBas).getTime())
    .slice(0, 3);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
            Bonjour, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Voici un aperçu de votre élevage aujourd'hui
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
            title="Bénéfice"
            value={`${benefice.toLocaleString()} €`}
            subtitle={`Recettes: ${totalRecettes.toLocaleString()} €`}
            icon={benefice >= 0 ? TrendingUp : TrendingDown}
            variant={benefice >= 0 ? 'success' : 'warning'}
          />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="xl:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-card animate-slide-up">
            <h2 className="font-display text-xl font-semibold text-foreground mb-6">
              Évolution financière
            </h2>
            <RevenueChart ventes={ventes} depenses={depenses} />
          </div>

          {/* Alerts */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Alertes
              </h2>
              <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
                {alerts.filter(a => !a.read).length} nouvelles
              </span>
            </div>
            <AlertsList alerts={alerts} onMarkRead={handleMarkAlertRead} />
          </div>
        </div>

        {/* Upcoming events */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-6">
            <CalendarDays className="h-6 w-6 text-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">
              Prochaines mises bas
            </h2>
          </div>
          
          {prochainsMisesBas.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucune mise bas prévue prochainement
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {prochainsMisesBas.map((saillie, index) => {
                const truie = truies.find(t => t.id === saillie.truieId);
                return (
                  <div
                    key={saillie.id}
                    className="p-4 rounded-xl bg-accent/5 border border-accent/20 animate-slide-up"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Baby className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{truie?.identification}</p>
                        <p className="text-xs text-muted-foreground">Truie</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Date prévue:
                    </p>
                    <p className="font-medium text-foreground">
                      {format(new Date(saillie.datePrevueMiseBas), "d MMMM yyyy", { locale: fr })}
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
