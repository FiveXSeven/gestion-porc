import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  PiggyBank,
  Heart,
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
  FileText,
  ClipboardList
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAlertNotifications } from '@/contexts/AlertNotificationContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/alertes', icon: Bell, label: 'Alertes' },
  { to: '/truies', icon: PiggyBank, label: 'Truies' },
  { to: '/verrats', icon: PiggyBank, label: 'Verrats' },
  { to: '/saillies', icon: Heart, label: 'Saillies' },
  { to: '/portees', icon: PiggyBank, label: 'Portées' },
  { to: '/post-sevrage', icon: Layers, label: 'Post-Sevrage' },
  { to: '/engraissement', icon: Scale, label: 'Engraissement' },
  { to: '/sante', icon: HeartPulse, label: 'Santé' },
  { to: '/stock-aliment', icon: Package, label: 'Stock Aliment' },
  { to: '/ventes', icon: ShoppingCart, label: 'Ventes' },
  { to: '/depenses', icon: Receipt, label: 'Dépenses' },
  { to: '/tracabilite', icon: ClipboardList, label: 'Traçabilité' },
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
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-sidebar border border-sidebar-border text-sidebar-foreground shadow-sm"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col transform transition-transform duration-300 ease-in-out border-r border-sidebar-border",
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
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
              {/* Show notification badge for Alertes */}
              {item.to === '/alertes' && unreadCount > 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded-full text-xs font-bold bg-destructive text-destructive-foreground min-w-[18px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-sidebar-border bg-sidebar-accent/20">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/30">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center shrink-0">
              <span className="text-sidebar-primary-foreground font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Button
              variant="ghost"
              onClick={logout}
              className="flex-1 justify-start text-sm text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 h-9"
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
