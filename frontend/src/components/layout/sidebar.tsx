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
      <nav className="group/nav shadow-gray-soft mx-auto flex w-fit h-fit flex-1 flex-col items-center space-y-2 rounded-full bg-primary px-3 py-8 transition duration-500 ease-in-out hover:rounded-2xl" aria-label="Navegação principal">
        <div className='mt-0 mb-24'>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-full p-2 text-sm font-medium transition-all duration-500 ease-in-out mb-2 ${
                  isActive
                    ? 'bg-background-secondary text-foreground'
                    : 'hover:bg-accent text-primary-foreground'
                } group-hover/nav:w-full group-hover/nav:justify-start group-hover/nav:gap-3 group-hover/nav:rounded-xl group-hover/nav:px-4`}
                onClick={() => setIsOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.name}
              >
                <item.icon
                  className="h-5 w-5 flex-shrink-0 transition-all duration-500 ease-in-out"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span className="group-hover/nav:duration-400 pointer-events-none absolute whitespace-nowrap opacity-0 transition-opacity duration-150 ease-out group-hover/nav:pointer-events-auto group-hover/nav:static group-hover/nav:opacity-100 group-hover/nav:delay-100">
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Theme Toggle at bottom */}
        <div className="mb-0 mt-auto flex items-center justify-center p-2 bg-background text-foreground rounded-full h-10 w-10" aria-label="Alternar tema">
          <ThemeToggle />
        </div>
      </nav>
    </aside>
  )
}
