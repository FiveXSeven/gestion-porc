import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  PiggyBank,
  Heart,
  Baby,
  ShoppingCart,
  Receipt,
  Bell,
  LogOut,
  Menu,
  X,
  Warehouse,
  Scale,
  Layers,
  Package,
  HeartPulse,
  FileText
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAlertNotifications } from '@/contexts/AlertNotificationContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/alertes', icon: Bell, label: 'Alertes' },
  { to: '/truies', icon: PiggyBank, label: 'Truies' },
  { to: '/saillies', icon: Heart, label: 'Saillies' },
  { to: '/portees', icon: Baby, label: 'Portées' },
  { to: '/post-sevrage', icon: Layers, label: 'Post-Sevrage' },
  { to: '/engraissement', icon: Scale, label: 'Engraissement' },
  { to: '/sante', icon: HeartPulse, label: 'Santé' },
  { to: '/stock-aliment', icon: Package, label: 'Stock Aliment' },
  { to: '/ventes', icon: ShoppingCart, label: 'Ventes' },
  { to: '/depenses', icon: Receipt, label: 'Dépenses' },
  { to: '/rapports', icon: FileText, label: 'Rapports' },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useAlertNotifications();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar text-sidebar-foreground shadow-lg"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-sidebar text-sidebar-foreground flex flex-col transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Warehouse className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-sidebar-foreground">PorcGestion</h1>
              <p className="text-xs text-sidebar-foreground/60">Gestion</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
              {/* Show notification badge for Alertes */}
              {item.to === '/alertes' && unreadCount > 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded text-xs font-bold bg-destructive text-destructive-foreground min-w-[18px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/50">
            <div className="w-8 h-8 rounded bg-sidebar-primary flex items-center justify-center shrink-0">
              <span className="text-sidebar-primary-foreground font-semibold text-xs">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="ghost"
              onClick={logout}
              className="flex-1 justify-start text-xs text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 h-8"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
};
