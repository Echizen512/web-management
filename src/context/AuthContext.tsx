import React, { createContext, useContext, useState } from 'react'

export type Role = 'admin' | 'secretary' | 'master'

export interface User {
  id: string
  email: string
  role: Role
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const CREDENTIALS = {
  'admin@system.com': { password: 'admin123', role: 'admin' as Role, name: 'Administrador' },
  'secretary@system.com': { password: 'admin123', role: 'secretary' as Role, name: 'Secretaria' },
  'master@system.com': { password: 'admin123', role: 'master' as Role, name: 'Master' },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, password: string): Promise<boolean> => {
    const cred = CREDENTIALS[email as keyof typeof CREDENTIALS]
    if (!cred || cred.password !== password) {
      return false
    }

    const newUser: User = {
      id: email,
      email,
      role: cred.role,
      name: cred.name,
    }
    setUser(newUser)
    localStorage.setItem('currentUser', JSON.stringify(newUser))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('currentUser')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
