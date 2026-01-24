import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConfirmDeleteDialog } from '@/components/ui/ConfirmDeleteDialog';
import * as api from '@/lib/api';
import { isConstraintError } from '@/lib/api';
import { Depense } from '@/types';
import { Plus, Receipt, TrendingDown, Wheat, Stethoscope, Wrench, Users, Building, MoreHorizontal, Search, Edit2, Trash2 } from 'lucide-react';
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
  const [search, setSearch] = useState('');
  const [editingDepense, setEditingDepense] = useState<Depense | null>(null);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Delete all dialog state
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  useEffect(() => {
    loadDepenses();
  }, []);

  const loadDepenses = async () => {
    try {
      const data = await api.getDepenses();
      setDepenses(data);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement des dépenses');
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      categorie: 'alimentation',
      montant: '',
      description: '',
      fournisseur: '',
    });
    setEditingDepense(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.montant) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const newDepenseData = {
      date: formData.date,
      categorie: formData.categorie,
      montant: parseFloat(formData.montant),
      description: formData.description,
      fournisseur: formData.fournisseur,
    };

    try {
      if (editingDepense) {
        await api.updateDepense(editingDepense.id, newDepenseData);
        toast.success('Dépense modifiée avec succès');
      } else {
        const newDepense: Depense = {
          id: '',
          ...newDepenseData,
        };

        await api.addDepense(newDepense);
        toast.success('Dépense enregistrée avec succès');
      }

      loadDepenses();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (depense: Depense) => {
    setEditingDepense(depense);
    setFormData({
      date: depense.date.split('T')[0],
      categorie: depense.categorie,
      montant: depense.montant.toString(),
      description: depense.description,
      fournisseur: depense.fournisseur || '',
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    
    setIsDeleting(true);
    try {
      await api.deleteDepense(deletingId);
      loadDepenses();
      toast.success('Dépense supprimée');
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la suppression');
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    let hasConstraintError = false;
    let deletedCount = 0;

    try {
      for (const depense of depenses) {
        try {
          await api.deleteDepense(depense.id);
          deletedCount++;
        } catch (error) {
          if (isConstraintError(error)) {
            hasConstraintError = true;
          } else {
            throw error;
          }
        }
      }

      loadDepenses();

      if (hasConstraintError) {
        if (deletedCount > 0) {
          toast.warning(`${deletedCount} dépenses supprimées, mais certaines n'ont pas pu l'être en raison de dépendances.`);
        }
        setDeleteAllDialogOpen(false);
        // Depenses doesn't use ConstraintErrorDialog in manual delete either, but warning toast is provided.
      } else {
        toast.success('Toutes les dépenses ont été supprimées');
        setDeleteAllDialogOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la suppression');
      setDeleteAllDialogOpen(false);
    } finally {
      setIsDeletingAll(false);
    }
  };

  const filteredDepenses = depenses.filter(depense =>
    (depense.description.toLowerCase().includes(search.toLowerCase())) ||
    (depense.fournisseur?.toLowerCase() || '').includes(search.toLowerCase()) ||
    categorieLabels[depense.categorie].toLowerCase().includes(search.toLowerCase())
  );

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
            <div className="flex flex-wrap gap-2">
              {depenses.length > 0 && (
                <Button variant="destructive" onClick={() => setDeleteAllDialogOpen(true)} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Tout effacer
                </Button>
              )}
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
                <DialogTitle className="font-display">
                  {editingDepense ? 'Modifier la dépense' : 'Enregistrer une dépense'}
                </DialogTitle>
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
                    {editingDepense ? 'Modifier' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
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

        {/* Search */}
        <div className="relative animate-slide-up">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher par description, fournisseur ou catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
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
                  <th className="text-right py-4 px-6 text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDepenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <Receipt className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">Aucune dépense enregistrée</p>
                    </td>
                  </tr>
                ) : (
                  filteredDepenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((depense, index) => {
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
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(depense)}
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(depense.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Delete Confirmation Dialog */}
        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          title="Supprimer cette dépense ?"
          description="Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible."
          isLoading={isDeleting}
        />

        {/* Delete All Confirmation Dialog */}
        <ConfirmDeleteDialog
          open={deleteAllDialogOpen}
          onOpenChange={setDeleteAllDialogOpen}
          onConfirm={handleDeleteAll}
          title="Supprimer toutes les dépenses ?"
          description="Êtes-vous sûr de vouloir supprimer toutes les dépenses ? Cette action est irréversible."
          isLoading={isDeletingAll}
        />
      </div>
    </MainLayout>
  );
};

export default Depenses;
