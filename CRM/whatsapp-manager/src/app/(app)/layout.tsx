'use client'
import AppShell from '@/components/layout/app-shell'
import { PeriodProvider } from '@/lib/dashboard-period-context'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PeriodProvider>
      <AppShell>{children}</AppShell>
    </PeriodProvider>
  )
}
