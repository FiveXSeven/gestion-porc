import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import * as api from '@/lib/api';
import { Mouvement } from '@/types';
import { Plus, FileText, ArrowUpCircle, ArrowDownCircle, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const typeAnimalLabels: Record<string, string> = {
  truie: 'Truie',
  verrat: 'Verrat',
  porcelet: 'Porcelet',
  porc_engraissement: 'Porc (engraissement)',
};

const motifLabels: Record<string, string> = {
  naissance: 'Naissance',
  achat: 'Achat',
  vente: 'Vente',
  mortalite: 'Mortalité',
  reforme: 'Réforme',
  transfert: 'Transfert',
};

const Tracabilite = () => {
  const [mouvements, setMouvements] = useState<Mouvement[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    typeMouvement: 'entree' as 'entree' | 'sortie',
    typeAnimal: 'truie' as Mouvement['typeAnimal'],
    motif: 'achat' as Mouvement['motif'],
    quantite: '1',
    identification: '',
    origine: '',
    destination: '',
    poids: '',
    notes: '',
  });
  const [filter, setFilter] = useState({
    typeAnimal: '',
    typeMouvement: '',
  });
  const [stats, setStats] = useState<{
    totalEntrees: number;
    totalSorties: number;
    solde: number;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mouvementsData, statsData] = await Promise.all([
        api.getMouvements(),
        api.getMouvementsStats(),
      ]);
      setMouvements(mouvementsData);
      setStats(statsData);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement des données');
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      typeMouvement: 'entree',
      typeAnimal: 'truie',
      motif: 'achat',
      quantite: '1',
      identification: '',
      origine: '',
      destination: '',
      poids: '',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.quantite) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const newMouvement: Mouvement = {
        id: '',
        date: formData.date,
        typeMouvement: formData.typeMouvement,
        typeAnimal: formData.typeAnimal,
        motif: formData.motif,
        quantite: parseInt(formData.quantite),
        identification: formData.identification || undefined,
        origine: formData.origine || undefined,
        destination: formData.destination || undefined,
        poids: formData.poids ? parseFloat(formData.poids) : undefined,
        notes: formData.notes,
      };
      await api.addMouvement(newMouvement);
      toast.success('Mouvement enregistré avec succès');
      loadData();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce mouvement ?')) {
      try {
        await api.deleteMouvement(id);
        loadData();
        toast.success('Mouvement supprimé');
      } catch (error) {
        console.error(error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const filteredMouvements = mouvements.filter(m => {
    if (filter.typeAnimal && m.typeAnimal !== filter.typeAnimal) return false;
    if (filter.typeMouvement && m.typeMouvement !== filter.typeMouvement) return false;
    return true;
  });

  // Motifs disponibles selon le type de mouvement
  const getAvailableMotifs = () => {
    if (formData.typeMouvement === 'entree') {
      return ['naissance', 'achat', 'transfert'];
    }
    return ['vente', 'mortalite', 'reforme', 'transfert'];
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Traçabilité</h1>
            <p className="text-muted-foreground mt-1">Registre des mouvements d'animaux</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2" variant="primary">
                <Plus className="h-5 w-5" />
                Nouveau mouvement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">Enregistrer un mouvement</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type de mouvement *</Label>
                    <Select
                      value={formData.typeMouvement}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        typeMouvement: value as 'entree' | 'sortie',
                        motif: value === 'entree' ? 'achat' : 'vente'
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entree">Entrée</SelectItem>
                        <SelectItem value="sortie">Sortie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type d'animal *</Label>
                    <Select
                      value={formData.typeAnimal}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, typeAnimal: value as Mouvement['typeAnimal'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="truie">Truie</SelectItem>
                        <SelectItem value="verrat">Verrat</SelectItem>
                        <SelectItem value="porcelet">Porcelet</SelectItem>
                        <SelectItem value="porc_engraissement">Porc (engraissement)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Motif *</Label>
                    <Select
                      value={formData.motif}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, motif: value as Mouvement['motif'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableMotifs().map(m => (
                          <SelectItem key={m} value={m}>{motifLabels[m]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantité *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.quantite}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantite: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Poids (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Total ou moyen"
                      value={formData.poids}
                      onChange={(e) => setFormData(prev => ({ ...prev, poids: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Identification</Label>
                  <Input
                    placeholder="ID de l'animal ou du lot"
                    value={formData.identification}
                    onChange={(e) => setFormData(prev => ({ ...prev, identification: e.target.value }))}
                  />
                </div>

                {formData.typeMouvement === 'entree' ? (
                  <div className="space-y-2">
                    <Label>Origine</Label>
                    <Input
                      placeholder="Provenance (élevage, fournisseur...)"
                      value={formData.origine}
                      onChange={(e) => setFormData(prev => ({ ...prev, origine: e.target.value }))}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Destination</Label>
                    <Input
                      placeholder="Destination (acheteur, abattoir...)"
                      value={formData.destination}
                      onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    placeholder="Notes supplémentaires..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1">
                    Enregistrer
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats summary */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 animate-slide-up">
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 text-success mb-1">
                <ArrowDownCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Entrées</span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{stats.totalEntrees}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 text-destructive mb-1">
                <ArrowUpCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Sorties</span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{stats.totalSorties}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 text-primary mb-1">
                <FileText className="h-5 w-5" />
                <span className="text-sm font-medium">Solde</span>
              </div>
              <p className={cn(
                "text-2xl font-display font-bold",
                stats.solde >= 0 ? "text-success" : "text-destructive"
              )}>
                {stats.solde >= 0 ? '+' : ''}{stats.solde}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 animate-slide-up">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtrer:</span>
          </div>
          <Select
            value={filter.typeAnimal}
            onValueChange={(value) => setFilter(prev => ({ ...prev, typeAnimal: value === 'all' ? '' : value }))}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type animal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="truie">Truie</SelectItem>
              <SelectItem value="verrat">Verrat</SelectItem>
              <SelectItem value="porcelet">Porcelet</SelectItem>
              <SelectItem value="porc_engraissement">Porc (eng.)</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filter.typeMouvement}
            onValueChange={(value) => setFilter(prev => ({ ...prev, typeMouvement: value === 'all' ? '' : value }))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Mouvement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="entree">Entrées</SelectItem>
              <SelectItem value="sortie">Sorties</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Animal</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Motif</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">Qté</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">ID</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Origine/Dest.</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMouvements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground">
                      Aucun mouvement enregistré
                    </td>
                  </tr>
                ) : (
                  filteredMouvements.map((mouvement) => (
                    <tr key={mouvement.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-sm">
                        {format(new Date(mouvement.date), "dd/MM/yyyy", { locale: fr })}
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                          mouvement.typeMouvement === 'entree' 
                            ? "bg-success/10 text-success" 
                            : "bg-destructive/10 text-destructive"
                        )}>
                          {mouvement.typeMouvement === 'entree' ? (
                            <ArrowDownCircle className="h-3 w-3" />
                          ) : (
                            <ArrowUpCircle className="h-3 w-3" />
                          )}
                          {mouvement.typeMouvement === 'entree' ? 'Entrée' : 'Sortie'}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{typeAnimalLabels[mouvement.typeAnimal]}</td>
                      <td className="p-4 text-sm">{motifLabels[mouvement.motif]}</td>
                      <td className="p-4 text-sm text-center font-medium">{mouvement.quantite}</td>
                      <td className="p-4 text-sm text-muted-foreground">{mouvement.identification || '-'}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {mouvement.origine || mouvement.destination || '-'}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(mouvement.id)}
                        >
                          Supprimer
                        </Button>
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

export default Tracabilite;
