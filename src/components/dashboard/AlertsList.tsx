import { Alert } from '@/types';
import { Bell, Baby, ShoppingCart, HeartPulse, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AlertsListProps {
  alerts: Alert[];
  onMarkRead?: (id: string) => void;
}

const alertIcons = {
  mise_bas: Baby,
  sevrage: Calendar,
  vente: ShoppingCart,
  sante: HeartPulse,
};

const alertColors = {
  mise_bas: 'bg-accent/10 text-accent border-accent/20',
  sevrage: 'bg-info/10 text-info border-info/20',
  vente: 'bg-success/10 text-success border-success/20',
  sante: 'bg-destructive/10 text-destructive border-destructive/20',
};

export const AlertsList = ({ alerts, onMarkRead }: AlertsListProps) => {
  const unreadAlerts = alerts.filter(a => !a.read).slice(0, 5);

  if (unreadAlerts.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">Aucune alerte en attente</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unreadAlerts.map((alert, index) => {
        const Icon = alertIcons[alert.type];
        return (
          <div
            key={alert.id}
            className={cn(
              "flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md animate-slide-up",
              alertColors[alert.type]
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => onMarkRead?.(alert.id)}
          >
            <div className="p-2 rounded-lg bg-background/50">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{alert.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(alert.date), "d MMMM yyyy", { locale: fr })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
