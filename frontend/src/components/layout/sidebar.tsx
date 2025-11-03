'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Package, Store, TrendingUp, Lightbulb, Wand2, HelpCircle, X, ChartPie, Menu } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useSidebar } from '@/store/sidebar-store'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Query Builder', href: '/dashboard/query-builder', icon: Wand2 },
  { name: 'Produtos', href: '/dashboard/products', icon: Package },
  { name: 'Canais', href: '/dashboard/channels', icon: TrendingUp },
  { name: 'Lojas', href: '/dashboard/stores', icon: Store },
  { name: 'Insights', href: '/dashboard/insights', icon: Lightbulb },
  { name: 'FAQ', href: '/dashboard/faq', icon: HelpCircle },
]

export function Sidebar() {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useSidebar()
  const pathname = usePathname()

  useEffect(() => {
    // Close mobile menu on route change
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sticky top-24 hidden h-fit w-[190px] self-start my-6 flex-col gap-4 md:flex" aria-label="Barra lateral">
        <nav className="group/nav shadow-gray-soft mx-auto flex w-16 flex-1 flex-col items-center space-y-2 rounded-[32px] bg-primary py-8 transition-all duration-500 ease-out hover:w-[190px]" aria-label="Navegação principal">
          <div className='mt-0 mb-24'>
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative mx-auto mb-2 flex h-10 w-10 items-center rounded-full p-2 text-sm font-medium transition-all duration-300 ease-out group-hover/nav:w-full group-hover/nav:rounded-xl ${
                    isActive
                      ? 'bg-background-secondary text-foreground'
                      : 'hover:bg-accent text-primary-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.name}
                >
                  <item.icon
                    className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out group-hover/nav:left-[14px] group-hover/nav:translate-x-0"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <span className="ml-10 whitespace-nowrap opacity-0 transition-opacity duration-300 ease-out group-hover/nav:opacity-100 group-hover/nav:delay-200">
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Theme Toggle at bottom */}
          <div className="mb-0 mt-auto flex h-10 w-10 items-center justify-center rounded-full bg-background p-2 text-foreground">
            <ThemeToggle />
          </div>
        </nav>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden animate-in fade-in-50 duration-300" onClick={closeMobileMenu}>
          <div className="fixed left-0 top-0 h-full w-72 bg-background shadow-2xl border-r animate-in slide-in-from-left-12 duration-300 ease-out" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent p-2 text-primary-foreground">
                    <ChartPie className="h-full w-full" />
                  </div>
                  <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Mise
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={closeMobileMenu} className="text-muted-foreground hover:bg-muted rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-4 px-6 py-3 rounded-r-full transition-all duration-200 group ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                      }`}
                      onClick={closeMobileMenu}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="flex-1">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Footer with Theme Toggle */}
              <div className="p-6 mt-auto">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <span className="text-sm font-medium text-muted-foreground">Tema</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
