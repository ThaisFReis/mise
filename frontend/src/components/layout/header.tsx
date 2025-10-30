'use client'

import { Bell, Search, User } from 'lucide-react'

export function Header() {
  return (
    <header className="flex h-fit items-center justify-between pt-8 pb-6">

      <div className="flex items-center space-x-4 mr-0 ml-auto">
        <button className="text-muted-foreground hover:text-foreground transition-colors shadow-gray-soft mx-auto flex h-12 w-12 items-center justify-center rounded-full p-2 bg-background-secondary">
          <Search className="h-5 w-5" />
        </button>

        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors shadow-gray-soft mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background-secondary">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <div className="flex items-center space-x-3 pl-3">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent items-center justify-center text-primary-foreground flex shadow-gray-soft">
            <User className="h-5 w-5" />
          </div>
          <div className="hidden md:flex flex-col">
            <p className="text-sm font-medium text-foreground">Maria Silva</p>
            <p className="text-xs text-muted-foreground">Administradora</p>
          </div>
        </div>
      </div>
    </header>
  )
}