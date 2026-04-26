import { useState } from 'react'
import { useNavigate } from 'react-router-dom' // Cambio: Vite usa React Router
import { AnimatedCanvas } from './AnimatedCanvas'
import { ThemeToggle } from '@/components/ThemeToggle' // Usamos el switch que creamos
import { useAuth } from '@/context/AuthContext'
import { UserRole, DEFAULT_USERS } from 'types/auth'
import { Button } from '@/components/ui/button'

const USERS = Object.values(DEFAULT_USERS).map(({ password, ...user }) => user)

export function LoginPage() {
  const navigate = useNavigate() // En lugar de useRouter
  const { login } = useAuth()
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleLogin = async () => {
    if (!selectedUser) return

    const user = USERS.find((u) => u.email === selectedUser)
    if (!user) return

    setIsLoggingIn(true)
    try {
      // Asumimos que tu AuthContext ahora maneja la persistencia en localStorage/Cookies
      await login(user.email, user.role as UserRole)
      navigate('/dashboard') // Cambio: navigate en lugar de router.push
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      setIsLoggingIn(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedUser && !isLoggingIn) {
      handleLogin()
    }
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-background text-foreground transition-colors duration-500">
      {/* Fondo Animado Optimizado */}
      <AnimatedCanvas />
      
      {/* Overlay de gradiente para mejorar legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />

      {/* El Switch de Tema que hicimos antes */}
      <ThemeToggle />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo / Título */}
        <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-7xl mb-4 drop-shadow-2xl">📊</div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">
            Sistema de Gestión
          </h1>
          <p className="text-muted-foreground text-lg italic">
            Bienvenido, selecciona tu perfil
          </p>
        </div>

        {/* Cartas de Selección de Usuario */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {USERS.map((user) => (
            <button
              key={user.email}
              onClick={() => setSelectedUser(selectedUser === user.email ? null : user.email)}
              onKeyDown={handleKeyPress}
              className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm ${
                selectedUser === user.email
                  ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.3)] scale-105'
                  : 'border-border bg-card/50 hover:border-primary/40 hover:bg-card'
              }`}
            >
              <div className="text-6xl mb-4 group-hover:rotate-12 transition-transform">
                {user.avatar}
              </div>
              <h3 className="text-xl font-bold mb-1">{user.name}</h3>
              <p className="text-sm text-muted-foreground">
                {user.role === 'admin' && 'Administración y Stock'}
                {user.role === 'secretary' && 'Atención y Reportes'}
                {user.role === 'master' && 'Análisis y Auditoría'}
              </p>

              {selectedUser === user.email && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Acción de Entrada */}
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={handleLogin}
            disabled={!selectedUser || isLoggingIn}
            className="w-64 h-12 text-lg font-bold shadow-xl hover:scale-105 transition-transform"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Cargando...
              </span>
            ) : (
              'Entrar al Sistema'
            )}
          </Button>
          <p className="text-xs text-muted-foreground uppercase tracking-widest opacity-70">
            Acceso Directo • Modo Demo
          </p>
        </div>
      </div>
    </div>
  )
}