'use client'

import Link from 'next/link'
import { ChartPie, Mail, ExternalLink, Github } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const navigationLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Query Builder', href: '/dashboard/query-builder' },
    { name: 'Produtos', href: '/dashboard/products' },
    { name: 'Canais', href: '/dashboard/channels' },
    { name: 'Lojas', href: '/dashboard/stores' },
    { name: 'Insights', href: '/dashboard/insights' },
  ]

  const usefulLinks = [
    { name: 'Sobre', href: '#' },
    { name: 'FAQ', href: '/dashboard/faq' },
    { name: 'Documentação', href: '#' },
  ]

  return (
    <footer className="border-t border-border bg-background-secondary w-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-gray-soft transition-transform group-hover:scale-110">
                <ChartPie className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Mise
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Plataforma completa de analytics para operações de restaurantes.
              Transforme dados em insights acionáveis.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Navegação
            </h3>
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    {link.name}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Links Úteis
            </h3>
            <ul className="space-y-2">
              {usefulLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    {link.name}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Fique por Dentro
            </h3>
            <p className="text-sm text-muted-foreground">
              Acesse o repositório do projeto no GitHub para acompanhar o
              desenvolvimento.
            </p>
            <div className="space-y-2">
              <a
                href="https://github.com/ThaisFReis/mise"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-accent font-medium transition-colors duration-200"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                Ver no GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              &copy; {currentYear} Mise Analytics. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
