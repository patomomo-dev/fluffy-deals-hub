import { createContext, useContext, useEffect, useState } from 'react';
import { localStorageService } from '@/services/localStorage.service';

interface AuthContextType {
  user: string | null;
  login: (email: string, password: string, token?: string) => boolean;
  logout: () => void;
  isAuthenticated: () => boolean;
  register: (email: string, password: string) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(storedUser);

    setLoading(false); // 🔥 Muy importante
  }, []);

  const login = (email: string, password: string, token?: string) => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', email);
      setUser(email);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  const register = (email: string, password: string): boolean => {
    const users = localStorageService.getUsers();

    if (users.some((u) => u.email === email)) {
      return false;
    }

    users.push({ email, password });
    localStorageService.saveUsers(users);
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext debe usarse dentro de un AuthProvider');
  return context;
};