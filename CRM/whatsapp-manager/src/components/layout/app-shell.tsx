'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Kanban, MessageSquare, Users, Send,
  CheckSquare, Bot, Settings, Bell,
} from 'lucide-react'
import { usePeriod } from '@/lib/dashboard-period-context'
import PeriodFilter from '@/components/dashboard/period-filter'

const NAV_MAIN = [
  { href: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'      },
  { href: '/pipeline',      icon: Kanban,           label: 'Pipeline'       },
  { href: '/conversas',     icon: MessageSquare,    label: 'Conversas'      },
  { href: '/contatos',      icon: Users,            label: 'Contatos'       },
  { href: '/campanhas',     icon: Send,             label: 'Campanhas'      },
  { href: '/tarefas',       icon: CheckSquare,      label: 'Tarefas'        },
]

const NAV_BOTTOM = [
  { href: '/config-ia',      icon: Bot,      label: 'Config IA'      },
  { href: '/configuracoes',  icon: Settings, label: 'Configurações'  },
]

const MODULE_TITLES: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/pipeline':     'Pipeline',
  '/conversas':    'Conversas',
  '/contatos':     'Contatos',
  '/campanhas':    'Campanhas',
  '/tarefas':      'Tarefas',
  '/config-ia':    'Config IA',
  '/configuracoes':'Configurações',
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isConversas = pathname.startsWith('/conversas')
  const isDashboard = pathname.startsWith('/dashboard')
  const { period, setPeriod } = usePeriod()

  const title = Object.entries(MODULE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? 'MUVX CRM'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F0F2F5' }}>

      {/* ── Sidebar ── */}
      <nav
        className="flex flex-col items-center py-3 gap-0.5 flex-shrink-0 z-20"
        style={{ width: 64, background: '#080D2F' }}
      >
        {/* Logo */}
        <div className="mb-4 mt-1 flex items-center justify-center" style={{ width: 40, height: 40 }}>
          <img src="/logo-symbol.png" alt="MUVX" style={{ width: 32, height: 32, objectFit: 'contain' }} />
        </div>

        {/* Main nav */}
        {NAV_MAIN.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className="relative flex items-center justify-center rounded-lg transition-colors group"
              style={{
                width: 40, height: 40,
                background: active ? 'rgba(0,255,133,0.15)' : 'transparent',
                borderLeft: active ? '3px solid #00FF85' : '3px solid transparent',
                marginLeft: -3,
              }}
            >
              <Icon
                size={19}
                style={{ stroke: active ? '#00FF85' : 'rgba(255,255,255,0.4)', strokeWidth: 1.75 }}
              />
              {/* Tooltip */}
              <span
                className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  left: 52, top: '50%', transform: 'translateY(-50%)',
                  background: '#1a2050', color: '#fff',
                  fontSize: 12, fontWeight: 500,
                  padding: '4px 10px', borderRadius: 6,
                  whiteSpace: 'nowrap', zIndex: 999,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  transitionDelay: '0.35s',
                }}
              >
                {label}
              </span>
            </Link>
          )
        })}

        <div style={{ height: 1, width: 36, background: 'rgba(255,255,255,0.08)', margin: '6px 0' }} />

        {/* Bottom nav */}
        {NAV_BOTTOM.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className="relative flex items-center justify-center rounded-lg transition-colors group"
              style={{
                width: 40, height: 40,
                background: active ? 'rgba(0,255,133,0.15)' : 'transparent',
                borderLeft: active ? '3px solid #00FF85' : '3px solid transparent',
                marginLeft: -3,
              }}
            >
              <Icon
                size={19}
                style={{ stroke: active ? '#00FF85' : 'rgba(255,255,255,0.4)', strokeWidth: 1.75 }}
              />
              <span
                className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  left: 52, top: '50%', transform: 'translateY(-50%)',
                  background: '#1a2050', color: '#fff',
                  fontSize: 12, fontWeight: 500,
                  padding: '4px 10px', borderRadius: 6,
                  whiteSpace: 'nowrap', zIndex: 999,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  transitionDelay: '0.35s',
                }}
              >
                {label}
              </span>
            </Link>
          )
        })}

        <div className="flex-1" />

        {/* Bell + Avatar */}
        <div className="relative mb-1" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Bell size={19} style={{ stroke: 'rgba(255,255,255,0.4)', strokeWidth: 1.75 }} />
          <span style={{
            position: 'absolute', top: 2, right: 2, width: 14, height: 14,
            background: '#FF4444', borderRadius: '50%', fontSize: 9, fontWeight: 700,
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid #080D2F',
          }}>3</span>
        </div>
        <div style={{
          width: 34, height: 34, borderRadius: '50%', background: '#1a2050',
          color: '#fff', fontSize: 11, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', border: '1.5px solid rgba(255,255,255,0.1)',
          marginBottom: 4,
        }}>
          AN
        </div>
      </nav>

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Topbar — hidden on conversas (has its own header) */}
        {!isConversas && (
          <header
            className="flex items-center gap-3 px-5 flex-shrink-0"
            style={{
              height: 56, background: '#fff',
              borderBottom: '1px solid #E8EAED',
              zIndex: 10,
            }}
          >
            <span className="flex-1 text-base font-bold" style={{ color: '#080D2F', letterSpacing: '-0.3px' }}>
              {title}
            </span>
            <div className="flex items-center gap-2">
              {isDashboard ? (
                <PeriodFilter period={period} onChange={setPeriod} />
              ) : null}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: '#080D2F', color: '#fff' }}
              >
                AN
              </div>
            </div>
          </header>
        )}

        {/* Page content — each module manages its own layout */}
        <div className="flex flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>
}
