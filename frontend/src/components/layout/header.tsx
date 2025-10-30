'use client'

import { Bell, Search, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function Header() {
  return (
    <header className="flex h-fit items-center justify-between p-8">

      <div className="flex items-center space-x-4 mr-0 ml-auto">
        <button className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
          <Search className="h-5 w-5" />
        </button>

        <button className="relative rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <div className="flex items-center space-x-3 pl-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent">
            <User className="h-full w-full p-2 text-primary-foreground" />
          </div>
          <div className="hidden md:flex flex-col">
            <p className="text-sm font-medium text-foreground">Masud A.</p>
            <p className="text-xs text-muted-foreground">Student</p>
          </div>
        </div>
      </div>
    </header>
  )
}