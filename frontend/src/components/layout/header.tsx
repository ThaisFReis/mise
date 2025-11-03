'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, User, ChartPie } from 'lucide-react'
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
        className="hidden h-fit w-screen items-center justify-between pb-6 pr-8 pt-8 md:flex"
        role="banner"
      >
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-4">
          <div
            className="ml-16 flex h-14 w-14 items-center justify-center rounded-full bg-background-secondary p-3 text-primary shadow-gray-soft transition-transform group-hover:scale-110"
            aria-hidden="true"
          >
            <ChartPie className="h-full w-full" aria-hidden="true" />
          </div>
          <span className="w-0 -translate-x-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-2xl font-bold text-transparent opacity-0 transition-all duration-700 ease-out group-hover:w-auto group-hover:translate-x-0 group-hover:opacity-100">
            Mise
          </span>
        </Link>

        <div className="ml-auto mr-0 flex items-center space-x-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background-secondary p-2 text-muted-foreground shadow-gray-soft transition-colors hover:text-foreground"
            aria-label="Buscar (Ctrl+K)"
            title="Buscar (Ctrl+K)"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>

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
