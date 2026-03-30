'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

export interface Period {
  days?: number
  from?: string
  to?: string
}

interface PeriodContextValue {
  period: Period
  setPeriod: (p: Period) => void
}

const PeriodContext = createContext<PeriodContextValue>({
  period: { days: 7 },
  setPeriod: () => {},
})

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<Period>({ days: 7 })
  return (
    <PeriodContext.Provider value={{ period, setPeriod }}>
      {children}
    </PeriodContext.Provider>
  )
}

export function usePeriod() {
  return useContext(PeriodContext)
}

export function periodToQuery(p: Period): string {
  if (p.from && p.to) return `from=${p.from}&to=${p.to}`
  return `days=${p.days ?? 7}`
}

export function periodLabel(p: Period): string {
  if (p.from && p.to) {
    const fmt = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    return `${fmt(p.from)} – ${fmt(p.to)}`
  }
  const map: Record<number, string> = { 7: 'Últimos 7 dias', 15: 'Últimos 15 dias', 30: 'Últimos 30 dias', 90: 'Últimos 90 dias' }
  return map[p.days ?? 7] ?? `Últimos ${p.days} dias`
}
