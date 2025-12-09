import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={className}
      title={resolvedTheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-5 w-5 transition-transform duration-300" />
      ) : (
        <Moon className="h-5 w-5 transition-transform duration-300" />
      )}
    </Button>
  );
};
