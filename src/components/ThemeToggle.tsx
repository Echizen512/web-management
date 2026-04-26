import { useEffect, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Moon, Sun } from 'lucide-react' // Opcional: para iconos

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    const root = window.document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-background/80 p-3 rounded-full border shadow-xl backdrop-blur-md">
      <Sun className="h-4 w-4 text-orange-500" />
      <Switch 
        checked={isDark} 
        onCheckedChange={setIsDark} 
        aria-label="Toggle dark mode"
      />
      <Moon className="h-4 w-4 text-blue-400" />
    </div>
  )
}