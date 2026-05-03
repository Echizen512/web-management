import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { LogOut, Menu, X, Moon, Sun, LayoutDashboard, Users, Package, FileText, BarChart3, Layers, Search } from 'lucide-react'
import { UsersPage } from './dashboard/UsersPage'
import { ProductsPage } from './dashboard/ProductsPage'
import { ExportPage } from './dashboard/ExportPage'
import { QueriesPage } from './dashboard/QueriesPage'
import { ChartsPage } from './dashboard/ChartsPage'
import { LogsPage } from './dashboard/LogsPage'

export function Dashboard() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentPage, setCurrentPage] = useState('home')

  const getMenuItems = () => {
    const baseItems = [
      { id: 'home', label: 'Inicio', icon: LayoutDashboard },
    ]

    if (user?.role === 'admin' || user?.role === 'master') {
      baseItems.push({ id: 'users', label: 'Usuarios', icon: Users })
      baseItems.push({ id: 'products', label: 'Productos', icon: Package })
      baseItems.push({ id: 'export', label: 'Exportar', icon: FileText })
    }

    if (user?.role === 'empleado') {
      baseItems.push({ id: 'queries', label: 'Consultas', icon: Search })
      baseItems.push({ id: 'export', label: 'Exportar', icon: FileText })
    }

    if (user?.role === 'master') {
      baseItems.push({ id: 'charts', label: 'Gráficas', icon: BarChart3 })
      baseItems.push({ id: 'logs', label: 'Bitácora', icon: Layers })
    }

    return baseItems
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'users':
        return <UsersPage />
      case 'products':
        return <ProductsPage />
      case 'export':
        return <ExportPage />
      case 'queries':
        return <QueriesPage />
      case 'charts':
        return <ChartsPage />
      case 'logs':
        return <LogsPage />
      default:
        return <HomePage />
    }
  }

  const menuItems = getMenuItems()

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 border-r border-border overflow-hidden flex flex-col bg-background`}
      >
        <div className="p-6 border-b border-border">
          <h1 className="text-lg font-bold text-foreground">SG</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-foreground hover:bg-muted transition-colors"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span>{theme === 'light' ? 'Tema Oscuro' : 'Tema Claro'}</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={20} />
            <span>Salir</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-background px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-foreground hover:text-accent transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="text-xl font-semibold text-foreground">
              {menuItems.find((m) => m.id === currentPage)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name} ({user?.role})
            </span>
            <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

function HomePage() {
  const { user } = useAuth()

  return (
    <div className="max-w-4xl">
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-8 mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          ¡Bienvenido, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Estás conectado como {user?.role.toUpperCase()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-background border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-2">Perfil: {user?.role}</h3>
          <p className="text-sm text-muted-foreground">
            {user?.role === 'admin' && 'Tienes acceso completo para gestionar usuarios y productos.'}
            {user?.role === 'empleado' && 'Puedes consultar datos y generar reportes.'}
            {user?.role === 'master' && 'Tienes acceso total incluyendo gráficas y bitácora.'}
          </p>
        </div>

        <div className="bg-background border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-2">Email</h3>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>
    </div>
  )
}
