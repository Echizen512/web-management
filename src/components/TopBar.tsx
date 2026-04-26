'use client'

import { useAuth } from '@/context/AuthContext'
import { useTheme } from 'next-themes'
import { Menu } from 'lucide-react'

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()

  if (!user) return null

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <button
        onClick={onMenuClick}
        className="p-2 hover:bg-accent rounded-lg transition-colors lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user.role === 'master' ? 'Master' : user.role === 'admin' ? 'Administrador' : 'Secretaria'}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
