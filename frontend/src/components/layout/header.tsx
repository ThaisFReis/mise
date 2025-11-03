'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Search, User, ChartPie, Menu } from 'lucide-react'
import { SearchModal } from './search-modal'
import { useSidebar } from '@/store/sidebar-store'
import { Button } from '../ui/button'

export function Header() {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useSidebar()
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <>
      <header
        className={`sticky top-0 z-30 flex h-20 w-full items-center justify-between px-4 transition-all duration-300 md:px-8 ${
          isScrolled ? 'border-b bg-background/80 backdrop-blur-sm' : 'bg-transparent'
        }`}
        role="banner"
      >
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Logo */}
          <Link href="/" className="group hidden items-center gap-2 md:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background-secondary p-2 text-primary shadow-gray-soft transition-transform group-hover:scale-110">
              <ChartPie className="h-full w-full" />
            </div>
            <span className="w-0 origin-left scale-x-0 bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-bold text-transparent transition-all duration-300 group-hover:w-auto group-hover:scale-x-100">
              Mise
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="hidden md:flex">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-background-secondary p-2 text-muted-foreground shadow-gray-soft transition-colors hover:text-foreground"
              aria-label="Buscar (Ctrl+K)"
              title="Buscar (Ctrl+K)"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <button
            className="flex items-center space-x-3 pl-3"
            aria-label="Menu do usuário - Maria Silva"
            title="Menu do usuário"
          >
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-gray-soft">
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
