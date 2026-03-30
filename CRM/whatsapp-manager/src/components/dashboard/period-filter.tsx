'use client'
import { useState } from 'react'
import { Period, periodLabel } from '@/lib/dashboard-period-context'

const QUICK = [
  { label: '7d', days: 7 },
  { label: '15d', days: 15 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
]

interface Props {
  period: Period
  onChange: (p: Period) => void
}

export default function PeriodFilter({ period, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const isCustom = !!(period.from && period.to)

  function applyCustom() {
    if (from && to) {
      onChange({ from, to })
      setOpen(false)
    }
  }

  return (
    <div className="relative flex items-center gap-1">
      {/* Quick period buttons */}
      {QUICK.map(q => {
        const active = !isCustom && period.days === q.days
        return (
          <button
            key={q.days}
            onClick={() => { onChange({ days: q.days }); setOpen(false) }}
            className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
            style={{
              background: active ? '#080D2F' : '#F0F2F5',
              color: active ? '#00FF85' : '#8B8FA8',
              border: active ? '1px solid #080D2F' : '1px solid #E8EAED',
            }}
          >
            {q.label}
          </button>
        )
      })}

      {/* Custom range button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
        style={{
          background: isCustom ? '#080D2F' : '#F0F2F5',
          color: isCustom ? '#00FF85' : '#8B8FA8',
          border: isCustom ? '1px solid #080D2F' : '1px solid #E8EAED',
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        {isCustom ? periodLabel(period) : 'Personalizado'}
      </button>

      {/* Date range dropdown */}
      {open && (
        <div
          className="absolute top-full right-0 mt-1 rounded-xl shadow-xl p-4 z-50 flex flex-col gap-3"
          style={{ background: '#fff', border: '1px solid #E8EAED', minWidth: 260 }}
        >
          <p className="text-xs font-semibold" style={{ color: '#080D2F' }}>Selecionar período</p>
          <div className="flex flex-col gap-2">
            <label className="text-xs" style={{ color: '#8B8FA8' }}>
              De
              <input
                type="date"
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="mt-0.5 w-full px-2 py-1.5 rounded-lg text-xs"
                style={{ border: '1px solid #E8EAED', outline: 'none', color: '#080D2F', display: 'block' }}
              />
            </label>
            <label className="text-xs" style={{ color: '#8B8FA8' }}>
              Até
              <input
                type="date"
                value={to}
                onChange={e => setTo(e.target.value)}
                min={from}
                className="mt-0.5 w-full px-2 py-1.5 rounded-lg text-xs"
                style={{ border: '1px solid #E8EAED', outline: 'none', color: '#080D2F', display: 'block' }}
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={applyCustom}
              disabled={!from || !to}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-opacity"
              style={{ background: '#080D2F', color: '#00FF85', opacity: from && to ? 1 : 0.4 }}
            >
              Aplicar
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: '#F0F2F5', color: '#8B8FA8' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
