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
import { Vaccination, Traitement, LotEngraissement, LotPostSevrage, Truie } from '@/types';
import { Syringe, Pill, Plus, Calendar, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const typeColors = {
  obligatoire: 'bg-destructive/10 text-destructive border-destructive/20',
  preventif: 'bg-primary/10 text-primary border-primary/20',
  curatif: 'bg-warning/10 text-warning border-warning/20',
};

const Sante = () => {
  const { refreshAlerts } = useAlertNotifications();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [traitements, setTraitements] = useState<Traitement[]>([]);
  const [lots, setLots] = useState<LotEngraissement[]>([]);
  const [lotsPS, setLotsPS] = useState<LotPostSevrage[]>([]);
  const [truies, setTruies] = useState<Truie[]>([]);
  const [activeTab, setActiveTab] = useState<'vaccinations' | 'traitements'>('vaccinations');
  
  const [isVaccinDialogOpen, setIsVaccinDialogOpen] = useState(false);
  const [vaccinFormData, setVaccinFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    nom: '',
    type: 'preventif' as Vaccination['type'],
    lotType: 'engraissement' as Vaccination['lotType'],
    lotId: '',
    truieId: '',
    dateRappel: '',
    notes: '',
  });

  const [isTraitementDialogOpen, setIsTraitementDialogOpen] = useState(false);
  const [traitementFormData, setTraitementFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    nom: '',
    medicament: '',
    dureeJours: '',
    lotType: 'engraissement' as Traitement['lotType'],
    lotId: '',
    truieId: '',
    notes: '',
  });
  
  // Delete dialog states
  const [deleteVaccinDialogOpen, setDeleteVaccinDialogOpen] = useState(false);
  const [deletingVaccinId, setDeletingVaccinId] = useState<string | null>(null);
  const [isDeletingVaccin, setIsDeletingVaccin] = useState(false);
  
  const [deleteTraitDialogOpen, setDeleteTraitDialogOpen] = useState(false);
  const [deletingTraitId, setDeletingTraitId] = useState<string | null>(null);
  const [isDeletingTrait, setIsDeletingTrait] = useState(false);

  // Delete all dialog states
  const [deleteAllVaccinDialogOpen, setDeleteAllVaccinDialogOpen] = useState(false);
  const [isDeletingAllVaccins, setIsDeletingAllVaccins] = useState(false);
  const [deleteAllTraitDialogOpen, setDeleteAllTraitDialogOpen] = useState(false);
  const [isDeletingAllTraits, setIsDeletingAllTraits] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vaccinData, traitementData, lotsData, lotsPSData, truiesData] = await Promise.all([
        api.getVaccinations(),
        api.getTraitements(),
        api.getLotsEngraissement(),
        api.getLotsPostSevrage(),
        api.getTruies(),
      ]);
      setVaccinations(vaccinData);
      setTraitements(traitementData);
      setLots(lotsData.filter(l => l.statut === 'en_cours'));
      setLotsPS(lotsPSData.filter(l => l.statut === 'en_cours'));
      setTruies(truiesData.filter(t => t.statut !== 'reformee' && t.statut !== 'vendue'));
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement des données');
    }
  };

  const handleVaccinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccinFormData.nom) {
      toast.error('Veuillez saisir le nom du vaccin');
      return;
    }

    try {
      await api.addVaccination({
        id: '',
        date: vaccinFormData.date,
        nom: vaccinFormData.nom,
        type: vaccinFormData.type,
        lotType: vaccinFormData.lotType,
        lotId: vaccinFormData.lotId || undefined,
        truieId: vaccinFormData.truieId || undefined,
        dateRappel: vaccinFormData.dateRappel || undefined,
        notes: vaccinFormData.notes,
      });

      await api.addAlert({
        id: '',
        date: new Date().toISOString(),
        message: `Vaccination "${vaccinFormData.nom}" enregistrée pour ${getLotName(vaccinFormData.lotType, vaccinFormData.lotId, vaccinFormData.truieId)}`,
        type: 'sante',
        read: false
      });

      toast.success('Vaccination enregistrée');
      setIsVaccinDialogOpen(false);
      loadData();
      refreshAlerts();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleTraitementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!traitementFormData.nom || !traitementFormData.medicament) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      await api.addTraitement({
        id: '',
        date: traitementFormData.date,
        nom: traitementFormData.nom,
        medicament: traitementFormData.medicament,
        dureeJours: parseInt(traitementFormData.dureeJours) || 1,
        lotType: traitementFormData.lotType,
        lotId: traitementFormData.lotId || undefined,
        truieId: traitementFormData.truieId || undefined,
        notes: traitementFormData.notes,
      });

      await api.addAlert({
        id: '',
        date: new Date().toISOString(),
        message: `Traitement "${traitementFormData.nom}" (${traitementFormData.medicament}) enregistré pour ${getLotName(traitementFormData.lotType, traitementFormData.lotId, traitementFormData.truieId)}`,
        type: 'sante',
        read: false
      });

      toast.success('Traitement enregistré');
      setIsTraitementDialogOpen(false);
      loadData();
      refreshAlerts();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const openDeleteVaccinDialog = (id: string) => {
    setDeletingVaccinId(id);
    setDeleteVaccinDialogOpen(true);
  };

  const handleDeleteVaccin = async () => {
    if (!deletingVaccinId) return;
    
    setIsDeletingVaccin(true);
    try {
      await api.deleteVaccination(deletingVaccinId);
      loadData();
      toast.success('Vaccination supprimée');
      setDeleteVaccinDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la suppression');
      setDeleteVaccinDialogOpen(false);
    } finally {
      setIsDeletingVaccin(false);
      setDeletingVaccinId(null);
    }
  };

  const handleDeleteAllVaccins = async () => {
    setIsDeletingAllVaccins(true);
    let hasConstraintError = false;
    let deletedCount = 0;

    try {
      for (const v of vaccinations) {
        try {
          await api.deleteVaccination(v.id);
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
          toast.warning(`${deletedCount} vaccinations supprimées, mais certaines n'ont pas pu l'être en raison de dépendances.`);
        }
        setDeleteAllVaccinDialogOpen(false);
        // Notes: Sante.tsx doesn't seem to have ConstraintErrorDialog used in manual delete,
        // but it's good practice to at least show the warning toast.
      } else {
        toast.success('Toutes les vaccinations ont été supprimées');
        setDeleteAllVaccinDialogOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la suppression');
      setDeleteAllVaccinDialogOpen(false);
    } finally {
      setIsDeletingAllVaccins(false);
    }
  };

  const openDeleteTraitDialog = (id: string) => {
    setDeletingTraitId(id);
    setDeleteTraitDialogOpen(true);
  };

  const handleDeleteTraitement = async () => {
    if (!deletingTraitId) return;
    
    setIsDeletingTrait(true);
    try {
      await api.deleteTraitement(deletingTraitId);
      loadData();
      toast.success('Traitement supprimé');
      setDeleteTraitDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la suppression');
      setDeleteTraitDialogOpen(false);
    } finally {
      setIsDeletingTrait(false);
      setDeletingTraitId(null);
    }
  };

  const handleDeleteAllTraits = async () => {
    setIsDeletingAllTraits(true);
    let hasConstraintError = false;
    let deletedCount = 0;

    try {
      for (const t of traitements) {
        try {
          await api.deleteTraitement(t.id);
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
          toast.warning(`${deletedCount} traitements supprimés, mais certains n'ont pas pu l'être en raison de dépendances.`);
        }
        setDeleteAllTraitDialogOpen(false);
      } else {
        toast.success('Tous les traitements ont été supprimés');
        setDeleteAllTraitDialogOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la suppression');
      setDeleteAllTraitDialogOpen(false);
    } finally {
      setIsDeletingAllTraits(false);
    }
  };

  const getLotName = (lotType: string, lotId?: string, truieId?: string) => {
    if (truieId) {
      const truie = truies.find(t => t.id === truieId);
      return truie ? `Truie ${truie.identification}` : 'Truie';
    }
    if (lotType === 'engraissement' && lotId) {
      const lot = lots.find(l => l.id === lotId);
      return lot ? lot.identification : 'Lot Engraissement';
    }
    if (lotType === 'post-sevrage' && lotId) {
      const lot = lotsPS.find(l => l.id === lotId);
      return lot ? lot.identification : 'Lot Post-Sevrage';
    }
    return 'Non spécifié';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Santé</h1>
            <p className="text-muted-foreground mt-1">Gérez les vaccinations et traitements</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeTab === 'vaccinations' && vaccinations.length > 0 && (
              <Button variant="destructive" onClick={() => setDeleteAllVaccinDialogOpen(true)} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Tout effacer
              </Button>
            )}
            {activeTab === 'traitements' && traitements.length > 0 && (
              <Button variant="destructive" onClick={() => setDeleteAllTraitDialogOpen(true)} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Tout effacer
              </Button>
            )}
            <Dialog open={isVaccinDialogOpen} onOpenChange={setIsVaccinDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Syringe className="h-5 w-5" />
                  Vaccination
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display">Nouvelle vaccination</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleVaccinSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vaccinDate">Date *</Label>
                      <Input
                        id="vaccinDate"
                        type="date"
                        value={vaccinFormData.date}
                        onChange={(e) => setVaccinFormData(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vaccinType">Type</Label>
                      <Select
                        value={vaccinFormData.type}
                        onValueChange={(value) => setVaccinFormData(prev => ({ ...prev, type: value as Vaccination['type'] }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="obligatoire">Obligatoire</SelectItem>
                          <SelectItem value="preventif">Préventif</SelectItem>
                          <SelectItem value="curatif">Curatif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vaccinNom">Nom du vaccin *</Label>
                    <Input
                      id="vaccinNom"
                      placeholder="Nom du vaccin"
                      value={vaccinFormData.nom}
                      onChange={(e) => setVaccinFormData(prev => ({ ...prev, nom: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vaccinLotType">Type de lot</Label>
                    <Select
                      value={vaccinFormData.lotType}
                      onValueChange={(value) => setVaccinFormData(prev => ({ ...prev, lotType: value as Vaccination['lotType'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engraissement">Engraissement</SelectItem>
                        <SelectItem value="post-sevrage">Post-Sevrage</SelectItem>
                        <SelectItem value="truie">Truie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vaccinDateRappel">Date de rappel</Label>
                    <Input
                      id="vaccinDateRappel"
                      type="date"
                      value={vaccinFormData.dateRappel}
                      onChange={(e) => setVaccinFormData(prev => ({ ...prev, dateRappel: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vaccinNotes">Notes</Label>
                    <Input
                      id="vaccinNotes"
                      placeholder="Notes..."
                      value={vaccinFormData.notes}
                      onChange={(e) => setVaccinFormData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsVaccinDialogOpen(false)} className="flex-1">
                      Annuler
                    </Button>
                    <Button type="submit" className="flex-1">
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isTraitementDialogOpen} onOpenChange={setIsTraitementDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Pill className="h-5 w-5" />
                  Traitement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display">Nouveau traitement</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleTraitementSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="traitDate">Date *</Label>
                      <Input
                        id="traitDate"
                        type="date"
                        value={traitementFormData.date}
                        onChange={(e) => setTraitementFormData(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="traitDuree">Durée (jours)</Label>
                      <Input
                        id="traitDuree"
                        type="number"
                        min="1"
                        value={traitementFormData.dureeJours}
                        onChange={(e) => setTraitementFormData(prev => ({ ...prev, dureeJours: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="traitNom">Nom du traitement *</Label>
                    <Input
                      id="traitNom"
                      placeholder="Nom du traitement"
                      value={traitementFormData.nom}
                      onChange={(e) => setTraitementFormData(prev => ({ ...prev, nom: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="traitMedicament">Médicament *</Label>
                    <Input
                      id="traitMedicament"
                      placeholder="Nom du médicament"
                      value={traitementFormData.medicament}
                      onChange={(e) => setTraitementFormData(prev => ({ ...prev, medicament: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="traitLotType">Type de lot</Label>
                    <Select
                      value={traitementFormData.lotType}
                      onValueChange={(value) => setTraitementFormData(prev => ({ ...prev, lotType: value as Traitement['lotType'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engraissement">Engraissement</SelectItem>
                        <SelectItem value="post-sevrage">Post-Sevrage</SelectItem>
                        <SelectItem value="truie">Truie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="traitNotes">Notes</Label>
                    <Input
                      id="traitNotes"
                      placeholder="Notes..."
                      value={traitementFormData.notes}
                      onChange={(e) => setTraitementFormData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsTraitementDialogOpen(false)} className="flex-1">
                      Annuler
                    </Button>
                    <Button type="submit" className="flex-1">
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 animate-slide-up">
          <div className="bg-primary/10 rounded-2xl border border-primary/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Syringe className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Vaccinations</span>
            </div>
            <p className="text-3xl font-display font-bold text-foreground">{vaccinations.length}</p>
          </div>
          <div className="bg-warning/10 rounded-2xl border border-warning/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Pill className="h-6 w-6 text-warning" />
              <span className="text-sm font-medium text-muted-foreground">Traitements</span>
            </div>
            <p className="text-3xl font-display font-bold text-foreground">{traitements.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 animate-slide-up">
          <Button
            variant={activeTab === 'vaccinations' ? 'default' : 'outline'}
            onClick={() => setActiveTab('vaccinations')}
            className="gap-2"
          >
            <Syringe className="h-4 w-4" />
            Vaccinations
          </Button>
          <Button
            variant={activeTab === 'traitements' ? 'default' : 'outline'}
            onClick={() => setActiveTab('traitements')}
            className="gap-2"
          >
            <Pill className="h-4 w-4" />
            Traitements
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-3 animate-slide-up">
          {activeTab === 'vaccinations' ? (
            vaccinations.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <Syringe className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Aucune vaccination enregistrée</p>
              </div>
            ) : (
              vaccinations.map((v, index) => (
                <div
                  key={v.id}
                  className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border shadow-card"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Syringe className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{v.nom}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium border",
                        typeColors[v.type]
                      )}>
                        {v.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(v.date), "d MMM yyyy", { locale: fr })} • {getLotName(v.lotType, v.lotId, v.truieId)}
                    </p>
                    {v.dateRappel && (
                      <p className="text-xs text-accent mt-1">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Rappel: {format(new Date(v.dateRappel), "d MMM yyyy", { locale: fr })}
                      </p>
                    )}
                    {v.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Note: {v.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteVaccinDialog(v.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )
          ) : (
            traitements.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <Pill className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Aucun traitement enregistré</p>
              </div>
            ) : (
              traitements.map((t, index) => (
                <div
                  key={t.id}
                  className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border shadow-card"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="p-3 rounded-xl bg-warning/10">
                    <Pill className="h-5 w-5 text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{t.nom}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.medicament} • {t.dureeJours} jour(s)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(t.date), "d MMM yyyy", { locale: fr })} • {getLotName(t.lotType, t.lotId, t.truieId)}
                    </p>
                    {t.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Note: {t.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteTraitDialog(t.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )
          )}
        </div>
        {/* Delete Vaccination Dialog */}
        <ConfirmDeleteDialog
          open={deleteVaccinDialogOpen}
          onOpenChange={setDeleteVaccinDialogOpen}
          onConfirm={handleDeleteVaccin}
          title="Supprimer cette vaccination ?"
          description="Êtes-vous sûr de vouloir supprimer cette vaccination ? Cette action est irréversible."
          isLoading={isDeletingVaccin}
        />

        {/* Delete Traitement Dialog */}
        <ConfirmDeleteDialog
          open={deleteTraitDialogOpen}
          onOpenChange={setDeleteTraitDialogOpen}
          onConfirm={handleDeleteTraitement}
          title="Supprimer ce traitement ?"
          description="Êtes-vous sûr de vouloir supprimer ce traitement ? Cette action est irréversible."
          isLoading={isDeletingTrait}
        />

        {/* Delete All Vaccinations Dialog */}
        <ConfirmDeleteDialog
          open={deleteAllVaccinDialogOpen}
          onOpenChange={setDeleteAllVaccinDialogOpen}
          onConfirm={handleDeleteAllVaccins}
          title="Supprimer toutes les vaccinations ?"
          description="Êtes-vous sûr de vouloir supprimer toutes les vaccinations ? Cette action est irréversible."
          isLoading={isDeletingAllVaccins}
        />

        {/* Delete All Traitements Dialog */}
        <ConfirmDeleteDialog
          open={deleteAllTraitDialogOpen}
          onOpenChange={setDeleteAllTraitDialogOpen}
          onConfirm={handleDeleteAllTraits}
          title="Supprimer tous les traitements ?"
          description="Êtes-vous sûr de vouloir supprimer tous les traitements ? Cette action est irréversible."
          isLoading={isDeletingAllTraits}
        />
      </div>
    </MainLayout>
  );
};

export default Sante;
