import Link from 'next/link'
import { UtensilsCrossed, Home, BarChart3, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        {/* Icon and Error Code */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <UtensilsCrossed
                className="relative w-24 h-24 text-primary animate-pulse"
                strokeWidth={1.5}
              />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-8xl font-bold tracking-tighter bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              404
            </h1>
            <h2 className="text-3xl font-bold tracking-tight">
              Página Não Encontrada
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Ops! Parece que esta página não está no menu. Ela pode ter sido movida ou não existe mais.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/dashboard">
              <BarChart3 className="w-4 h-4" />
              Ir para o Dashboard
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              Página Inicial
            </Link>
          </Button>
        </div>

        {/* Helpful Links Card */}
        <Card className="border-2 hover:border-primary/50 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl">Páginas Úteis</CardTitle>
            <CardDescription>
              Aqui estão algumas sugestões de onde você pode ir:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/dashboard"
                className="group flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200"
              >
                <BarChart3 className="w-5 h-5 text-primary" />
                <div className="text-left flex-1">
                  <p className="font-medium text-sm">Dashboard</p>
                  <p className="text-xs text-muted-foreground">Visão geral</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors rotate-180" />
              </Link>

              <Link
                href="/dashboard/query-builder"
                className="group flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200"
              >
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <div className="text-left flex-1">
                  <p className="font-medium text-sm">Query Builder</p>
                  <p className="text-xs text-muted-foreground">Consultas personalizadas</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors rotate-180" />
              </Link>

              <Link
                href="/dashboard/products"
                className="group flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200"
              >
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <div className="text-left flex-1">
                  <p className="font-medium text-sm">Produtos</p>
                  <p className="text-xs text-muted-foreground">Análise de produtos</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors rotate-180" />
              </Link>

              <Link
                href="/dashboard/insights"
                className="group flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200"
              >
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <div className="text-left flex-1">
                  <p className="font-medium text-sm">Insights</p>
                  <p className="text-xs text-muted-foreground">Inteligência de dados</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors rotate-180" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer Message */}
        <p className="text-sm text-muted-foreground">
          Se você acredita que isso é um erro, entre em contato com o suporte.
        </p>
      </div>
    </div>
  )
}
