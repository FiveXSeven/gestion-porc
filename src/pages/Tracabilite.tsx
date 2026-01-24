import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConfirmDeleteDialog } from '@/components/ui/ConfirmDeleteDialog';
import { useAlertNotifications } from '@/contexts/AlertNotificationContext';
import * as api from '@/lib/api';
import { isConstraintError } from '@/lib/api';
import { Mouvement } from '@/types';
import { Plus, FileText, ArrowUpCircle, ArrowDownCircle, Filter, Search, Info, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ConstraintErrorDialog } from '@/components/ui/ConstraintErrorDialog';
import { Truie, Verrat, Saillie, Portee, MiseBas, Vente, LotPostSevrage, LotEngraissement } from '@/types';

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

const raceLabels: Record<string, string> = {
  large_white: 'Large White',
  landrace: 'Landrace',
  pietrain: 'Piétrain',
  duroc: 'Duroc',
  autre: 'Autre',
};

const Tracabilite = () => {
  const { refreshAlerts } = useAlertNotifications();
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
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<{
    totalEntrees: number;
    totalSorties: number;
    solde: number;
  } | null>(null);

  // States for detailed view
  const [truies, setTruies] = useState<Truie[]>([]);
  const [verrats, setVerrats] = useState<Verrat[]>([]);
  const [saillies, setSaillies] = useState<Saillie[]>([]);
  const [portees, setPortees] = useState<Portee[]>([]);
  const [misesBas, setMisesBas] = useState<MiseBas[]>([]);
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [lotsPS, setLotsPS] = useState<LotPostSevrage[]>([]);
  const [lotsENG, setLotsENG] = useState<LotEngraissement[]>([]);
  const [selectedMouvement, setSelectedMouvement] = useState<Mouvement | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [constraintErrorOpen, setConstraintErrorOpen] = useState(false);
  
  // Delete all dialog state
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [
        mouvementsData, 
        statsData, 
        truiesData, 
        verratsData, 
        sailliesData,
        porteesData, 
        misesBasData, 
        ventesData,
        lotsPSData,
        lotsENGData
      ] = await Promise.all([
        api.getMouvements(),
        api.getMouvementsStats(),
        api.getTruies(),
        api.getVerrats(),
        api.getSaillies(),
        api.getPortees(),
        api.getMisesBas(),
        api.getVentes(),
        api.getLotsPostSevrage(),
        api.getLotsEngraissement(),
      ]);
      setMouvements(mouvementsData);
      setStats(statsData);
      setTruies(truiesData);
      setVerrats(verratsData);
      setSaillies(sailliesData);
      setPortees(porteesData);
      setMisesBas(misesBasData);
      setVentes(ventesData);
      setLotsPS(lotsPSData);
      setLotsENG(lotsENGData);
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
      await api.addAlert({
        id: '',
        date: new Date().toISOString(),
        message: `${formData.typeMouvement === 'entree' ? 'Entrée' : 'Sortie'} enregistrée: ${formData.quantite} ${typeAnimalLabels[formData.typeAnimal]} (${motifLabels[formData.motif]}).`,
        type: formData.typeMouvement === 'entree' ? 'mise_bas' : 'vente', // Use appropriate type
        read: false
      });

      toast.success('Mouvement enregistré avec succès');
      loadData();
      refreshAlerts();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      await api.deleteMouvement(deletingId);
      loadData();
      toast.success('Mouvement supprimé');
      setDeleteDialogOpen(false);
    } catch (error) {
      setDeleteDialogOpen(false);
      if (isConstraintError(error)) {
        setConstraintErrorOpen(true);
      } else {
        toast.error('Erreur lors de la suppression');
      }
      console.error(error);
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
      for (const mvmt of mouvements) {
        try {
          await api.deleteMouvement(mvmt.id);
          deletedCount++;
        } catch (error) {
          if (isConstraintError(error)) {
            hasConstraintError = true;
          } else {
            throw error;
          }
        }
      }

      loadData();

      if (hasConstraintError) {
        if (deletedCount > 0) {
          toast.warning(`${deletedCount} mouvements supprimés, mais certains n'ont pas pu l'être en raison de dépendances.`);
        }
        setDeleteAllDialogOpen(false);
        setConstraintErrorOpen(true);
      } else {
        toast.success('Tous les mouvements ont été supprimés');
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

  const filteredMouvements = mouvements.filter(m => {
    if (filter.typeAnimal && m.typeAnimal !== filter.typeAnimal) return false;
    if (filter.typeMouvement && m.typeMouvement !== filter.typeMouvement) return false;
    
    if (search) {
      const searchLower = search.toLowerCase();
      const identification = m.identification?.toLowerCase() || '';
      const notes = m.notes?.toLowerCase() || '';
      const origine = m.origine?.toLowerCase() || '';
      const destination = m.destination?.toLowerCase() || '';
      const typeAnimal = typeAnimalLabels[m.typeAnimal].toLowerCase();
      const motif = motifLabels[m.motif].toLowerCase();
      
      return identification.includes(searchLower) || 
             notes.includes(searchLower) || 
             origine.includes(searchLower) || 
             destination.includes(searchLower) ||
             typeAnimal.includes(searchLower) ||
             motif.includes(searchLower);
    }
    
    return true;
  }).sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Motifs disponibles selon le type de mouvement
  const getAvailableMotifs = () => {
    if (formData.typeMouvement === 'entree') {
      return ['naissance', 'achat', 'transfert'];
    }
    return ['vente', 'mortalite', 'reforme', 'transfert'];
  };

  const calculateAge = (dateNaissance?: string): string => {
    if (!dateNaissance) return '-';
    const birth = new Date(dateNaissance);
    const now = new Date();
    
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    
    if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
      years--;
      months += 12;
    }
    
    if (years > 0) {
      if (months === 0) return `${years} an${years > 1 ? 's' : ''}`;
      return `${years} an${years > 1 ? 's' : ''} ${months}m`;
    }
    return `${months} mois`;
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
            <div className="flex flex-wrap gap-2">
              {mouvements.length > 0 && (
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
                  <Button className="gap-2" variant="default">
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
                  <Button type="submit" variant="default" className="flex-1">
                    Enregistrer
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
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

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 animate-slide-up">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher par ID, origine, destination, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={filter.typeAnimal}
              onValueChange={(value) => setFilter(prev => ({ ...prev, typeAnimal: value === 'all' ? '' : value }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type animal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les animaux</SelectItem>
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
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Mouvement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les mouvements</SelectItem>
                <SelectItem value="entree">Entrées</SelectItem>
                <SelectItem value="sortie">Sorties</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => {
                              setSelectedMouvement(mouvement);
                              setIsDetailOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Détails
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => openDeleteDialog(mouvement.id)}
                          >
                            Supprimer
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

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Détails du mouvement</DialogTitle>
          </DialogHeader>
          {selectedMouvement && (() => {
            const mvmt = selectedMouvement;
            let details = null;

            if (mvmt.typeAnimal === 'truie' || mvmt.typeAnimal === 'verrat') {
              const animal = mvmt.typeAnimal === 'truie' 
                ? truies.find(t => t.identification === mvmt.identification)
                : verrats.find(v => v.identification === mvmt.identification);
              
              if (animal) {
                details = (
                  <div className="space-y-4">
                    <div className="bg-muted/30 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Identification</span>
                        <span className="font-bold">{animal.identification}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Âge actuel</span>
                        <span className="font-bold text-primary">{calculateAge(animal.dateNaissance)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Race</span>
                        <span className="font-medium">{raceLabels[animal.race] || animal.race}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Statut</span>
                        <span className="font-medium underline decoration-primary/30 uppercase text-[10px] tracking-wider">{animal.statut}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date de naissance</span>
                        <span className="font-medium">{format(new Date(animal.dateNaissance), "dd/MM/yyyy", { locale: fr })}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Poids initial</span>
                        <span className="font-medium">{animal.poids} kg</span>
                      </div>
                    </div>
                  </div>
                );
              }
            } else if (mvmt.typeAnimal === 'porcelet' || mvmt.typeAnimal === 'porc_engraissement') {
              // Try to find lot or portee
              const lotPS = lotsPS.find(l => l.identification === mvmt.identification);
              const lotENG = lotsENG.find(l => l.identification === mvmt.identification);
              const porteeId = lotPS?.porteeId || lotENG?.porteeId;
              
              // If it's a sevrage/naissance and we have identification like SEVRAGE-truieID
              // we can try to find the portee from the identification string
              let matchedPortee = portees.find(p => p.id === porteeId);
              
              if (!matchedPortee && mvmt.identification?.startsWith('SEVRAGE-')) {
                const truieIdent = mvmt.identification.replace('SEVRAGE-', '');
                const truie = truies.find(t => t.identification === truieIdent);
                if (truie) {
                  // Find most recent portee for this truie close to mvmt date
                  const mvmtDate = new Date(mvmt.date).getTime();
                  matchedPortee = portees
                    .filter(p => p.truieId === truie.id)
                    .sort((a, b) => {
                      const mbA = misesBas.find(m => m.id === a.miseBasId);
                      const mbB = misesBas.find(m => m.id === b.miseBasId);
                      const dateA = mbA ? new Date(mbA.date).getTime() : 0;
                      const dateB = mbB ? new Date(mbB.date).getTime() : 0;
                      return Math.abs(dateA - mvmtDate) - Math.abs(dateB - mvmtDate);
                    })[0];
                }
              }

              if (matchedPortee) {
                const mb = misesBas.find(m => m.id === matchedPortee.miseBasId);
                const truie = truies.find(t => t.id === matchedPortee.truieId);
                const saillie = mb ? saillies.find(s => s.id === mb.saillieId) : null;
                const verrat = saillie?.verratId ? verrats.find(v => v.id === saillie.verratId) : null;

                const geneticText = (!truie || !verrat || truie.race === verrat.race) 
                  ? `Race Pure: ${verrat ? (raceLabels[verrat.race] || verrat.race) : (truie ? (raceLabels[truie.race] || truie.race) : 'Inconnue')}`
                  : `Croisement: ${raceLabels[truie.race]?.split(' ')[0]} x ${raceLabels[verrat.race]?.split(' ')[0]}`;

                details = (
                  <div className="space-y-4">
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">🧬</span>
                        <span className="font-bold text-primary">{geneticText}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-[11px] uppercase tracking-tight">Mère (Truie)</p>
                          <p className="font-medium">{truie?.identification || '?'}</p>
                          <p className="text-xs text-muted-foreground">{truie ? (raceLabels[truie.race] || truie.race) : ''}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-[11px] uppercase tracking-tight">Père (Verrat)</p>
                          <p className="font-medium">{verrat?.identification || 'Inconnu'}</p>
                          <p className="text-xs text-muted-foreground">{verrat ? (raceLabels[verrat.race] || verrat.race) : ''}</p>
                        </div>
                      </div>
                    </div>
                    {(lotPS || lotENG) && (
                      <div className="bg-muted/30 p-4 rounded-xl space-y-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase">Informations Lot</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">ID Lot</span>
                          <span className="font-medium">{(lotPS || lotENG)?.identification}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Origine</span>
                          <span className="font-medium">{(lotPS || lotENG)?.origine}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
            }
            
            // Common info for all movements
            return (
              <div className="space-y-6 pt-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    mvmt.typeMouvement === 'entree' ? "bg-success/10" : "bg-destructive/10"
                  )}>
                    {mvmt.typeMouvement === 'entree' ? <ArrowDownCircle className="h-6 w-6 text-success" /> : <ArrowUpCircle className="h-6 w-6 text-destructive" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{format(new Date(mvmt.date), "dd MMMM yyyy", { locale: fr })}</p>
                    <h3 className="font-bold text-lg leading-tight uppercase tracking-wide">
                      {motifLabels[mvmt.motif]} - {mvmt.quantite} {typeAnimalLabels[mvmt.typeAnimal]}
                    </h3>
                  </div>
                </div>

                {details}

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm px-1">
                    <Info className="h-4 w-4" />
                    <span>Informations complémentaires</span>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-xl space-y-2">
                    {mvmt.poids && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Poids</span>
                        <span className="font-medium">{mvmt.poids} kg</span>
                      </div>
                    )}
                    {mvmt.identification && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">ID Ref.</span>
                        <span className="font-medium">{mvmt.identification}</span>
                      </div>
                    )}
                    {mvmt.origine && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Origine</span>
                        <span className="font-medium">{mvmt.origine}</span>
                      </div>
                    )}
                    {mvmt.destination && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Destination</span>
                        <span className="font-medium">{mvmt.destination}</span>
                      </div>
                    )}
                    {mvmt.notes && (
                      <div className="pt-2">
                        <span className="text-xs text-muted-foreground block mb-1">Notes</span>
                        <p className="text-sm p-3 bg-background rounded-lg border border-border italic text-muted-foreground">
                          "{mvmt.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-2" onClick={() => setIsDetailOpen(false)}>
                  Fermer
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Supprimer ce mouvement ?"
        description="Êtes-vous sûr de vouloir supprimer ce mouvement de traçabilité ? Cette action est irréversible."
        isLoading={isDeleting}
      />

      {/* Delete All Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteAllDialogOpen}
        onOpenChange={setDeleteAllDialogOpen}
        onConfirm={handleDeleteAll}
        title="Supprimer tous les mouvements ?"
        description="Êtes-vous sûr de vouloir supprimer tous les mouvements de traçabilité ? Cette action est irréversible."
        isLoading={isDeletingAll}
      />

      {/* Constraint Error Dialog */}
      <ConstraintErrorDialog
        open={constraintErrorOpen}
        onOpenChange={setConstraintErrorOpen}
        itemType="mouvement"
      />
    </MainLayout>
  );
};

export default Tracabilite;
