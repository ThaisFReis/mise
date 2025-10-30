'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-lg bg-muted/50 animate-pulse" />
    )
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } 
    else {
      setTheme('light')
    }
  }

  const getCurrentIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />
      case 'dark':
        return <Moon className="h-5 w-5" />
      default:
        return <Sun className="h-5 w-5" />
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Modo claro'
      case 'dark':
        return 'Modo escuro'
      default:
        return 'Tema'
    }
  }

  return (
    <button
      onClick={cycleTheme}
      className="relative rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
      aria-label={getThemeLabel()}
      title={getThemeLabel()}
    >
      {getCurrentIcon()}
    </button>
  )
}
