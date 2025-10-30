'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Package, Store, TrendingUp, FileText, Settings, ChartPie } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Produtos', href: '/dashboard/products', icon: Package },
  { name: 'Canais', href: '/dashboard/channels', icon: TrendingUp },
  { name: 'Lojas', href: '/dashboard/stores', icon: Store },
  { name: 'Relatórios', href: '/dashboard/reports', icon: FileText },
  { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Sidebar - Compact vertical */}
      <div className={`flex h-full w-52 flex-col gap-4 py-8`}>
        {/* Logo */}
        <div className="shadow-gray-soft mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-background p-3 text-primary">
          <ChartPie className="h-full w-full" />
        </div>

        {/* Navigation */}
        <nav className="group/nav shadow-gray-soft mx-auto flex w-fit flex-1 flex-col items-center space-y-2 rounded-full bg-primary px-3 py-8 transition duration-500 ease-in-out hover:rounded-2xl">
          <div className='mt-0 mb-auto'>
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-full p-2 text-sm font-medium transition-all duration-500 ease-in-out ${
                    isActive
                      ? 'bg-background text-foreground'
                      : 'hover:bg-primary-foreground/10 text-primary-foreground'
                  } group-hover/nav:w-full group-hover/nav:justify-start group-hover/nav:gap-3 group-hover/nav:rounded-xl group-hover/nav:px-4`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon
                    className="h-5 w-5 flex-shrink-0 transition-all duration-500 ease-in-out"
                    strokeWidth={2}
                  />
                  <span className="group-hover/nav:duration-400 pointer-events-none absolute whitespace-nowrap opacity-0 transition-opacity duration-150 ease-out group-hover/nav:pointer-events-auto group-hover/nav:static group-hover/nav:opacity-100 group-hover/nav:delay-100">
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Theme Toggle at bottom */}
          <div className="mb-0 mt-auto flex items-center justify-center p-2 bg-background text-foreground rounded-full h-10 w-10">
            <ThemeToggle />
          </div>
        </nav>
      </div>

      {/* Mobile menu button - Only on mobile */}
      <button
        className="fixed left-4 top-4 z-50 rounded-full bg-foreground p-3 text-background shadow-xl md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <BarChart3 className="h-5 w-5" />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
