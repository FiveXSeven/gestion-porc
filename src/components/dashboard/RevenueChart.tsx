import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Vente, Depense } from '@/types';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RevenueChartProps {
  ventes: Vente[];
  depenses: Depense[];
}

export const RevenueChart = ({ ventes, depenses }: RevenueChartProps) => {
  // Generate last 6 months data
  const data = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(new Date(), 5 - i);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    const monthVentes = ventes.filter(v =>
      isWithinInterval(new Date(v.date), { start: monthStart, end: monthEnd })
    );
    const monthDepenses = depenses.filter(d =>
      isWithinInterval(new Date(d.date), { start: monthStart, end: monthEnd })
    );

    const recettes = monthVentes.reduce((sum, v) => sum + v.prixTotal, 0);
    const charges = monthDepenses.reduce((sum, d) => sum + d.montant, 0);

    return {
      name: format(month, 'MMM', { locale: fr }),
      recettes,
      depenses: charges,
      benefice: recettes - charges,
    };
  });

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRecettes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142, 70%, 40%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(142, 70%, 40%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickFormatter={(value) => `${value} FCFA`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: number) => [`${value.toLocaleString()} FCFA`]}
          />
          <Area
            type="monotone"
            dataKey="recettes"
            stroke="hsl(142, 70%, 40%)"
            fillOpacity={1}
            fill="url(#colorRecettes)"
            strokeWidth={2}
            name="Recettes"
          />
          <Area
            type="monotone"
            dataKey="depenses"
            stroke="hsl(0, 72%, 51%)"
            fillOpacity={1}
            fill="url(#colorDepenses)"
            strokeWidth={2}
            name="Dépenses"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
