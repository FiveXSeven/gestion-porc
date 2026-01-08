import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import * as api from '@/lib/api';
import { Portee, MiseBas, Truie, Saillie, LotPostSevrage, Pesee } from '@/types';
import { Plus, PiggyBank, Scale, Search, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

const statusLabels: Record<Portee['statut'], string> = {
  allaitement: 'En allaitement',
  sevree: 'Sevrée',
  transferee: 'Transférée',
};

const statusColors: Record<Portee['statut'], string> = {
  allaitement: 'bg-info/10 text-info border-info/20',
  sevree: 'bg-success/10 text-success border-success/20',
  transferee: 'bg-muted text-muted-foreground border-border',
};

const Portees = () => {
  const [portees, setPortees] = useState<Portee[]>([]);
  const [misesBas, setMisesBas] = useState<MiseBas[]>([]);
  const [truies, setTruies] = useState<Truie[]>([]);
  const [saillies, setSaillies] = useState<Saillie[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    saillieId: '',
    date: '',
    nesVivants: '',
    mortNes: '',
    poidsMoyen: '',
    notes: '',
  });
  const [search, setSearch] = useState('');
  const [editingPortee, setEditingPortee] = useState<Portee | null>(null);

  // Sevrage state
  const [isSevrageDialogOpen, setIsSevrageDialogOpen] = useState(false);
  const [sevragePortee, setSevragePortee] = useState<Portee | null>(null);
  const [sevrageFormData, setSevrageFormData] = useState({
    date: '',
    poidsTotal: '',
    nombreSevles: '',
    createLot: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [porteesData, misesBasData, truiesData, sailliesData] = await Promise.all([
        api.getPortees(),
        api.getMisesBas(),
        api.getTruies(),
        api.getSaillies()
      ]);
      setPortees(porteesData);
      setMisesBas(misesBasData);
      setTruies(truiesData);
      setSaillies(sailliesData);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement des données');
    }
  };

  const resetForm = () => {
    setFormData({
      saillieId: '',
      date: '',
      nesVivants: '',
      mortNes: '',
      poidsMoyen: '',
      notes: '',
    });
    setEditingPortee(null);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.saillieId || !formData.date || !formData.nesVivants) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const saillie = saillies.find(s => s.id === formData.saillieId);
    if (!saillie) return;

    try {
      if (editingPortee) {
        // Update existing
        const miseBas = misesBas.find(m => m.id === editingPortee.miseBasId);
        if (miseBas) {
          await api.updateMiseBas(miseBas.id, {
            date: formData.date,
            nesVivants: parseInt(formData.nesVivants),
            mortNes: parseInt(formData.mortNes) || 0,
            poidsMoyen: parseFloat(formData.poidsMoyen) || 0,
            notes: formData.notes,
          });
        }

        await api.updatePortee(editingPortee.id, {
          nombreActuel: parseInt(formData.nesVivants), // Resetting to new count if corrected
        });

        toast.success('Portée modifiée avec succès');
      } else {
        // Create new
        const newMiseBasData: MiseBas = {
          id: '',
          saillieId: formData.saillieId,
          truieId: saillie.truieId,
          date: formData.date,
          nesVivants: parseInt(formData.nesVivants),
          mortNes: parseInt(formData.mortNes) || 0,
          poidsMoyen: parseFloat(formData.poidsMoyen) || 0,
          notes: formData.notes,
        };

        const createdMiseBas = await api.addMiseBas(newMiseBasData);

        const newPorteeData: Portee = {
          id: '',
          miseBasId: createdMiseBas.id,
          truieId: saillie.truieId,
          nombreActuel: parseInt(formData.nesVivants),
          dateSevrage: null,
          poidsSevrage: null,
          statut: 'allaitement',
        };

        await api.addPortee(newPorteeData);

        // Update truie and saillie status
        await api.updateTruie(saillie.truieId, { statut: 'allaitante' });
        await api.updateSaillie(formData.saillieId, { statut: 'confirmee' });

        toast.success('Mise bas enregistrée avec succès');
      }
      loadData();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  // ERREUR #19: Calculer l'estimation de date de sevrage (21-28 jours après naissance)
  const getSevrageEstimation = (portee: Portee) => {
    const miseBas = misesBas.find(m => m.id === portee.miseBasId);
    if (!miseBas) return null;
    const naissance = new Date(miseBas.date);
    const sevrageMin = new Date(naissance.getTime() + 21 * 24 * 60 * 60 * 1000);
    const sevrageMax = new Date(naissance.getTime() + 28 * 24 * 60 * 60 * 1000);
    return { sevrageMin, sevrageMax, naissance };
  };

  const openSevrageDialog = (portee: Portee) => {
    const miseBas = misesBas.find(m => m.id === portee.miseBasId);
    // Pre-fill poidsTotal: nombreActuel × poidsMoyen
    const estimatedWeight = miseBas ? (portee.nombreActuel * miseBas.poidsMoyen).toFixed(1) : '';
    
    // ERREUR #19: Pré-remplir avec la date estimée de sevrage (21 jours)
    const estimation = getSevrageEstimation(portee);
    const suggestedDate = estimation ? estimation.sevrageMin.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    setSevragePortee(portee);
    setSevrageFormData({
      date: suggestedDate,
      poidsTotal: estimatedWeight,
      nombreSevles: portee.nombreActuel.toString(),
      createLot: true,
    });
    setIsSevrageDialogOpen(true);
  };

  const handleSevrageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sevragePortee || !sevrageFormData.date || !sevrageFormData.poidsTotal || !sevrageFormData.nombreSevles) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // ERREUR #14: Valider que la date de sevrage est après la mise bas
    const miseBas = misesBas.find(m => m.id === sevragePortee.miseBasId);
    if (miseBas) {
      const sevrageDate = new Date(sevrageFormData.date);
      const miseBasDate = new Date(miseBas.date);
      if (sevrageDate < miseBasDate) {
        toast.error('La date de sevrage doit être après la date de mise bas');
        return;
      }
    }

    const truie = truies.find(t => t.id === sevragePortee.truieId);

    try {
      // 1. Update Portee
      await api.updatePortee(sevragePortee.id, {
        dateSevrage: sevrageFormData.date,
        poidsSevrage: parseFloat(sevrageFormData.poidsTotal),
        nombreActuel: parseInt(sevrageFormData.nombreSevles), // Update current count to weaned count
        statut: 'sevree',
      });

      // 2. Update Truie status
      if (truie) {
        await api.updateTruie(truie.id, { statut: 'active' }); // Back to active (ready for new cycle)
      }

      // 3. Create Post-Sevrage Lot if requested
      if (sevrageFormData.createLot) {
        const weanedCount = parseInt(sevrageFormData.nombreSevles);
        const totalWeight = parseFloat(sevrageFormData.poidsTotal);
        const avgWeight = Math.round((totalWeight / weanedCount) * 100) / 100;

        const newLotData: LotPostSevrage = {
          id: '',
          identification: `LOT-${truie ? truie.identification : 'UNK'}-${format(new Date(), 'ddMMyy')}`,
          dateCreation: new Date().toISOString().split('T')[0],
          origine: 'sevrage',
          porteeId: sevragePortee.id,
          nombreInitial: weanedCount,
          nombreActuel: weanedCount,
          poidsEntree: avgWeight,
          dateEntree: sevrageFormData.date,
          poidsCible: 25, // Default target for PS
          statut: 'en_cours',
          notes: `Sevrage de ${truie?.identification}`,
        };

        const createdLot = await api.addLotPostSevrage(newLotData);

        // Add initial weighing
        const initialPeseeData: Pesee = {
          id: '',
          lotId: createdLot.id,
          date: sevrageFormData.date,
          poidsMoyen: avgWeight,
          nombrePeses: weanedCount,
          notes: 'Pesée de sevrage',
        };
        await api.addPesee(initialPeseeData);

        // Create alert for sevrage completion
        await api.addAlert({
          id: '',
          type: 'sevrage',
          message: `Portée de ${truie?.identification} sevrée: ${weanedCount} porcelets, lot ${createdLot.identification} créé`,
          date: new Date().toISOString(),
          read: false,
          relatedId: sevragePortee.id,
        });

        toast.success('Portée sevrée et lot créé avec succès');
      } else {
        // Create alert for sevrage without lot creation
        await api.addAlert({
          id: '',
          type: 'sevrage',
          message: `Portée de ${truie?.identification} sevrée: ${sevrageFormData.nombreSevles} porcelets`,
          date: new Date().toISOString(),
          read: false,
          relatedId: sevragePortee.id,
        });
        toast.success('Portée sevrée avec succès');
      }

      loadData();
      setIsSevrageDialogOpen(false);
      setSevragePortee(null);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du sevrage');
    }
  };

  const confirmedSaillies = saillies.filter(s =>
    s.statut === 'confirmee' && (!misesBas.some(m => m.saillieId === s.id) || editingPortee)
  );

  const handleEdit = (portee: Portee) => {
    const miseBas = misesBas.find(m => m.id === portee.miseBasId);
    if (!miseBas) return;

    setEditingPortee(portee);
    setFormData({
      saillieId: miseBas.saillieId,
      date: miseBas.date.split('T')[0],
      nesVivants: miseBas.nesVivants.toString(),
      mortNes: miseBas.mortNes.toString(),
      poidsMoyen: miseBas.poidsMoyen.toString(),
      notes: miseBas.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette portée ?')) {
      const portee = portees.find(p => p.id === id);
      if (portee) {
        try {
          await api.deletePortee(id);
          await api.deleteMiseBas(portee.miseBasId);
          loadData();
          toast.success('Portée supprimée');
        } catch (error) {
          console.error(error);
          toast.error('Erreur lors de la suppression');
        }
      }
    }
  };

  const filteredPortees = portees.filter(portee => {
    const truie = truies.find(t => t.id === portee.truieId);
    return (truie?.identification || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Portées</h1>
            <p className="text-muted-foreground mt-1">Gérez les mises bas et le suivi des portées</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2" variant="success">
                <Plus className="h-5 w-5" />
                Enregistrer une mise bas
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingPortee ? 'Modifier la portée' : 'Nouvelle mise bas'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="saillieId">Saillie concernée *</Label>
                  <Select
                    value={formData.saillieId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, saillieId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une saillie" />
                    </SelectTrigger>
                    <SelectContent>
                      {confirmedSaillies.map(saillie => {
                        const truie = truies.find(t => t.id === saillie.truieId);
                        return (
                          <SelectItem key={saillie.id} value={saillie.id}>
                            {truie?.identification} - {format(new Date(saillie.date), "d MMM yyyy", { locale: fr })}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date de mise bas *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nesVivants">Nés vivants *</Label>
                    <Input
                      id="nesVivants"
                      type="number"
                      placeholder="12"
                      value={formData.nesVivants}
                      onChange={(e) => setFormData(prev => ({ ...prev, nesVivants: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mortNes">Mort-nés</Label>
                    <Input
                      id="mortNes"
                      type="number"
                      placeholder="0"
                      value={formData.mortNes}
                      onChange={(e) => setFormData(prev => ({ ...prev, mortNes: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poidsMoyen">Poids moyen (kg)</Label>
                  <Input
                    id="poidsMoyen"
                    type="number"
                    step="0.1"
                    placeholder="1.4"
                    value={formData.poidsMoyen}
                    onChange={(e) => setFormData(prev => ({ ...prev, poidsMoyen: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Notes sur la mise bas..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" variant="success" className="flex-1">
                    {editingPortee ? 'Modifier' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Sevrage Dialog */}
          <Dialog open={isSevrageDialogOpen} onOpenChange={setIsSevrageDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">
                  Sevrer la portée
                </DialogTitle>
              </DialogHeader>
              {/* ERREUR #19: Afficher l'estimation de date de sevrage */}
              {sevragePortee && (() => {
                const estimation = getSevrageEstimation(sevragePortee);
                if (estimation) {
                  return (
                    <div className="bg-info/10 text-info rounded-lg p-3 text-sm">
                      <p className="font-medium">📅 Estimation de sevrage</p>
                      <p>Entre le {format(estimation.sevrageMin, "d MMM", { locale: fr })} et le {format(estimation.sevrageMax, "d MMM yyyy", { locale: fr })}</p>
                      <p className="text-xs mt-1 opacity-80">(21 à 28 jours après la naissance)</p>
                    </div>
                  );
                }
                return null;
              })()}
              <form onSubmit={handleSevrageSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="sevrageDate">Date de sevrage *</Label>
                  <Input
                    id="sevrageDate"
                    type="date"
                    value={sevrageFormData.date}
                    onChange={(e) => setSevrageFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombreSevles">Nombre sevrés *</Label>
                    <Input
                      id="nombreSevles"
                      type="number"
                      value={sevrageFormData.nombreSevles}
                      onChange={(e) => setSevrageFormData(prev => ({ ...prev, nombreSevles: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="poidsTotal">Poids TOTAL (kg) *</Label>
                    <Input
                      id="poidsTotal"
                      type="number"
                      step="0.1"
                      placeholder="85"
                      value={sevrageFormData.poidsTotal}
                      onChange={(e) => setSevrageFormData(prev => ({ ...prev, poidsTotal: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 py-2">
                  <Checkbox
                    id="createLot"
                    checked={sevrageFormData.createLot}
                    onCheckedChange={(checked) => setSevrageFormData(prev => ({ ...prev, createLot: checked as boolean }))}
                  />
                  <Label htmlFor="createLot" className="font-normal cursor-pointer">
                    Créer automatiquement un lot Post-Sevrage
                  </Label>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsSevrageDialogOpen(false)} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1">
                    Valider le sevrage
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative animate-slide-up">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher par identification truie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPortees.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-card rounded-2xl border border-border">
              <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Aucune portée enregistrée</p>
            </div>
          ) : (
            filteredPortees.map((portee, index) => {
              const miseBas = misesBas.find(m => m.id === portee.miseBasId);
              const truie = truies.find(t => t.id === portee.truieId);

              return (
                <div
                  key={portee.id}
                  className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                        <PiggyBank className="h-6 w-6 text-info" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{truie?.identification}</p>
                        <p className="text-sm text-muted-foreground">
                          {miseBas ? format(new Date(miseBas.date), "d MMM yyyy", { locale: fr }) : '-'}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border",
                      statusColors[portee.statut]
                    )}>
                      {statusLabels[portee.statut]}
                    </span>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(portee)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(portee.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-muted/50 text-center">
                      <p className="text-2xl font-bold text-foreground">{portee.nombreActuel}</p>
                      <p className="text-xs text-muted-foreground">Porcelets</p>
                    </div>
                    {miseBas && (
                      <div className="p-3 rounded-xl bg-muted/50 text-center">
                        <p className="text-2xl font-bold text-foreground">{miseBas.poidsMoyen}</p>
                        <p className="text-xs text-muted-foreground">Poids moy. (kg)</p>
                      </div>
                    )}
                  </div>

                  {miseBas && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nés vivants</span>
                        <span className="font-medium text-success">{miseBas.nesVivants}</span>
                      </div>
                      {miseBas.mortNes > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mort-nés</span>
                          <span className="font-medium text-destructive">{miseBas.mortNes}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {portee.dateSevrage && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-success mb-1">
                        <Scale className="h-4 w-4" />
                        <span className="text-sm font-medium">Sevrage</span>
                      </div>
                      <p className="font-medium text-foreground">
                        {format(new Date(portee.dateSevrage), "d MMMM yyyy", { locale: fr })}
                        {portee.poidsSevrage && ` - ${portee.poidsSevrage} kg total`}
                      </p>
                    </div>
                  )}

                  {!portee.dateSevrage && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      {/* Estimation de sevrage */}
                      {(() => {
                        const estimation = getSevrageEstimation(portee);
                        if (estimation) {
                          return (
                            <div className="bg-info/10 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-info mb-1">
                                <span className="text-sm font-medium">📅 Estimation de sevrage</span>
                              </div>
                              <p className="text-sm text-foreground font-medium">
                                Entre le {format(estimation.sevrageMin, "d MMM", { locale: fr })} et le {format(estimation.sevrageMax, "d MMM yyyy", { locale: fr })}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                (21 à 28 jours après la naissance)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      <Button
                        className="w-full gap-2"
                        variant="secondary"
                        onClick={() => openSevrageDialog(portee)}
                      >
                        <ArrowRight className="h-4 w-4" />
                        Sevrer la portée
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Portees;
