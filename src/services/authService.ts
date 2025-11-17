export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In production, this would be hashed
  role: 'admin' | 'user';
}

export interface Session {
  userId: string;
  email: string;
  name: string;
  role: string;
}

const USERS_KEY = 'petstore:users';
const SESSION_KEY = 'petstore:session';

class AuthService {
  private getUsers(): User[] {
    try {
      const data = localStorage.getItem(USERS_KEY);
      if (!data) {
        // Initialize with default admin user
        const defaultUsers: User[] = [
          {
            id: '1',
            name: 'Admin',
            email: 'admin@petstore.com',
            password: 'admin123',
            role: 'admin',
          },
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
        return defaultUsers;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading users:', error);
      return [];
    }
  }

  login(email: string, password: string): { success: boolean; user?: Session; error?: string } {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return { success: false, error: 'Credenciales inválidas' };
    }

    const session: Session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  }

  getSession(): Session | null {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading session:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }
}

export const authService = new AuthService();