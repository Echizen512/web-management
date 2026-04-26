import { Link, useLocation } from 'react-router-dom' 
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  Users,
  Package,
  FileText,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Role = 'admin' | 'secretary' | 'master'

const menuItems: Record<Role, { icon: any; label: string; href: string }[]> = {
  admin: [
    { icon: Users, label: 'Usuarios', href: '/dashboard/users' },
    { icon: Package, label: 'Productos', href: '/dashboard/products' },
    { icon: FileText, label: 'Generar Excel', href: '/dashboard/export' },
  ],
  secretary: [
    { icon: FileText, label: 'Consultas', href: '/dashboard/queries' },
    { icon: FileText, label: 'Generar Excel', href: '/dashboard/export' },
  ],
  master: [
    { icon: Users, label: 'Usuarios', href: '/dashboard/users' },
    { icon: Package, label: 'Productos', href: '/dashboard/products' },
    { icon: FileText, label: 'Generar Excel', href: '/dashboard/export' },
    { icon: BarChart3, label: 'Gráficas', href: '/dashboard/charts' },
    { icon: Activity, label: 'Bitácora', href: '/dashboard/logs' },
  ],
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const { user, logout } = useAuth()
  const { pathname } = useLocation() 

  if (!user) return null

  const role = user.role as Role
  const items = menuItems[role] || []

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-64 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0',
          !open && '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">SG</h1>
          <button
            onClick={() => onOpenChange(false)}
            className="lg:hidden p-1 hover:bg-accent rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">
                {role === 'master' ? 'Master' : role === 'admin' ? 'Administrador' : 'Secretaria'}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                to={item.href} // 'to' en lugar de 'href'
                onClick={() => window.innerWidth < 1024 && onOpenChange(false)} // Cerrar al hacer click en móvil
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={logout}
            className="w-full px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 border border-transparent rounded-lg transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Toggle flotante para móvil */}
      {!open && (
        <button
          onClick={() => onOpenChange(true)}
          className="fixed bottom-6 left-6 z-40 p-3 bg-primary text-primary-foreground rounded-full shadow-lg lg:hidden"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </>
  )
}