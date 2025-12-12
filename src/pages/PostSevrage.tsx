import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getLotsPostSevrage, addLotPostSevrage, getPeseesForLot, addPesee, updateLotPostSevrage, deleteLotPostSevrage, addLot } from '@/lib/storage';
import { LotPostSevrage, Pesee, LotEngraissement } from '@/types';
import { Plus, Scale, TrendingUp, Calendar, Target, Eye, Search, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Checkbox } from '@/components/ui/checkbox';

const statusLabels: Record<LotPostSevrage['statut'], string> = {
  en_cours: 'En cours',
  vendu: 'Vendu',
  partiel: 'Vente partielle',
  transfere: 'Transféré',
};

const statusColors: Record<LotPostSevrage['statut'], string> = {
  en_cours: 'bg-info/10 text-info border-info/20',
  vendu: 'bg-success/10 text-success border-success/20',
  partiel: 'bg-warning/10 text-warning border-warning/20',
  transfere: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

const PostSevrage = () => {
  const [lots, setLots] = useState<LotPostSevrage[]>([]);
  const [isLotDialogOpen, setIsLotDialogOpen] = useState(false);
  const [isPeseeDialogOpen, setIsPeseeDialogOpen] = useState(false);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [detailLot, setDetailLot] = useState<LotPostSevrage | null>(null);
  const [search, setSearch] = useState('');
  const [editingLot, setEditingLot] = useState<LotPostSevrage | null>(null);
  
  const [lotFormData, setLotFormData] = useState({
    identification: '',
    dateEntree: '',
    origine: 'sevrage' as LotPostSevrage['origine'],
    nombreInitial: '',
    poidsEntree: '',
    poidsCible: '25', // Target weight for Post-Sevrage is typically 25-30kg
    notes: '',
  });

  const [peseeFormData, setPeseeFormData] = useState({
    date: '',
    poidsMoyen: '',
    nombrePeses: '',
    notes: '',
  });

  // Transfer state
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [transferLot, setTransferLot] = useState<LotPostSevrage | null>(null);
  const [transferFormData, setTransferFormData] = useState({
    date: '',
    poidsTotal: '',
    nombreTransferes: '',
    createLot: true,
  });

  useEffect(() => {
    loadLots();
  }, []);

  const loadLots = () => {
    setLots(getLotsPostSevrage());
  };

  const resetLotForm = () => {
    setLotFormData({
      identification: '',
      dateEntree: '',
      origine: 'sevrage',
      nombreInitial: '',
      poidsEntree: '',
      poidsCible: '25',
      notes: '',
    });
    setEditingLot(null);
  };

  const resetPeseeForm = () => {
    setPeseeFormData({
      date: '',
      poidsMoyen: '',
      nombrePeses: '',
      notes: '',
    });
  };

  const handleLotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lotFormData.identification || !lotFormData.dateEntree || !lotFormData.nombreInitial || !lotFormData.poidsEntree) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const nombreInitial = parseInt(lotFormData.nombreInitial);
    const poidsEntree = parseFloat(lotFormData.poidsEntree);

    if (editingLot) {
      updateLotPostSevrage(editingLot.id, {
        identification: lotFormData.identification,
        origine: lotFormData.origine,
        dateEntree: lotFormData.dateEntree,
        nombreInitial,
        poidsEntree,
        poidsCible: parseFloat(lotFormData.poidsCible) || 25,
        notes: lotFormData.notes,
      });
      toast.success('Lot modifié avec succès');
    } else {
      const newLot: LotPostSevrage = {
        id: Date.now().toString(),
        identification: lotFormData.identification,
        dateCreation: new Date().toISOString().split('T')[0],
        origine: lotFormData.origine,
        nombreInitial,
        nombreActuel: nombreInitial,
        poidsEntree,
        dateEntree: lotFormData.dateEntree,
        poidsCible: parseFloat(lotFormData.poidsCible) || 25,
        statut: 'en_cours',
        notes: lotFormData.notes,
      };
      
      addLotPostSevrage(newLot);
  
      // Add initial weighing
      const initialPesee: Pesee = {
        id: (Date.now() + 1).toString(),
        lotId: newLot.id,
        date: lotFormData.dateEntree,
        poidsMoyen: poidsEntree,
        nombrePeses: nombreInitial,
        notes: 'Pesée d\'entrée',
      };
      addPesee(initialPesee);
  
      toast.success('Lot créé avec succès');
    }

    loadLots();
    setIsLotDialogOpen(false);
    resetLotForm();
  };

  const handleEdit = (lot: LotPostSevrage) => {
    setEditingLot(lot);
    setLotFormData({
      identification: lot.identification,
      dateEntree: lot.dateEntree,
      origine: lot.origine,
      nombreInitial: lot.nombreInitial.toString(),
      poidsEntree: lot.poidsEntree.toString(),
      poidsCible: lot.poidsCible.toString(),
      notes: lot.notes || '',
    });
    setIsLotDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce lot ?')) {
      deleteLotPostSevrage(id);
      loadLots();
      toast.success('Lot supprimé');
    }
  };

  const filteredLots = lots.filter(lot => 
    lot.identification.toLowerCase().includes(search.toLowerCase())
  );

  const handlePeseeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLotId || !peseeFormData.date || !peseeFormData.poidsMoyen) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const lot = lots.find(l => l.id === selectedLotId);
    if (!lot) return;

    const newPesee: Pesee = {
      id: Date.now().toString(),
      lotId: selectedLotId,
      date: peseeFormData.date,
      poidsMoyen: parseFloat(peseeFormData.poidsMoyen),
      nombrePeses: parseInt(peseeFormData.nombrePeses) || lot.nombreActuel,
      notes: peseeFormData.notes,
    };
    
    addPesee(newPesee);
    toast.success('Pesée enregistrée');
    loadLots();
    setIsPeseeDialogOpen(false);
    resetPeseeForm();
    setSelectedLotId(null);

    // Update detail view if open
    if (detailLot && detailLot.id === selectedLotId) {
      setDetailLot(lot);
    }
  };

  const openPeseeDialog = (lotId: string) => {
    setSelectedLotId(lotId);
    const lot = lots.find(l => l.id === lotId);
    if (lot) {
      setPeseeFormData(prev => ({ ...prev, nombrePeses: lot.nombreActuel.toString() }));
    }
    setIsPeseeDialogOpen(true);
  };

  const openTransferDialog = (lot: LotPostSevrage) => {
    setTransferLot(lot);
    setTransferFormData({
      date: new Date().toISOString().split('T')[0],
      poidsTotal: '', // User needs to weigh them before transfer
      nombreTransferes: lot.nombreActuel.toString(),
      createLot: true,
    });
    setIsTransferDialogOpen(true);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferLot || !transferFormData.date || !transferFormData.poidsTotal || !transferFormData.nombreTransferes) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // 1. Update Post-Sevrage Lot
    updateLotPostSevrage(transferLot.id, {
      statut: 'transfere',
      nombreActuel: 0, // All transferred
      notes: transferLot.notes + ` | Transféré le ${format(new Date(transferFormData.date), 'dd/MM/yyyy')}`
    });

    // 2. Create Engraissement Lot if requested
    if (transferFormData.createLot) {
      const transferCount = parseInt(transferFormData.nombreTransferes);
      const totalWeight = parseFloat(transferFormData.poidsTotal);
      const avgWeight = Math.round((totalWeight / transferCount) * 100) / 100;

      const newLot: LotEngraissement = {
        id: Date.now().toString(),
        identification: `LOT-ENG-${transferLot.identification.replace('LOT-PS-', '')}`,
        dateCreation: new Date().toISOString().split('T')[0],
        origine: 'post-sevrage',
        nombreInitial: transferCount,
        nombreActuel: transferCount,
        poidsEntree: avgWeight,
        dateEntree: transferFormData.date,
        poidsCible: 115, // Standard target for Engraissement
        statut: 'en_cours',
        notes: `Transfert de ${transferLot.identification}`,
      };

      addLot(newLot);

      // Add initial weighing
      const initialPesee: Pesee = {
        id: (Date.now() + 1).toString(),
        lotId: newLot.id,
        date: transferFormData.date,
        poidsMoyen: avgWeight,
        nombrePeses: transferCount,
        notes: 'Pesée d\'entrée (Transfert)',
      };
      addPesee(initialPesee);
      
      toast.success('Transfert effectué et lot d\'engraissement créé');
    } else {
      toast.success('Lot marqué comme transféré');
    }

    loadLots();
    setIsTransferDialogOpen(false);
    setTransferLot(null);
  };

  const calculateGMQ = (lot: LotPostSevrage): number | null => {
    const pesees = getPeseesForLot(lot.id);
    if (pesees.length < 2) return null;

    const firstPesee = pesees[0];
    const lastPesee = pesees[pesees.length - 1];
    const days = differenceInDays(new Date(lastPesee.date), new Date(firstPesee.date));
    
    if (days === 0) return null;
    
    return Math.round(((lastPesee.poidsMoyen - firstPesee.poidsMoyen) / days) * 1000) / 1000;
  };

  const calculateDaysToTarget = (lot: LotPostSevrage): number | null => {
    const pesees = getPeseesForLot(lot.id);
    if (pesees.length === 0) return null;

    const lastPesee = pesees[pesees.length - 1];
    const gmq = calculateGMQ(lot);
    
    if (!gmq || gmq <= 0) return null;
    
    const remainingWeight = lot.poidsCible - lastPesee.poidsMoyen;
    if (remainingWeight <= 0) return 0;
    
    return Math.ceil(remainingWeight / gmq);
  };

  const getLastWeight = (lotId: string): number | null => {
    const pesees = getPeseesForLot(lotId);
    if (pesees.length === 0) return null;
    return pesees[pesees.length - 1].poidsMoyen;
  };

  const lotsEnCours = lots.filter(l => l.statut === 'en_cours');
  const totalAnimaux = lotsEnCours.reduce((sum, l) => sum + l.nombreActuel, 0);

  // Calculate average GMQ
  const gmqValues = lotsEnCours.map(l => calculateGMQ(l)).filter((g): g is number => g !== null);
  const avgGMQ = gmqValues.length > 0 
    ? Math.round((gmqValues.reduce((a, b) => a + b, 0) / gmqValues.length) * 1000) / 1000 
    : null;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Post-Sevrage</h1>
            <p className="text-muted-foreground mt-1">Gérez vos lots de porcelets sevrés</p>
          </div>
          <Dialog open={isLotDialogOpen} onOpenChange={(open) => {
            setIsLotDialogOpen(open);
            if (!open) resetLotForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-5 w-5" />
                Nouveau lot
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingLot ? 'Modifier le lot' : 'Créer un lot Post-Sevrage'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleLotSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="identification">Identification du lot *</Label>
                  <Input
                    id="identification"
                    placeholder="LOT-PS-2024-001"
                    value={lotFormData.identification}
                    onChange={(e) => setLotFormData(prev => ({ ...prev, identification: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateEntree">Date d'entrée *</Label>
                    <Input
                      id="dateEntree"
                      type="date"
                      value={lotFormData.dateEntree}
                      onChange={(e) => setLotFormData(prev => ({ ...prev, dateEntree: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origine">Origine</Label>
                    <Select
                      value={lotFormData.origine}
                      onValueChange={(value) => setLotFormData(prev => ({ ...prev, origine: value as LotPostSevrage['origine'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sevrage">Sevrage interne</SelectItem>
                        <SelectItem value="achat">Achat externe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombreInitial">Nombre d'animaux *</Label>
                    <Input
                      id="nombreInitial"
                      type="number"
                      placeholder="30"
                      value={lotFormData.nombreInitial}
                      onChange={(e) => setLotFormData(prev => ({ ...prev, nombreInitial: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="poidsEntree">Poids moyen entrée (kg) *</Label>
                    <Input
                      id="poidsEntree"
                      type="number"
                      step="0.1"
                      placeholder="7.5"
                      value={lotFormData.poidsEntree}
                      onChange={(e) => setLotFormData(prev => ({ ...prev, poidsEntree: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poidsCible">Poids cible (kg)</Label>
                  <Input
                    id="poidsCible"
                    type="number"
                    placeholder="25"
                    value={lotFormData.poidsCible}
                    onChange={(e) => setLotFormData(prev => ({ ...prev, poidsCible: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Notes sur le lot..."
                    value={lotFormData.notes}
                    onChange={(e) => setLotFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsLotDialogOpen(false)} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingLot ? 'Modifier' : 'Créer le lot'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
          <div className="bg-primary/10 rounded-2xl border border-primary/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Scale className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Lots en cours</span>
            </div>
            <p className="text-3xl font-display font-bold text-foreground">{lotsEnCours.length}</p>
          </div>
          <div className="bg-info/10 rounded-2xl border border-info/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-6 w-6 text-info" />
              <span className="text-sm font-medium text-muted-foreground">Animaux en PS</span>
            </div>
            <p className="text-3xl font-display font-bold text-foreground">{totalAnimaux}</p>
          </div>
          <div className="bg-success/10 rounded-2xl border border-success/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-6 w-6 text-success" />
              <span className="text-sm font-medium text-muted-foreground">GMQ moyen</span>
            </div>
            <p className="text-3xl font-display font-bold text-foreground">
              {avgGMQ ? `${avgGMQ} kg/j` : '-'}
            </p>
          </div>
        </div>

        {/* Pesée Dialog */}
        <Dialog open={isPeseeDialogOpen} onOpenChange={(open) => {
          setIsPeseeDialogOpen(open);
          if (!open) {
            resetPeseeForm();
            setSelectedLotId(null);
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Nouvelle pesée</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePeseeSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="peseeDate">Date de pesée *</Label>
                <Input
                  id="peseeDate"
                  type="date"
                  value={peseeFormData.date}
                  onChange={(e) => setPeseeFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="poidsMoyen">Poids moyen (kg) *</Label>
                  <Input
                    id="poidsMoyen"
                    type="number"
                    step="0.1"
                    placeholder="15"
                    value={peseeFormData.poidsMoyen}
                    onChange={(e) => setPeseeFormData(prev => ({ ...prev, poidsMoyen: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombrePeses">Nombre pesés</Label>
                  <Input
                    id="nombrePeses"
                    type="number"
                    placeholder="30"
                    value={peseeFormData.nombrePeses}
                    onChange={(e) => setPeseeFormData(prev => ({ ...prev, nombrePeses: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="peseeNotes">Notes</Label>
                <Input
                  id="peseeNotes"
                  placeholder="Notes..."
                  value={peseeFormData.notes}
                  onChange={(e) => setPeseeFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsPeseeDialogOpen(false)} className="flex-1">
                  Annuler
                </Button>
                <Button type="submit" className="flex-1">
                  Enregistrer
                </Button>
              </div>
            </form>

          </DialogContent>
        </Dialog>

        {/* Transfer Dialog */}
        <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">
                Transférer en Engraissement
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleTransferSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="transferDate">Date de transfert *</Label>
                <Input
                  id="transferDate"
                  type="date"
                  value={transferFormData.date}
                  onChange={(e) => setTransferFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombreTransferes">Nombre transférés *</Label>
                  <Input
                    id="nombreTransferes"
                    type="number"
                    value={transferFormData.nombreTransferes}
                    onChange={(e) => setTransferFormData(prev => ({ ...prev, nombreTransferes: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poidsTotal">Poids TOTAL (kg) *</Label>
                  <Input
                    id="poidsTotal"
                    type="number"
                    step="0.1"
                    placeholder="Total du lot"
                    value={transferFormData.poidsTotal}
                    onChange={(e) => setTransferFormData(prev => ({ ...prev, poidsTotal: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 py-2">
                <Checkbox 
                  id="createEngraissementLot" 
                  checked={transferFormData.createLot}
                  onCheckedChange={(checked) => setTransferFormData(prev => ({ ...prev, createLot: checked as boolean }))}
                />
                <Label htmlFor="createEngraissementLot" className="font-normal cursor-pointer">
                  Créer automatiquement le lot d'Engraissement
                </Label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsTransferDialogOpen(false)} className="flex-1">
                  Annuler
                </Button>
                <Button type="submit" className="flex-1">
                  Valider le transfert
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Detail Dialog */}
        <Dialog open={!!detailLot} onOpenChange={(open) => !open && setDetailLot(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            {detailLot && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-display flex items-center gap-3">
                    <Scale className="h-6 w-6 text-primary" />
                    {detailLot.identification}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  {/* Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 rounded-xl bg-muted/50 text-center">
                      <p className="text-2xl font-bold text-foreground">{detailLot.nombreActuel}</p>
                      <p className="text-xs text-muted-foreground">Animaux</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50 text-center">
                      <p className="text-2xl font-bold text-foreground">{getLastWeight(detailLot.id) || detailLot.poidsEntree}</p>
                      <p className="text-xs text-muted-foreground">Poids actuel (kg)</p>
                    </div>
                    <div className="p-3 rounded-xl bg-success/10 text-center">
                      <p className="text-2xl font-bold text-success">{calculateGMQ(detailLot) || '-'}</p>
                      <p className="text-xs text-muted-foreground">GMQ (kg/j)</p>
                    </div>
                    <div className="p-3 rounded-xl bg-accent/10 text-center">
                      <p className="text-2xl font-bold text-accent">{calculateDaysToTarget(detailLot) ?? '-'}</p>
                      <p className="text-xs text-muted-foreground">Jours restants</p>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="h-64">
                    <h4 className="font-semibold text-foreground mb-3">Évolution du poids</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getPeseesForLot(detailLot.id).map(p => ({
                        date: format(new Date(p.date), 'd MMM', { locale: fr }),
                        poids: p.poidsMoyen,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        />
                        <YAxis 
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          domain={['dataMin - 5', 'dataMax + 10']}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                          }}
                          formatter={(value: number) => [`${value} kg`, 'Poids moyen']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="poids" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pesées list */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Historique des pesées</h4>
                    <div className="space-y-2">
                      {getPeseesForLot(detailLot.id).reverse().map((pesee) => (
                        <div key={pesee.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                          <span className="text-muted-foreground">
                            {format(new Date(pesee.date), 'd MMM yyyy', { locale: fr })}
                          </span>
                          <span className="font-semibold text-foreground">{pesee.poidsMoyen} kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Search */}
        <div className="relative animate-slide-up">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher par identification..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>

        {/* Lots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredLots.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-card rounded-2xl border border-border">
              <Scale className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Aucun lot de Post-Sevrage</p>
            </div>
          ) : (
            filteredLots.map((lot, index) => {
              const gmq = calculateGMQ(lot);
              const daysToTarget = calculateDaysToTarget(lot);
              const lastWeight = getLastWeight(lot.id);
              const progress = lastWeight ? Math.min(100, Math.round((lastWeight / lot.poidsCible) * 100)) : 0;

              return (
                <div
                  key={lot.id}
                  className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Scale className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{lot.identification}</p>
                        <p className="text-sm text-muted-foreground">
                          {lot.origine === 'sevrage' ? 'Sevrage' : 'Achat'}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border",
                      statusColors[lot.statut]
                    )}>
                      {statusLabels[lot.statut]}
                    </span>
                  </div>
                  
                  <div className="flex gap-1 absolute top-6 right-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(lot)}
                      className="h-8 w-8 text-muted-foreground hover:text-primary bg-card/80 backdrop-blur-sm"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(lot.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive bg-card/80 backdrop-blur-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium text-foreground">{lastWeight || lot.poidsEntree} / {lot.poidsCible} kg</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-muted/50 text-center">
                      <p className="text-lg font-bold text-foreground">{lot.nombreActuel}</p>
                      <p className="text-xs text-muted-foreground">Animaux</p>
                    </div>
                    <div className="p-3 rounded-xl bg-success/10 text-center">
                      <p className="text-lg font-bold text-success">{gmq || '-'}</p>
                      <p className="text-xs text-muted-foreground">GMQ (kg/j)</p>
                    </div>
                  </div>

                  {daysToTarget !== null && daysToTarget > 0 && (
                    <div className="flex items-center gap-2 text-accent mb-4 p-3 rounded-xl bg-accent/10">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Fin PS dans ~{daysToTarget} jours
                      </span>
                    </div>
                  )}

                  {daysToTarget === 0 && (
                    <div className="flex items-center gap-2 text-success mb-4 p-3 rounded-xl bg-success/10">
                      <Target className="h-4 w-4" />
                      <span className="text-sm font-medium">Objectif atteint !</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => setDetailLot(lot)}
                    >
                      <Eye className="h-4 w-4" />
                      Détails
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => openPeseeDialog(lot.id)}
                    >
                      <Scale className="h-4 w-4" />
                      Pesée
                    </Button>
                  </div>

                  {lot.statut === 'en_cours' && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <Button 
                        className="w-full gap-2" 
                        variant="secondary"
                        onClick={() => openTransferDialog(lot)}
                      >
                        <ArrowRight className="h-4 w-4" />
                        Transférer en Engraissement
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

export default PostSevrage;
