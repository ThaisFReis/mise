import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}