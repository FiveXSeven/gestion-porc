import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getDepenses, addDepense } from '@/lib/storage';
import { Depense } from '@/types';
import { Plus, Receipt, TrendingDown, Wheat, Stethoscope, Wrench, Users, Building, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const categorieLabels: Record<Depense['categorie'], string> = {
  alimentation: 'Alimentation',
  sante: 'Santé',
  materiel: 'Matériel',
  main_oeuvre: 'Main d\'œuvre',
  infrastructure: 'Infrastructure',
  autre: 'Autre',
};

const categorieIcons: Record<Depense['categorie'], React.ElementType> = {
  alimentation: Wheat,
  sante: Stethoscope,
  materiel: Wrench,
  main_oeuvre: Users,
  infrastructure: Building,
  autre: MoreHorizontal,
};

const categorieColors: Record<Depense['categorie'], string> = {
  alimentation: 'hsl(28, 80%, 55%)',
  sante: 'hsl(0, 72%, 51%)',
  materiel: 'hsl(199, 89%, 48%)',
  main_oeuvre: 'hsl(150, 45%, 30%)',
  infrastructure: 'hsl(38, 92%, 50%)',
  autre: 'hsl(215, 16%, 47%)',
};

const Depenses = () => {
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    categorie: 'alimentation' as Depense['categorie'],
    montant: '',
    description: '',
    fournisseur: '',
  });

  useEffect(() => {
    loadDepenses();
  }, []);

  const loadDepenses = () => {
    setDepenses(getDepenses());
  };

  const resetForm = () => {
    setFormData({
      date: '',
      categorie: 'alimentation',
      montant: '',
      description: '',
      fournisseur: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.montant) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const newDepense: Depense = {
      id: Date.now().toString(),
      date: formData.date,
      categorie: formData.categorie,
      montant: parseFloat(formData.montant),
      description: formData.description,
      fournisseur: formData.fournisseur,
    };
    
    addDepense(newDepense);
    toast.success('Dépense enregistrée avec succès');
    loadDepenses();
    setIsDialogOpen(false);
    resetForm();
  };

  const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);

  // Prepare data for pie chart
  const depensesByCategory = Object.keys(categorieLabels).map(cat => {
    const total = depenses
      .filter(d => d.categorie === cat)
      .reduce((sum, d) => sum + d.montant, 0);
    return {
      name: categorieLabels[cat as Depense['categorie']],
      value: total,
      color: categorieColors[cat as Depense['categorie']],
    };
  }).filter(d => d.value > 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Dépenses</h1>
            <p className="text-muted-foreground mt-1">Suivez vos coûts d'exploitation</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2" variant="destructive">
                <Plus className="h-5 w-5" />
                Nouvelle dépense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">Enregistrer une dépense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categorie">Catégorie</Label>
                    <Select
                      value={formData.categorie}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, categorie: value as Depense['categorie'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categorieLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="montant">Montant (FCFA) *</Label>
                  <Input
                    id="montant"
                    type="number"
                    step="0.01"
                    placeholder="850"
                    value={formData.montant}
                    onChange={(e) => setFormData(prev => ({ ...prev, montant: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Description de la dépense..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fournisseur">Fournisseur</Label>
                  <Input
                    id="fournisseur"
                    placeholder="Nom du fournisseur"
                    value={formData.fournisseur}
                    onChange={(e) => setFormData(prev => ({ ...prev, fournisseur: e.target.value }))}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" variant="destructive" className="flex-1">
                    Enregistrer
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats & Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-destructive/10 rounded-2xl border border-destructive/20 p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="h-6 w-6 text-destructive" />
              <span className="text-sm font-medium text-muted-foreground">Total des dépenses</span>
            </div>
            <p className="text-4xl font-display font-bold text-foreground">{totalDepenses.toLocaleString()} FCFA</p>
          </div>
          
          {depensesByCategory.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="font-semibold text-foreground mb-4">Répartition par catégorie</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={depensesByCategory}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {depensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value.toLocaleString()} FCFA`]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Catégorie</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Description</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Fournisseur</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-foreground">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {depenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <Receipt className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">Aucune dépense enregistrée</p>
                    </td>
                  </tr>
                ) : (
                  depenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((depense, index) => {
                    const Icon = categorieIcons[depense.categorie];
                    return (
                      <tr 
                        key={depense.id} 
                        className="hover:bg-muted/30 transition-colors animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="py-4 px-6 text-foreground">
                          {format(new Date(depense.date), "d MMM yyyy", { locale: fr })}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{categorieLabels[depense.categorie]}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-muted-foreground max-w-[200px] truncate">
                          {depense.description || '-'}
                        </td>
                        <td className="py-4 px-6 text-muted-foreground">{depense.fournisseur || '-'}</td>
                        <td className="py-4 px-6 text-right font-semibold text-destructive">
                          -{depense.montant.toLocaleString()} FCFA
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Depenses;
