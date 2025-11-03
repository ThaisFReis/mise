'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Package, Store, TrendingUp, FileText, Lightbulb, Wand2, HelpCircle } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

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
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <aside className={`sticky top-24 self-start flex h-fit w-[190px] my-6 flex-col gap-4`} aria-label="Barra lateral">


      {/* Navigation */}
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
                onClick={() => setIsOpen(false)}
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
  )
}
