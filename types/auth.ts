export type UserRole = 'admin' | 'secretary' | 'master'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, role: UserRole) => Promise<void>
  logout: () => void
}

// Usuarios predeterminados
export const DEFAULT_USERS: Record<string, User & { password?: string }> = {
  'admin@system.com': {
    id: '1',
    name: 'Administrador',
    email: 'admin@system.com',
    role: 'admin',
    password: 'admin123',
    avatar: '👨‍💼',
  },
  'secretary@system.com': {
    id: '2',
    name: 'Secretaria',
    email: 'secretary@system.com',
    role: 'secretary',
    password: 'secretary123',
    avatar: '👩‍💼',
  },
  'master@system.com': {
    id: '3',
    name: 'Master',
    email: 'master@system.com',
    role: 'master',
    password: 'master123',
    avatar: '👨‍💻',
  },
}
