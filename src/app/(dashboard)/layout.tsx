'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Header } from '@/components/layout/header'
import { useRealtimeHabits, useRealtimeJournal, useRealtimeExpenses } from '@/hooks/use-realtime-habits'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Enable realtime sync for all data
  useRealtimeHabits()
  useRealtimeJournal()
  useRealtimeExpenses()

  return (
    <div className="h-screen flex">
      <aside className="hidden md:flex w-72 flex-col fixed inset-y-0">
        <Sidebar />
      </aside>
      <div className="flex-1 md:pl-72">
        <Header />
        <main className="container py-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
