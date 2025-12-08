import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

interface RegisterFormProps {
  onToggleMode: () => void;
}

export const RegisterForm = ({ onToggleMode }: RegisterFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !pin || !confirmPin) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      toast.error('Le code PIN doit contenir 4 chiffres');
      return;
    }

    if (pin !== confirmPin) {
      toast.error('Les codes PIN ne correspondent pas');
      return;
    }

    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = register(email, pin, name);
    
    if (success) {
      toast.success('Compte créé avec succès !');
    } else {
      toast.error('Erreur lors de la création du compte');
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground/80 font-medium">
          Nom complet
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            placeholder="Jean Dupont"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-11 h-12 bg-background border-border focus:border-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground/80 font-medium">
          Adresse email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-11 h-12 bg-background border-border focus:border-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pin" className="text-foreground/80 font-medium">
          Code PIN (4 chiffres)
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="pin"
            type={showPin ? 'text' : 'password'}
            placeholder="••••"
            value={pin}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 4);
              setPin(value);
            }}
            maxLength={4}
            className="pl-11 pr-11 h-12 bg-background border-border focus:border-primary tracking-[0.5em] text-center font-mono"
          />
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPin" className="text-foreground/80 font-medium">
          Confirmer le code PIN
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="confirmPin"
            type={showPin ? 'text' : 'password'}
            placeholder="••••"
            value={confirmPin}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 4);
              setConfirmPin(value);
            }}
            maxLength={4}
            className="pl-11 h-12 bg-background border-border focus:border-primary tracking-[0.5em] text-center font-mono"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 text-base font-semibold"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Création...
          </div>
        ) : (
          'Créer mon compte'
        )}
      </Button>

      <div className="text-center">
        <p className="text-muted-foreground">
          Déjà un compte ?{' '}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-primary font-semibold hover:underline"
          >
            Se connecter
          </button>
        </p>
      </div>
    </form>
  );
};
