'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, User } from 'lucide-react'
import { useSidebar } from '@/store/sidebar-store'
import { Button } from '../ui/button'

export function MobileHeader() {
  const { setIsMobileMenuOpen } = useSidebar()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-30 flex h-16 w-full items-center justify-between px-4 transition-all duration-300 md:hidden ${
        isScrolled ? ' bg-white/80 backdrop-blur-3xl shadow-gray-soft' : 'bg-transparent'
      }`}
      role="banner"
    >
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Abrir menu"
        className='flex h-fit w-fit items-center justify-center rounded-full bg-background-secondary p-3 text-primary shadow-inner'
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Logo */}
      <Link href="/" className="group flex items-center gap-2">
        <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Mise
        </span>
      </Link>

      {/* User Icon */}
      <button aria-label="Menu do usuário" title="Menu do usuário">
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <User className="h-5 w-5" />
        </div>
      </button>
    </header>
  )
}