import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext' 
import { AnimatedCanvas } from '@/components/AnimatedCanvas'
import { Mail, Lock, AlertCircle, LayoutDashboard, Sun, Moon } from 'lucide-react' 
import { Button } from '@/components/ui/button'

export function LoginPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme() 
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        navigate('/dashboard') 
      } else {
        setError('Email o contraseña incorrectos')
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden flex items-center justify-center">
      
      <div className="absolute top-6 right-6 z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full bg-card/50 backdrop-blur-md border-border/50 hover:bg-accent transition-all"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </Button>
      </div>

      <div className="absolute inset-0 z-0">
        <AnimatedCanvas />
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-transparent to-background/80" />
      </div>

      <div className="relative z-10 w-full max-w-[440px] px-6 animate-in fade-in zoom-in duration-500">
        <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-10 shadow-2xl shadow-black/20">
          
          <div className="text-center mb-2">
            <div className="inline-flex p-4 rounded-2xl bg-primary/10 text-primary">
              <LayoutDashboard size={24} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Bienvenido
            </h1>
            <p className="text-muted-foreground mt-2">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Correo Electrónico</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@sistema.com"
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl animate-in slide-in-from-top-2">
                <AlertCircle className="text-destructive" size={20} />
                <span className="text-sm font-medium text-destructive">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/40 hover:shadow-primary/80 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Verificando...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Aplicación Web • 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}