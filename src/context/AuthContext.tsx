import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser } from '@/api/userService';

export type Role = 'admin' | 'master' | 'empleado';

export interface User {
  email: string;
  role: Role;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await loginUser({ email, password });

      if (data.access) {
        const newUser: User = {
          email,
          role: data.access as Role,
          // Extrae el nombre después de "Bienvenido "
          name: data.message.split(' ').slice(1).join(' ') || 'Usuario',
        };

        setUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        return { success: true, message: data.message };
      }
      return { success: false, message: "Respuesta de acceso inválida" };
    } catch (error: any) {
      return { success: false, message: error.message || "Error de conexión" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};