'use client'

import { useState, useEffect } from 'react'
import { Bell, Search, User, ChartPie } from 'lucide-react'
import { SearchModal } from './search-modal'

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Global keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <header
        className="flex h-fit w-screen items-center justify-between pb-6 pr-8 pt-8"
        role="banner"
      >
        <div className="w-[190px]">
          {' '}
          {/* Logo */}
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-background-secondary p-3 text-primary shadow-gray-soft"
            aria-hidden="true"
          >
            <ChartPie className="h-full w-full" />
          </div>{' '}
        </div>

        <div className="ml-auto mr-0 flex items-center space-x-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background-secondary p-2 text-muted-foreground shadow-gray-soft transition-colors hover:text-foreground"
            aria-label="Buscar (Ctrl+K)"
            title="Buscar (Ctrl+K)"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>

          {/*        <button
          className="relative p-2 text-muted-foreground hover:text-foreground transition-colors shadow-gray-soft mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background-secondary"
          aria-label="Notificações - 1 nova notificação"
          title="Notificações"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" aria-hidden="true"></span>
          <span className="sr-only">1 nova notificação</span>
        </button>*/}

          <button
            className="flex items-center space-x-3 pl-3"
            aria-label="Menu do usuário - Maria Silva"
            title="Menu do usuário"
          >
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-gray-soft">
              <User className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="hidden flex-col md:flex">
              <p className="text-sm font-medium text-foreground">Maria Silva</p>
              <p className="text-xs text-muted-foreground">Administradora</p>
            </div>
          </button>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
