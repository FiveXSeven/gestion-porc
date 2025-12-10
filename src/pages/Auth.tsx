import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Warehouse } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-sidebar relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-sidebar-primary rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-20 w-96 h-96 bg-sidebar-primary rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-sidebar-primary flex items-center justify-center">
              <Warehouse className="h-9 w-9 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-4xl text-sidebar-foreground">PorcGestion</h1>
              <p className="text-sidebar-foreground/60">Application de gestion porcine</p>
            </div>
          </div>
          
          <h2 className="font-display text-5xl xl:text-6xl font-bold text-sidebar-foreground leading-tight mb-6">
            Gérez votre élevage<br />
            <span className="text-sidebar-primary">simplement</span>
          </h2>
          
          <p className="text-lg text-sidebar-foreground/70 max-w-lg mb-12">
            Suivez vos truies, gérez les saillies et portées, contrôlez vos finances - 
            tout en un seul endroit pour optimiser votre production porcine.
          </p>

          <div className="grid grid-cols-3 gap-6">
            {[
              { value: '100%', label: 'Automatisé' },
              { value: 'Simple', label: 'À utiliser' },
              { value: 'Complet', label: 'Suivi' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-sidebar-accent/50">
                <p className="font-display font-bold text-2xl text-sidebar-primary">{stat.value}</p>
                <p className="text-sm text-sidebar-foreground/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Warehouse className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="font-display font-bold text-2xl text-foreground">PorcGestion</h1>
          </div>

          <div className="bg-card rounded-3xl border border-border p-8 shadow-card animate-scale-in">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold text-foreground">
                {isLogin ? 'Connexion' : 'Créer un compte'}
              </h2>
              <p className="text-muted-foreground mt-2">
                {isLogin
                  ? 'Accédez à votre tableau de bord'
                  : 'Commencez à gérer votre élevage'}
              </p>
            </div>

            {isLogin ? (
              <LoginForm onToggleMode={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onToggleMode={() => setIsLogin(true)} />
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Données stockées localement sur votre appareil
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
