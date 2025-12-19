import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import * as api from '@/lib/api';
import { Alert } from '@/types';
import { Bell, Baby, Calendar, ShoppingCart, HeartPulse, Check, Trash2, Scale, Target } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const alertIcons = {
  mise_bas: Baby,
  sevrage: Calendar,
  vente: ShoppingCart,
  sante: HeartPulse,
  post_sevrage_pret: Scale,
  engraissement_pret: Target,
};

const alertColors = {
  mise_bas: 'bg-accent/10 text-accent border-accent/20',
  sevrage: 'bg-info/10 text-info border-info/20',
  vente: 'bg-success/10 text-success border-success/20',
  sante: 'bg-destructive/10 text-destructive border-destructive/20',
  post_sevrage_pret: 'bg-success/10 text-success border-success/20',
  engraissement_pret: 'bg-warning/10 text-warning border-warning/20',
};

const alertLabels = {
  mise_bas: 'Mise bas',
  sevrage: 'Sevrage',
  vente: 'Vente',
  sante: 'Santé',
  post_sevrage_pret: 'PS Prêt',
  engraissement_pret: 'Eng. Prêt',
};

const Alertes = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement des alertes');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markAlertRead(id);
      loadAlerts();
      toast.success('Alerte marquée comme lue');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unreadAlerts = alerts.filter(a => !a.read);
      await Promise.all(unreadAlerts.map(a => api.markAlertRead(a.id)));
      loadAlerts();
      toast.success('Toutes les alertes marquées comme lues');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAlert(id);
      loadAlerts();
      toast.success('Alerte supprimée');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.read;
    if (filter === 'read') return alert.read;
    return true;
  });

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Alertes</h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0 ? `${unreadCount} alerte${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes les alertes sont lues'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllRead} className="gap-2">
              <Check className="h-4 w-4" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 animate-slide-up">
          {(['all', 'unread', 'read'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === 'all' && 'Toutes'}
              {f === 'unread' && 'Non lues'}
              {f === 'read' && 'Lues'}
            </Button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border animate-fade-in">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">
                {filter === 'unread' ? 'Aucune alerte non lue' : filter === 'read' ? 'Aucune alerte lue' : 'Aucune alerte'}
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert, index) => {
              const Icon = alertIcons[alert.type];
              return (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-start gap-4 p-5 rounded-2xl border bg-card shadow-card transition-all duration-200 hover:shadow-card-hover animate-slide-up",
                    !alert.read && "ring-2 ring-primary/20"
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={cn(
                    "p-3 rounded-xl",
                    alertColors[alert.type]
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium border",
                        alertColors[alert.type]
                      )}>
                        {alertLabels[alert.type]}
                      </span>
                      {!alert.read && (
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                    <p className="text-foreground font-medium">{alert.message}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(alert.date), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!alert.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkRead(alert.id)}
                        className="h-9 w-9 text-muted-foreground hover:text-primary"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(alert.id)}
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Alertes;
