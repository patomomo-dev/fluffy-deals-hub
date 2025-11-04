import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import pawLogo from '@/assets/paw-logo.png';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { SettingsPanel } from '@/components/SettingsPanel';
import { useToast } from "@/components/ui/use-toast";

export const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Sesión cerrada",
      description: "Has salido correctamente de tu cuenta.",
    });
  };

  const navItems = [
    { name: 'Productos', path: '/admin/promotions', key: 'productos' },
    { name: 'Promociones', path: '/admin/promotions', key: 'promociones' }
  ];

  return (
    <header className="fixed top-0 left-16 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <img src={pawLogo} alt="PetStore" className="w-8 h-8" />
          <span className="text-xl font-bold text-primary">PetStore</span>
        </Link>

        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === item.path
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <SettingsPanel />

        <Link to="/admin/promotions">
          <Button variant="ghost" size="icon" className="text-primary hover:bg-accent">
            <ShoppingCart size={20} />
          </Button>
        </Link>

        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{user}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary hover:bg-accent">
              Salir
            </Button>
          </div>
        ) : (
          <Link to="/login">
            <Button variant="ghost" size="icon" className="text-primary hover:bg-accent">
              <User size={20} />
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};