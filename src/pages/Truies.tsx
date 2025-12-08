import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getTruies, addTruie, updateTruie, deleteTruie } from '@/lib/storage';
import { Truie } from '@/types';
import { Plus, Search, Edit2, Trash2, PiggyBank } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const statusLabels: Record<Truie['statut'], string> = {
  active: 'Active',
  gestante: 'Gestante',
  allaitante: 'Allaitante',
  reformee: 'Réformée',
  vendue: 'Vendue',
};

const statusColors: Record<Truie['statut'], string> = {
  active: 'bg-primary/10 text-primary border-primary/20',
  gestante: 'bg-accent/10 text-accent border-accent/20',
  allaitante: 'bg-info/10 text-info border-info/20',
  reformee: 'bg-muted text-muted-foreground border-border',
  vendue: 'bg-success/10 text-success border-success/20',
};

const Truies = () => {
  const [truies, setTruies] = useState<Truie[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTruie, setEditingTruie] = useState<Truie | null>(null);
  const [formData, setFormData] = useState({
    identification: '',
    dateEntree: '',
    dateNaissance: '',
    poids: '',
    statut: 'active' as Truie['statut'],
    notes: '',
  });

  useEffect(() => {
    loadTruies();
  }, []);

  const loadTruies = () => {
    setTruies(getTruies());
  };

  const resetForm = () => {
    setFormData({
      identification: '',
      dateEntree: '',
      dateNaissance: '',
      poids: '',
      statut: 'active',
      notes: '',
    });
    setEditingTruie(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.identification || !formData.dateEntree || !formData.poids) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingTruie) {
      updateTruie(editingTruie.id, {
        ...formData,
        poids: parseFloat(formData.poids),
      });
      toast.success('Truie modifiée avec succès');
    } else {
      const newTruie: Truie = {
        id: Date.now().toString(),
        ...formData,
        poids: parseFloat(formData.poids),
      };
      addTruie(newTruie);
      toast.success('Truie ajoutée avec succès');
    }

    loadTruies();
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (truie: Truie) => {
    setEditingTruie(truie);
    setFormData({
      identification: truie.identification,
      dateEntree: truie.dateEntree,
      dateNaissance: truie.dateNaissance,
      poids: truie.poids.toString(),
      statut: truie.statut,
      notes: truie.notes,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette truie ?')) {
      deleteTruie(id);
      loadTruies();
      toast.success('Truie supprimée');
    }
  };

  const filteredTruies = truies.filter(truie => {
    const matchSearch = truie.identification.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'all' || truie.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Truies</h1>
            <p className="text-muted-foreground mt-1">Gérez votre cheptel de truies</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-5 w-5" />
                Ajouter une truie
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingTruie ? 'Modifier la truie' : 'Nouvelle truie'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="identification">Identification *</Label>
                  <Input
                    id="identification"
                    placeholder="TR-001"
                    value={formData.identification}
                    onChange={(e) => setFormData(prev => ({ ...prev, identification: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateEntree">Date d'entrée *</Label>
                    <Input
                      id="dateEntree"
                      type="date"
                      value={formData.dateEntree}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateEntree: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateNaissance">Date de naissance</Label>
                    <Input
                      id="dateNaissance"
                      type="date"
                      value={formData.dateNaissance}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateNaissance: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="poids">Poids (kg) *</Label>
                    <Input
                      id="poids"
                      type="number"
                      placeholder="180"
                      value={formData.poids}
                      onChange={(e) => setFormData(prev => ({ ...prev, poids: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="statut">Statut</Label>
                    <Select
                      value={formData.statut}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, statut: value as Truie['statut'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Notes additionnelles..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingTruie ? 'Modifier' : 'Ajouter'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher par identification..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11"
            />
          </div>
          <Select value={filterStatut} onValueChange={setFilterStatut}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Identification</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Date d'entrée</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Poids</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Statut</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Notes</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTruies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">Aucune truie trouvée</p>
                    </td>
                  </tr>
                ) : (
                  filteredTruies.map((truie, index) => (
                    <tr 
                      key={truie.id} 
                      className="hover:bg-muted/30 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <PiggyBank className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-semibold text-foreground">{truie.identification}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">
                        {format(new Date(truie.dateEntree), "d MMM yyyy", { locale: fr })}
                      </td>
                      <td className="py-4 px-6 text-foreground font-medium">{truie.poids} kg</td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium border",
                          statusColors[truie.statut]
                        )}>
                          {statusLabels[truie.statut]}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground max-w-[200px] truncate">
                        {truie.notes || '-'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(truie)}
                            className="h-9 w-9 text-muted-foreground hover:text-primary"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(truie.id)}
                            className="h-9 w-9 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Truies;
