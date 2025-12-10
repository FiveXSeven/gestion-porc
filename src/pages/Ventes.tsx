import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getVentes, addVente } from '@/lib/storage';
import { Vente } from '@/types';
import { Plus, ShoppingCart, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const typeLabels: Record<Vente['typeAnimal'], string> = {
  porcelet: 'Porcelet',
  porc_engraissement: 'Porc d\'engraissement',
  truie_reforme: 'Truie réformée',
  verrat_reforme: 'Verrat réformé',
};

const Ventes = () => {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    typeAnimal: 'porc_engraissement' as Vente['typeAnimal'],
    quantite: '',
    poidsTotal: '',
    prixUnitaire: '',
    acheteur: '',
    notes: '',
  });

  useEffect(() => {
    loadVentes();
  }, []);

  const loadVentes = () => {
    setVentes(getVentes());
  };

  const resetForm = () => {
    setFormData({
      date: '',
      typeAnimal: 'porc_engraissement',
      quantite: '',
      poidsTotal: '',
      prixUnitaire: '',
      acheteur: '',
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.quantite || !formData.prixUnitaire) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const quantite = parseInt(formData.quantite);
    const prixUnitaire = parseFloat(formData.prixUnitaire);

    const newVente: Vente = {
      id: Date.now().toString(),
      date: formData.date,
      typeAnimal: formData.typeAnimal,
      quantite,
      poidsTotal: parseFloat(formData.poidsTotal) || 0,
      prixUnitaire,
      prixTotal: quantite * prixUnitaire,
      acheteur: formData.acheteur,
      notes: formData.notes,
    };
    
    addVente(newVente);
    toast.success('Vente enregistrée avec succès');
    loadVentes();
    setIsDialogOpen(false);
    resetForm();
  };

  const totalRecettes = ventes.reduce((sum, v) => sum + v.prixTotal, 0);
  const totalAnimaux = ventes.reduce((sum, v) => sum + v.quantite, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Ventes</h1>
            <p className="text-muted-foreground mt-1">Enregistrez et suivez vos ventes</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2" variant="success">
                <Plus className="h-5 w-5" />
                Nouvelle vente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">Enregistrer une vente</DialogTitle>
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
                    <Label htmlFor="typeAnimal">Type d'animal</Label>
                    <Select
                      value={formData.typeAnimal}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, typeAnimal: value as Vente['typeAnimal'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantite">Quantité *</Label>
                    <Input
                      id="quantite"
                      type="number"
                      placeholder="10"
                      value={formData.quantite}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantite: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="poidsTotal">Poids total (kg)</Label>
                    <Input
                      id="poidsTotal"
                      type="number"
                      placeholder="1150"
                      value={formData.poidsTotal}
                      onChange={(e) => setFormData(prev => ({ ...prev, poidsTotal: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prixUnitaire">Prix unitaire (FCFA) *</Label>
                  <Input
                    id="prixUnitaire"
                    type="number"
                    step="0.01"
                    placeholder="180"
                    value={formData.prixUnitaire}
                    onChange={(e) => setFormData(prev => ({ ...prev, prixUnitaire: e.target.value }))}
                  />
                </div>
                {formData.quantite && formData.prixUnitaire && (
                  <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                    <p className="text-sm text-success font-medium">Total de la vente</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(parseInt(formData.quantite) * parseFloat(formData.prixUnitaire)).toLocaleString()} FCFA
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="acheteur">Acheteur</Label>
                  <Input
                    id="acheteur"
                    placeholder="Nom de l'acheteur"
                    value={formData.acheteur}
                    onChange={(e) => setFormData(prev => ({ ...prev, acheteur: e.target.value }))}
                  />
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
                  <Button type="submit" variant="success" className="flex-1">
                    Enregistrer
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up">
          <div className="bg-success/10 rounded-2xl border border-success/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-6 w-6 text-success" />
              <span className="text-sm font-medium text-muted-foreground">Total des recettes</span>
            </div>
            <p className="text-3xl font-display font-bold text-foreground">{totalRecettes.toLocaleString()} FCFA</p>
          </div>
          <div className="bg-info/10 rounded-2xl border border-info/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="h-6 w-6 text-info" />
              <span className="text-sm font-medium text-muted-foreground">Animaux vendus</span>
            </div>
            <p className="text-3xl font-display font-bold text-foreground">{totalAnimaux}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Type</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Quantité</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Prix unit.</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Total</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Acheteur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ventes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">Aucune vente enregistrée</p>
                    </td>
                  </tr>
                ) : (
                  ventes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((vente, index) => (
                    <tr 
                      key={vente.id} 
                      className="hover:bg-muted/30 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="py-4 px-6 text-foreground">
                        {format(new Date(vente.date), "d MMM yyyy", { locale: fr })}
                      </td>
                      <td className="py-4 px-6 text-foreground">{typeLabels[vente.typeAnimal]}</td>
                      <td className="py-4 px-6 text-foreground font-medium">{vente.quantite}</td>
                      <td className="py-4 px-6 text-foreground">{vente.prixUnitaire} FCFA</td>
                      <td className="py-4 px-6 font-semibold text-success">{vente.prixTotal.toLocaleString()} FCFA</td>
                      <td className="py-4 px-6 text-muted-foreground">{vente.acheteur || '-'}</td>
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

export default Ventes;
