import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import * as api from '@/lib/api';
import { Truie, Saillie, MiseBas, Portee } from '@/types';
import { Plus, Search, Edit2, Trash2, PiggyBank, Eye, Heart, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const raceLabels: Record<string, string> = {
  large_white: 'Large White',
  landrace: 'Landrace',
  pietrain: 'Piétrain',
  duroc: 'Duroc',
  autre: 'Autre',
};

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
  
  // Detail view state
  const [detailTruie, setDetailTruie] = useState<Truie | null>(null);
  const [truieSaillies, setTruieSaillies] = useState<Saillie[]>([]);
  const [truieMisesBas, setTruieMisesBas] = useState<MiseBas[]>([]);
  const [truiePortees, setTruiePortees] = useState<Portee[]>([]);
  
  const [formData, setFormData] = useState({
    identification: '',
    race: 'large_white' as Truie['race'],
    dateEntree: '',
    dateNaissance: '',
    poids: '',
    statut: 'active' as Truie['statut'],
    notes: '',
  });

  useEffect(() => {
    loadTruies();
  }, []);

  const loadTruies = async () => {
    try {
      const data = await api.getTruies();
      setTruies(data.sort((a, b) => new Date(b.dateEntree).getTime() - new Date(a.dateEntree).getTime()));
    } catch (error) {
      toast.error('Erreur lors du chargement des truies');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      identification: '',
      race: 'large_white',
      dateEntree: '',
      dateNaissance: '',
      poids: '',
      statut: 'active',
      notes: '',
    });
    setEditingTruie(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.identification || !formData.dateEntree || !formData.poids) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      if (editingTruie) {
        await api.updateTruie(editingTruie.id, {
          ...formData,
          poids: parseFloat(formData.poids),
        });
        toast.success('Truie modifiée avec succès');
      } else {
        const newTruie: Truie = {
          id: '', // Backend will generate ID
          ...formData,
          poids: parseFloat(formData.poids),
        };
        await api.addTruie(newTruie);
        toast.success('Truie ajoutée avec succès');
      }

      loadTruies();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
      console.error(error);
    }
  };

  const handleEdit = (truie: Truie) => {
    setEditingTruie(truie);
    setFormData({
      identification: truie.identification,
      race: truie.race,
      dateEntree: truie.dateEntree.split('T')[0], // Ensure format YYYY-MM-DD
      dateNaissance: truie.dateNaissance.split('T')[0],
      poids: truie.poids.toString(),
      statut: truie.statut,
      notes: truie.notes,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette truie ?')) {
      try {
        await api.deleteTruie(id);
        loadTruies();
        toast.success('Truie supprimée');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
        console.error(error);
      }
    }
  };

  const openDetailView = async (truie: Truie) => {
    setDetailTruie(truie);
    try {
      const [sailliesData, misesBasData, porteesData] = await Promise.all([
        api.getSaillies(),
        api.getMisesBas(),
        api.getPortees(),
      ]);
      
      // Filter data for this truie
      const truieSailliesFiltered = sailliesData.filter(s => s.truieId === truie.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTruieSaillies(truieSailliesFiltered);
      
      const truieMisesBasFiltered = misesBasData.filter(mb => 
        truieSailliesFiltered.some(s => s.id === mb.saillieId)
      );
      setTruieMisesBas(truieMisesBasFiltered);
      
      const truiePorteesFiltered = porteesData.filter(p => 
        truieMisesBasFiltered.some(mb => mb.id === p.miseBasId)
      );
      setTruiePortees(truiePorteesFiltered);
    } catch (error) {
      console.error(error);
    }
  };

  const calculatePerformanceScore = (): number => {
    if (truieSaillies.length === 0) return 0;
    
    const totalNesVivants = truieMisesBas.reduce((sum, mb) => sum + mb.nesVivants, 0);
    const avgLitterSize = truieMisesBas.length > 0 ? totalNesVivants / truieMisesBas.length : 0;
    const fertilityRate = truieSaillies.filter(s => s.statut === 'confirmee').length / truieSaillies.length;
    
    // Score: 40% litter size (out of 12) + 40% fertility + 20% consistency
    const litterScore = Math.min(avgLitterSize / 12, 1) * 40;
    const fertilityScore = fertilityRate * 40;
    const consistencyScore = truieMisesBas.length >= 3 ? 20 : (truieMisesBas.length / 3) * 20;
    
    return Math.round(litterScore + fertilityScore + consistencyScore);
  };

  const filteredTruies = truies.filter(truie => {
    const matchSearch = truie.identification.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'all' || truie.statut === filterStatut;
    return matchSearch && matchStatut;
  }).sort((a, b) => new Date(b.dateEntree).getTime() - new Date(a.dateEntree).getTime());

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
                <div className="space-y-2">
                  <Label htmlFor="race">Race *</Label>
                  <Select
                    value={formData.race}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, race: value as Truie['race'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="large_white">Large White</SelectItem>
                      <SelectItem value="landrace">Landrace</SelectItem>
                      <SelectItem value="pietrain">Piétrain</SelectItem>
                      <SelectItem value="duroc">Duroc</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Race</th>
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
                        {raceLabels[truie.race] || truie.race}
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
                            onClick={() => openDetailView(truie)}
                            className="h-9 w-9 text-muted-foreground hover:text-info"
                            title="Voir détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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

        {/* Detail Dialog */}
        <Dialog open={!!detailTruie} onOpenChange={(open) => !open && setDetailTruie(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            {detailTruie && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-display flex items-center gap-3">
                    <PiggyBank className="h-6 w-6 text-primary" />
                    Fiche de {detailTruie.identification}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-primary/10 text-center">
                      <p className="text-2xl font-bold text-primary">{truieSaillies.length}</p>
                      <p className="text-xs text-muted-foreground">Saillies</p>
                    </div>
                    <div className="p-3 rounded-xl bg-accent/10 text-center">
                      <p className="text-2xl font-bold text-accent">{truieMisesBas.length}</p>
                      <p className="text-xs text-muted-foreground">Mises bas</p>
                    </div>
                    <div className="p-3 rounded-xl bg-info/10 text-center">
                      <p className="text-2xl font-bold text-info">
                        {truieMisesBas.length > 0 
                          ? Math.round(truieMisesBas.reduce((sum, mb) => sum + mb.nesVivants, 0) / truieMisesBas.length * 10) / 10
                          : 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Nés vivants/portée</p>
                    </div>
                    <div className="p-3 rounded-xl bg-success/10 text-center">
                      <p className="text-2xl font-bold text-success">{calculatePerformanceScore()}%</p>
                      <p className="text-xs text-muted-foreground">Score perf.</p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Statut</p>
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium border", statusColors[detailTruie.statut])}>
                        {statusLabels[detailTruie.statut]}
                      </span>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Race</p>
                      <p className="font-semibold">{raceLabels[detailTruie.race] || detailTruie.race}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Poids</p>
                      <p className="font-semibold">{detailTruie.poids} kg</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date d'entrée</p>
                      <p className="font-semibold">{format(new Date(detailTruie.dateEntree), "d MMM yyyy", { locale: fr })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date de naissance</p>
                      <p className="font-semibold">{detailTruie.dateNaissance ? format(new Date(detailTruie.dateNaissance), "d MMM yyyy", { locale: fr }) : '-'}</p>
                    </div>
                  </div>

                  {/* Historique des saillies */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-accent" />
                      Historique des saillies ({truieSaillies.length})
                    </h4>
                    {truieSaillies.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">Aucune saillie enregistrée</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {truieSaillies.map(s => {
                          const miseBas = truieMisesBas.find(mb => mb.saillieId === s.id);
                          return (
                            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <div>
                                <p className="text-sm font-medium">
                                  {format(new Date(s.date), "d MMM yyyy", { locale: fr })}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {s.statut === 'confirmee' ? '✅ Confirmée' : s.statut === 'echouee' ? '❌ Échouée' : '⏳ En attente'}
                                </p>
                              </div>
                              {miseBas && (
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-success">{miseBas.nesVivants} nés vivants</p>
                                  <p className="text-xs text-muted-foreground">{miseBas.mortNes} mort-nés</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {detailTruie.notes && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Notes</h4>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{detailTruie.notes}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Truies;
