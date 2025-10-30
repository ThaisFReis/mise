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
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}