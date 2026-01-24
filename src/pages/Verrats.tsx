import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConfirmDeleteDialog } from '@/components/ui/ConfirmDeleteDialog';
import { ConstraintErrorDialog } from '@/components/ui/ConstraintErrorDialog';
import { useAlertNotifications } from '@/contexts/AlertNotificationContext';
import * as api from '@/lib/api';
import { isConstraintError } from '@/lib/api';
import { Verrat } from '@/types';
import { Plus, Search, Edit2, Trash2, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const raceLabels: Record<string, string> = {
  large_white: 'Large White',
  landrace: 'Landrace',
  pietrain: 'Piétrain',
  duroc: 'Duroc',
  autre: 'Autre',
};

const statusLabels: Record<Verrat['statut'], string> = {
  actif: 'Actif',
  reforme: 'Réformé',
  vendu: 'Vendu',
};

const statusColors: Record<Verrat['statut'], string> = {
  actif: 'bg-success/10 text-success border-success/20',
  reforme: 'bg-warning/10 text-warning border-warning/20',
  vendu: 'bg-muted text-muted-foreground border-border',
};

const Verrats = () => {
  const { refreshAlerts } = useAlertNotifications();
  const [verrats, setVerrats] = useState<Verrat[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    identification: '',
    race: 'large_white' as Verrat['race'],
    dateNaissance: '',
    dateEntree: '',
    poids: '',
    notes: '',
  });
  const [search, setSearch] = useState('');
  const [editingVerrat, setEditingVerrat] = useState<Verrat | null>(null);
  const [stats, setStats] = useState<Record<string, { totalSaillies: number; tauxReussite: number }>>({}); 
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [constraintErrorOpen, setConstraintErrorOpen] = useState(false);
  
  // Delete all dialog state
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  
  // Reforme dialog state
  const [reformeDialogOpen, setReformeDialogOpen] = useState(false);
  const [reformingId, setReformingId] = useState<string | null>(null);
  const [isReforming, setIsReforming] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const verratsData = await api.getVerrats();
      setVerrats(verratsData.sort((a, b) => new Date(b.dateEntree).getTime() - new Date(a.dateEntree).getTime()));
      
      // Charger les stats pour chaque verrat
      const statsMap: Record<string, { totalSaillies: number; tauxReussite: number }> = {};
      for (const v of verratsData) {
        try {
          const s = await api.getVerratStats(v.id);
          statsMap[v.id] = { totalSaillies: s.totalSaillies, tauxReussite: s.tauxReussite };
        } catch {
          statsMap[v.id] = { totalSaillies: 0, tauxReussite: 0 };
        }
      }
      setStats(statsMap);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement des verrats');
    }
  };

  const resetForm = () => {
    setFormData({
      identification: '',
      race: 'large_white',
      dateNaissance: '',
      dateEntree: '',
      poids: '',
      notes: '',
    });
    setEditingVerrat(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.identification || !formData.dateNaissance || !formData.dateEntree || !formData.poids) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      if (editingVerrat) {
        await api.updateVerrat(editingVerrat.id, {
          ...formData,
          poids: parseFloat(formData.poids),
        });
        toast.success('Verrat modifié avec succès');
      } else {
        const newVerrat: Verrat = {
          id: '',
          ...formData,
          poids: parseFloat(formData.poids),
          statut: 'actif',
        };
        await api.addVerrat(newVerrat);
        
        await api.addAlert({
          id: '',
          date: new Date().toISOString(),
          message: `Nouveau verrat ajouté: ${formData.identification} (${raceLabels[formData.race]}).`,
          type: 'vente', // Use vente or generic
          read: false
        });
        
        toast.success('Verrat ajouté avec succès');
      }

      loadData();
      refreshAlerts();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (verrat: Verrat) => {
    setEditingVerrat(verrat);
    setFormData({
      identification: verrat.identification,
      race: verrat.race,
      dateNaissance: verrat.dateNaissance.split('T')[0],
      dateEntree: verrat.dateEntree.split('T')[0],
      poids: verrat.poids.toString(),
      notes: verrat.notes || '',
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
      await api.deleteVerrat(deletingId);
      loadData();
      toast.success('Verrat supprimé');
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
      for (const verrat of verrats) {
        try {
          await api.deleteVerrat(verrat.id);
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
          toast.warning(`${deletedCount} verrats supprimés, mais certains n'ont pas pu l'être en raison de dépendances.`);
        }
        setDeleteAllDialogOpen(false);
        setConstraintErrorOpen(true);
      } else {
        toast.success('Tous les verrats ont été supprimés');
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

  const openReformeDialog = (id: string) => {
    setReformingId(id);
    setReformeDialogOpen(true);
  };

  const handleReforme = async () => {
    if (!reformingId) return;
    
    setIsReforming(true);
    try {
      await api.reformeVerrat(reformingId);
      const verrat = verrats.find(v => v.id === reformingId);
      await api.addAlert({
        id: '',
        date: new Date().toISOString(),
        message: `Le verrat ${verrat?.identification} a été réformé.`,
        type: 'sante',
        read: false
      });
      loadData();
      refreshAlerts();
      toast.success('Verrat réformé avec succès');
      setReformeDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la réforme');
      setReformeDialogOpen(false);
    } finally {
      setIsReforming(false);
      setReformingId(null);
    }
  };

  const filteredVerrats = verrats.filter(verrat => 
    verrat.identification.toLowerCase().includes(search.toLowerCase()) ||
    raceLabels[verrat.race]?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.dateEntree).getTime() - new Date(a.dateEntree).getTime());

  const getAge = (dateNaissance: string): string => {
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
            <h1 className="font-display text-3xl font-bold text-foreground">Verrats</h1>
            <p className="text-muted-foreground mt-1">Gérez vos verrats reproducteurs</p>
          </div>
            <div className="flex flex-wrap gap-2">
              {verrats.length > 0 && (
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
                    Ajouter un verrat
                  </Button>
                </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingVerrat ? 'Modifier le verrat' : 'Nouveau verrat'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="identification">Identification *</Label>
                    <Input
                      id="identification"
                      placeholder="V-001"
                      value={formData.identification}
                      onChange={(e) => setFormData(prev => ({ ...prev, identification: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="race">Race *</Label>
                    <Select
                      value={formData.race}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, race: value as Verrat['race'] }))}
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateNaissance">Date de naissance *</Label>
                    <Input
                      id="dateNaissance"
                      type="date"
                      value={formData.dateNaissance}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateNaissance: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateEntree">Date d'entrée *</Label>
                    <Input
                      id="dateEntree"
                      type="date"
                      value={formData.dateEntree}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateEntree: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poids">Poids (kg) *</Label>
                  <Input
                    id="poids"
                    type="number"
                    step="0.1"
                    placeholder="250"
                    value={formData.poids}
                    onChange={(e) => setFormData(prev => ({ ...prev, poids: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Notes sur le verrat..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" variant="default" className="flex-1">
                    {editingVerrat ? 'Modifier' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="relative animate-slide-up">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher par identification ou race..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up">
          <div className="bg-card rounded-lg border border-border p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</p>
            <p className="text-xl font-display font-bold text-primary mt-1">{verrats.length}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actifs</p>
            <p className="text-xl font-display font-bold text-success mt-1">
              {verrats.filter(v => v.statut === 'actif').length}
            </p>
          </div>
          <div className="bg-card rounded-lg border border-border p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Réformés</p>
            <p className="text-xl font-display font-bold text-warning mt-1">
              {verrats.filter(v => v.statut === 'reforme').length}
            </p>
          </div>
          <div className="bg-card rounded-lg border border-border p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Taux réussite moy.</p>
            <p className="text-xl font-display font-bold text-info mt-1">
              {verrats.length > 0 
                ? Math.round(Object.values(stats).reduce((sum, s) => sum + s.tauxReussite, 0) / verrats.length) 
                : 0}%
            </p>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredVerrats.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-card rounded-2xl border border-border">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Aucun verrat enregistré</p>
            </div>
          ) : (
            filteredVerrats.map((verrat, index) => (
              <div
                key={verrat.id}
                className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-xl">🐗</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{verrat.identification}</p>
                      <p className="text-sm text-muted-foreground">{raceLabels[verrat.race]}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border",
                    statusColors[verrat.statut]
                  )}>
                    {statusLabels[verrat.statut]}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-muted/50 text-center">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Âge</p>
                    <p className="text-lg font-bold text-foreground">{getAge(verrat.dateNaissance)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 text-center">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Poids</p>
                    <p className="text-lg font-bold text-foreground">{verrat.poids} kg</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entrée</span>
                    <span className="font-medium text-foreground">
                      {format(new Date(verrat.dateEntree), "d MMM yyyy", { locale: fr })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saillies</span>
                    <span className="font-medium text-foreground">{stats[verrat.id]?.totalSaillies || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taux réussite</span>
                    <span className={cn(
                      "font-medium",
                      (stats[verrat.id]?.tauxReussite || 0) >= 70 ? "text-success" : 
                      (stats[verrat.id]?.tauxReussite || 0) >= 50 ? "text-warning" : "text-destructive"
                    )}>
                      {stats[verrat.id]?.tauxReussite || 0}%
                    </span>
                  </div>
                </div>

                {(verrat.statut === 'actif' || verrat.statut === 'reforme') && (
                  <div className="mt-4 pt-4 border-t border-border flex gap-2">
                    {verrat.statut === 'actif' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={() => handleEdit(verrat)}
                        >
                          <Edit2 className="h-4 w-4" />
                          Modifier
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 gap-1 text-warning hover:text-warning"
                          onClick={() => openReformeDialog(verrat.id)}
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Réformer
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "text-destructive hover:text-destructive",
                        verrat.statut === 'reforme' && "ml-auto"
                      )}
                      onClick={() => openDeleteDialog(verrat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        {/* Delete Confirmation Dialog */}
        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          title="Supprimer ce verrat ?"
          description="Êtes-vous sûr de vouloir supprimer ce verrat ? Cette action est irréversible."
          isLoading={isDeleting}
        />

        {/* Reforme Confirmation Dialog */}
        <ConfirmDeleteDialog
          open={reformeDialogOpen}
          onOpenChange={setReformeDialogOpen}
          onConfirm={handleReforme}
          title="Réformer ce verrat ?"
          description="Êtes-vous sûr de vouloir réformer ce verrat ? Il sera marqué comme inactif pour la reproduction."
          isLoading={isReforming}
        />

        {/* Constraint Error Dialog */}
        <ConstraintErrorDialog
          open={constraintErrorOpen}
          onOpenChange={setConstraintErrorOpen}
          itemType="verrat"
        />

        {/* Delete All Confirmation Dialog */}
        <ConfirmDeleteDialog
          open={deleteAllDialogOpen}
          onOpenChange={setDeleteAllDialogOpen}
          onConfirm={handleDeleteAll}
          title="Supprimer tous les verrats ?"
          description="Êtes-vous sûr de vouloir supprimer tous les verrats ? Cette action est irréversible."
          isLoading={isDeletingAll}
        />
      </div>
    </MainLayout>
  );
};

export default Verrats;
