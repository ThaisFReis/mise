import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s - Restaurant Analytics',
    default: 'Dashboard - Restaurant Analytics',
  },
  description: 'Sistema de analytics para restaurantes',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
      >
        Pular para o conteúdo  principal
      </a>

      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main id="main-content" className="flex-1 my-6 w-full mx-4 md:mx-8" role="main" aria-label="Conteúdo principal">
              {children}
        </main>
      </div>
      <Footer />
    </div>
  )
}