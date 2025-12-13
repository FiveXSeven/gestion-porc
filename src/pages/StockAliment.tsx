import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { getStockAliments, addStockAliment, updateStockAliment, deleteStockAliment } from '@/lib/storage';
import { StockAliment } from '@/types';
import { Plus, Package, AlertTriangle, Edit2, Trash2, Search, Minus, ArrowDown, ArrowUp } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const StockAlimentPage = () => {
  const [stocks, setStocks] = useState<StockAliment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    type: '',
    quantite: '',
    poidsSac: '40', // Default to 40kg
  });
  const [search, setSearch] = useState('');
  const [editingStock, setEditingStock] = useState<StockAliment | null>(null);

  // Movement state
  const [movementDialog, setMovementDialog] = useState<{
    isOpen: boolean;
    type: 'add' | 'remove';
    stock: StockAliment | null;
  }>({
    isOpen: false,
    type: 'add',
    stock: null,
  });
  const [movementAmount, setMovementAmount] = useState('');

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = () => {
    setStocks(getStockAliments());
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      type: '',
      quantite: '',
      poidsSac: '40',
    });
    setEditingStock(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.type || !formData.quantite) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const newStockData = {
      nom: formData.nom,
      type: formData.type,
      quantite: parseInt(formData.quantite),
      poidsSac: parseInt(formData.poidsSac) as 25 | 40,
      dateMiseAJour: new Date().toISOString().split('T')[0],
    };

    if (editingStock) {
      updateStockAliment(editingStock.id, newStockData);
      toast.success('Stock modifié avec succès');
    } else {
      const newStock: StockAliment = {
        id: Date.now().toString(),
        ...newStockData,
      };
      
      addStockAliment(newStock);
      toast.success('Stock ajouté avec succès');
    }

    loadStocks();
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (stock: StockAliment) => {
    setEditingStock(stock);
    setFormData({
      nom: stock.nom,
      type: stock.type,
      quantite: stock.quantite.toString(),
      poidsSac: stock.poidsSac.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce stock ?')) {
      deleteStockAliment(id);
      loadStocks();
      toast.success('Stock supprimé');
    }
  };

  const openMovementDialog = (stock: StockAliment, type: 'add' | 'remove') => {
    setMovementDialog({
      isOpen: true,
      type,
      stock,
    });
    setMovementAmount('');
  };

  const handleMovementSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!movementDialog.stock || !movementAmount) return;

      const amount = parseInt(movementAmount);
      if (isNaN(amount) || amount <= 0) {
          toast.error('Veuillez entrer une quantité valide');
          return;
      }

      const currentQty = movementDialog.stock.quantite;
      let newQty = currentQty;

      if (movementDialog.type === 'add') {
          newQty = currentQty + amount;
      } else {
          if (amount > currentQty) {
              toast.error('Quantité insuffisante en stock');
              return;
          }
          newQty = currentQty - amount;
      }

      updateStockAliment(movementDialog.stock.id, {
          quantite: newQty,
          dateMiseAJour: new Date().toISOString().split('T')[0],
      });

      toast.success(movementDialog.type === 'add' ? 'Stock renforcé' : 'Sacs retirés du stock');
      setMovementDialog({ isOpen: false, type: 'add', stock: null });
      loadStocks();
  };

  const filteredStocks = stocks.filter(stock => 
    stock.nom.toLowerCase().includes(search.toLowerCase()) ||
    stock.type.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockItems = stocks.filter(s => s.quantite < 5);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Stock Aliment</h1>
            <p className="text-muted-foreground mt-1">Gérez vos stocks d'aliments et sacs</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-5 w-5" />
                Nouveau Stock
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingStock ? 'Modifier le stock' : 'Ajouter du stock'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom de l'aliment *</Label>
                  <Input
                    id="nom"
                    placeholder="Ex: Croissance Porc"
                    value={formData.nom}
                    onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Input
                      id="type"
                      placeholder="Ex: Croissance"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="poidsSac">Poids du sac *</Label>
                    <Select
                      value={formData.poidsSac}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, poidsSac: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25 kg</SelectItem>
                        <SelectItem value="40">40 kg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantite">Quantité (Sacs) *</Label>
                  <Input
                    id="quantite"
                    type="number"
                    placeholder="Ex: 10"
                    value={formData.quantite}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantite: e.target.value }))}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingStock ? 'Modifier' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

            {/* Movement Dialog */}
            <Dialog open={movementDialog.isOpen} onOpenChange={(open) => setMovementDialog(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{movementDialog.type === 'add' ? 'Renforcer le stock' : 'Retirer des sacs'}</DialogTitle>
                        <DialogDescription>
                            {movementDialog.stock?.nom} - Actuellement: {movementDialog.stock?.quantite} sacs
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleMovementSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="movement-qty">Quantité de sacs à {movementDialog.type === 'add' ? 'ajouter' : 'retirer'}</Label>
                            <Input
                                id="movement-qty"
                                type="number"
                                min="1"
                                autoFocus
                                value={movementAmount}
                                onChange={(e) => setMovementAmount(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setMovementDialog(prev => ({ ...prev, isOpen: false }))}>Annuler</Button>
                            <Button type="submit" variant={movementDialog.type === 'remove' ? 'destructive' : 'default'}>Confirmer</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

        {/* Alerts for Low Stock */}
        {lowStockItems.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive">Attention : Stock Faible</h3>
              <p className="text-sm text-destructive/80 mt-1">
                {lowStockItems.length} aliment(s) ont un stock inférieur à 5 sacs. Pensez à réapprovisionner.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-sm font-medium text-muted-foreground">Total Sacs</p>
                 <h3 className="text-2xl font-bold mt-2">{stocks.reduce((acc, curr) => acc + curr.quantite, 0)}</h3>
               </div>
               <div className="p-2 bg-primary/10 rounded-lg text-primary">
                 <Package className="h-5 w-5" />
               </div>
             </div>
           </div>
           
           <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-sm font-medium text-muted-foreground">Alertes Stock</p>
                 <h3 className="text-2xl font-bold mt-2">{lowStockItems.length}</h3>
               </div>
               <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
                 <AlertTriangle className="h-5 w-5" />
               </div>
             </div>
           </div>
        </div>

        {/* Search */}
        <div className="relative animate-slide-up">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>

        {/* List */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Nom</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Type</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Poids Sac</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Quantité</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Dernière MAJ</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStocks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">Aucun stock enregistré</p>
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((stock, index) => (
                    <tr 
                      key={stock.id} 
                      className={`hover:bg-muted/30 transition-colors animate-fade-in ${stock.quantite < 5 ? 'bg-destructive/5' : ''}`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="py-4 px-6 font-medium text-foreground">
                        {stock.nom}
                        {stock.quantite < 5 && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-destructive/10 text-destructive">
                            Stock bas
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">{stock.type}</td>
                      <td className="py-4 px-6 text-muted-foreground">{stock.poidsSac} kg</td>
                      <td className="py-4 px-6 font-semibold text-foreground">
                        <span className={stock.quantite < 5 ? "text-destructive" : ""}>
                          {stock.quantite} sacs
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">
                        {format(new Date(stock.dateMiseAJour), "d MMM yyyy", { locale: fr })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                         <div className="flex items-center mr-4 bg-muted/50 rounded-lg p-1">
                              <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openMovementDialog(stock, 'remove')}
                                  className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                  title="Retirer stock"
                              >
                                  <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openMovementDialog(stock, 'add')}
                                  className="h-7 w-7 text-primary hover:bg-primary/10"
                                  title="Ajouter stock"
                              >
                                  <ArrowUp className="h-4 w-4" />
                              </Button>
                         </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(stock)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(stock.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
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

export default StockAlimentPage;
