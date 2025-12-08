import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getSaillies, addSaillie, getTruies, getVerrats, updateTruie } from '@/lib/storage';
import { Saillie, Truie, Verrat } from '@/types';
import { Plus, Heart, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const statusLabels: Record<Saillie['statut'], string> = {
  en_attente: 'En attente',
  confirmee: 'Confirmée',
  echouee: 'Échouée',
};

const statusColors: Record<Saillie['statut'], string> = {
  en_attente: 'bg-warning/10 text-warning border-warning/20',
  confirmee: 'bg-success/10 text-success border-success/20',
  echouee: 'bg-destructive/10 text-destructive border-destructive/20',
};

const Saillies = () => {
  const [saillies, setSaillies] = useState<Saillie[]>([]);
  const [truies, setTruies] = useState<Truie[]>([]);
  const [verrats, setVerrats] = useState<Verrat[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    truieId: '',
    verratId: '',
    date: '',
    methode: 'naturelle' as Saillie['methode'],
    employe: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSaillies(getSaillies());
    setTruies(getTruies());
    setVerrats(getVerrats());
  };

  const resetForm = () => {
    setFormData({
      truieId: '',
      verratId: '',
      date: '',
      methode: 'naturelle',
      employe: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.truieId || !formData.verratId || !formData.date) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Calculate expected farrowing date (114 days gestation)
    const saillieDate = new Date(formData.date);
    const datePrevueMiseBas = format(addDays(saillieDate, 114), 'yyyy-MM-dd');

    const newSaillie: Saillie = {
      id: Date.now().toString(),
      ...formData,
      datePrevueMiseBas,
      statut: 'en_attente',
    };
    
    addSaillie(newSaillie);
    
    // Update truie status
    updateTruie(formData.truieId, { statut: 'gestante' });
    
    toast.success('Saillie enregistrée avec succès');
    loadData();
    setIsDialogOpen(false);
    resetForm();
  };

  const availableTruies = truies.filter(t => t.statut === 'active');
  const activeVerrats = verrats.filter(v => v.statut === 'actif');

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Saillies</h1>
            <p className="text-muted-foreground mt-1">Suivez les saillies et dates de mise bas prévues</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2" variant="accent">
                <Plus className="h-5 w-5" />
                Enregistrer une saillie
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">Nouvelle saillie</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="truieId">Truie *</Label>
                  <Select
                    value={formData.truieId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, truieId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une truie" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTruies.map(truie => (
                        <SelectItem key={truie.id} value={truie.id}>
                          {truie.identification}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verratId">Verrat *</Label>
                  <Select
                    value={formData.verratId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, verratId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un verrat" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeVerrats.map(verrat => (
                        <SelectItem key={verrat.id} value={verrat.id}>
                          {verrat.identification}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date de saillie *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="methode">Méthode</Label>
                    <Select
                      value={formData.methode}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, methode: value as Saillie['methode'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="naturelle">Naturelle</SelectItem>
                        <SelectItem value="insemination">Insémination</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employe">Employé responsable</Label>
                  <Input
                    id="employe"
                    placeholder="Nom de l'employé"
                    value={formData.employe}
                    onChange={(e) => setFormData(prev => ({ ...prev, employe: e.target.value }))}
                  />
                </div>
                {formData.date && (
                  <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                    <div className="flex items-center gap-2 text-accent">
                      <Calendar className="h-5 w-5" />
                      <span className="font-medium">Date prévue de mise bas</span>
                    </div>
                    <p className="mt-1 text-foreground font-semibold">
                      {format(addDays(new Date(formData.date), 114), "d MMMM yyyy", { locale: fr })}
                    </p>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" variant="accent" className="flex-1">
                    Enregistrer
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {saillies.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-card rounded-2xl border border-border">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Aucune saillie enregistrée</p>
            </div>
          ) : (
            saillies.map((saillie, index) => {
              const truie = truies.find(t => t.id === saillie.truieId);
              const verrat = verrats.find(v => v.id === saillie.verratId);
              
              return (
                <div
                  key={saillie.id}
                  className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Heart className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{truie?.identification}</p>
                        <p className="text-sm text-muted-foreground">× {verrat?.identification}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border",
                      statusColors[saillie.statut]
                    )}>
                      {statusLabels[saillie.statut]}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date saillie</span>
                      <span className="font-medium text-foreground">
                        {format(new Date(saillie.date), "d MMM yyyy", { locale: fr })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Méthode</span>
                      <span className="font-medium text-foreground capitalize">{saillie.methode}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Employé</span>
                      <span className="font-medium text-foreground">{saillie.employe || '-'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-accent mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Mise bas prévue</span>
                    </div>
                    <p className="font-semibold text-foreground">
                      {format(new Date(saillie.datePrevueMiseBas), "d MMMM yyyy", { locale: fr })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Saillies;
