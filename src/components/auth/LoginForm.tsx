import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onToggleMode: () => void;
}

export const LoginForm = ({ onToggleMode }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !pin) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      toast.error('Le code PIN doit contenir 4 chiffres');
      return;
    }

    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(email, pin);
    
    if (success) {
      toast.success('Connexion réussie !');
    } else {
      toast.error('Email ou code PIN incorrect');
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <Button 
        type="submit" 
        className="w-full h-12 text-base font-semibold"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Connexion...
          </div>
        ) : (
          'Se connecter'
        )}
      </Button>

      <div className="text-center">
        <p className="text-muted-foreground">
          Pas encore de compte ?{' '}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-primary font-semibold hover:underline"
          >
            Créer un compte
          </button>
        </p>
      </div>
    </form>
  );
};
