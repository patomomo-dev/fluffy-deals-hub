import { localStorageService } from '@/services/localStorage.service';

export const useAuth = () => {
  const login = (email: string, password: string, token?: string) => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', email);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  const register = (email: string, password: string): boolean => {
    const users = localStorageService.getUsers();

    // Check if user already exists
    if (users.find((u) => u.email === email)) {
      return false;
    }

    users.push({ email, password });
    localStorageService.saveUsers(users);
    return true;
  };

  return { login, logout, isAuthenticated, register };
};