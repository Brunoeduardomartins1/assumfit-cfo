'use client'
import { useState, useEffect } from 'react'
import { AlertTriangle, Users, MessageSquare, TrendingUp, UserCheck, UserX, PhoneCall,
  DollarSign, Activity, ShoppingCart, RefreshCw } from 'lucide-react'
import { PeriodProvider, usePeriod, periodToQuery, periodLabel } from '@/lib/dashboard-period-context'
import PeriodFilter from '@/components/dashboard/period-filter'

interface DashboardData {
  total_contacts: number
  messages_sent_today: number
  messages_received_today: number
  response_rate: number
  interest_count: number
  converted_count: number
  sem_interesse_count: number
  precisa_humano_count: number
  needs_human: Array<{ id: string; contact: { name: string; phone: string }; last_message_at: string }>
  conversions_by_camada: Array<{ camada: number; count: number }>
  status_breakdown: Array<{ label: string; value: number; color: string }>
  pipeline_cols: { lead: number; cadastrou: number; ativo: number; retencao: number }
  active_campaigns: Array<{ id: string; name: string; status: string; sent_count: number; total_contacts: number; speed_per_day: number }>
}

interface MuvxData {
  period: { from: string; to: string }
  totalUsers: number
  totalStudents: number
  totalPersonals: number
  activeUsers: number
  activeSubscriptions: number
  inactiveUsers: number
  admins: number
  usersGrowthLastMonth: number
  studentsGrowthLastMonth: number
  personalsGrowthLastMonth: number
  crefVerified: number
  crefPending: number
  purchasesInPeriod: number
  purchasesTotalInPeriod: number
  revenueInPeriod: number
  purchasesByStatus: Record<string, number>
  recentPurchases: Array<{
    id: string
    studentName: string
    personalName: string
    amount: number
    status: string
    createdAt: string | null
    paymentMethod: string | null
  }>
}

function DonutChart({ data }: { data: Array<{ label: string; value: number; color: string }> }) {
  const r = 48, cx = 64, cy = 64, stroke = 22
  const circ = 2 * Math.PI * r
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return (
    <svg viewBox="0 0 128 128" className="w-32 h-32 flex-shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E8EAED" strokeWidth={stroke} />
      <text x={cx} y={cy+4} textAnchor="middle" fontSize="11" fill="#8B8FA8">Sem dados</text>
    </svg>
  )
  let offset = 0
  return (
    <svg viewBox="0 0 128 128" className="w-32 h-32 flex-shrink-0">
      {data.map(d => {
        const pct = d.value / total
        const dash = pct * circ
        const el = (
          <circle key={d.label} cx={cx} cy={cy} r={r} fill="none"
            stroke={d.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`} />
        )
        offset += dash
        return el
      })}
      <text x={cx} y={cy-4} textAnchor="middle" fontSize="18" fontWeight="800" fill="#080D2F">{total.toLocaleString('pt-BR')}</text>
      <text x={cx} y={cy+12} textAnchor="middle" fontSize="9" fill="#8B8FA8">contatos</text>
    </svg>
  )
}

function fmt(n: number) { return n.toLocaleString('pt-BR') }
function fmtBRL(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
function fmtPct(n: number, decimals = 1) { return `${n.toFixed(decimals)}%` }

const STATUS_COLORS: Record<string, string> = {
  APPROVED: '#00C853',
  ACTIVE: '#00FF85',
  PENDING_APPROVAL: '#FFB800',
  PENDING: '#FFB800',
  CANCELLED: '#FF4444',
  REJECTED: '#FF4444',
  OVERDUE: '#FF6B35',
}
const STATUS_LABELS: Record<string, string> = {
  APPROVED: 'Aprovado',
  ACTIVE: 'Ativo',
  PENDING_APPROVAL: 'Aguardando',
  PENDING: 'Pendente',
  CANCELLED: 'Cancelado',
  REJECTED: 'Rejeitado',
  OVERDUE: 'Em atraso',
}

function DashboardInner() {
  const { period, setPeriod } = usePeriod()
  const [data, setData] = useState<DashboardData | null>(null)
  const [muvx, setMuvx] = useState<MuvxData | null>(null)
  const [loading, setLoading] = useState(true)
  const [muvxLoading, setMuvxLoading] = useState(true)
  const [muvxError, setMuvxError] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/metrics/dashboard')
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  async function loadMuvx(p = period) {
    setMuvxLoading(true)
    setMuvxError(null)
    try {
      const res = await fetch(`/api/muvx/metrics?${periodToQuery(p)}`)
      if (res.ok) {
        setMuvx(await res.json())
      } else {
        const err = await res.json().catch(() => ({}))
        setMuvxError(err.error ?? `Erro ${res.status}`)
      }
    } catch (e: any) {
      setMuvxError(e.message ?? 'Erro de conexão')
    } finally {
      setMuvxLoading(false)
    }
  }

  useEffect(() => {
    load()
    const iv = setInterval(load, 30000)
    return () => clearInterval(iv)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadMuvx(period)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period.days, period.from, period.to])

  const d = data

  const kpis = [
    {
      label: 'Total Contatos',
      value: d?.total_contacts?.toLocaleString('pt-BR') ?? '—',
      sub: 'importados do AC',
      icon: <Users size={18} style={{ stroke: '#6366f1' }} />,
      bg: 'rgba(99,102,241,0.08)',
    },
    {
      label: 'Mensagens Hoje',
      value: d ? `${d.messages_sent_today}↑ / ${d.messages_received_today}↓` : '—',
      sub: 'enviadas / recebidas',
      icon: <MessageSquare size={18} style={{ stroke: '#00C853' }} />,
      bg: 'rgba(0,200,83,0.08)',
    },
    {
      label: 'Com Interesse',
      value: d?.interest_count?.toLocaleString('pt-BR') ?? '—',
      sub: `${d && d.total_contacts > 0 ? ((d.interest_count / d.total_contacts) * 100).toFixed(1) : 0}% do total`,
      icon: <TrendingUp size={18} style={{ stroke: '#00FF85' }} />,
      bg: 'rgba(0,255,133,0.08)',
    },
    {
      label: 'Convertidos',
      value: d?.converted_count?.toLocaleString('pt-BR') ?? '—',
      sub: `${d && d.total_contacts > 0 ? ((d.converted_count / d.total_contacts) * 100).toFixed(1) : 0}% do total`,
      icon: <UserCheck size={18} style={{ stroke: '#4F46E5' }} />,
      bg: 'rgba(79,70,229,0.08)',
    },
    {
      label: 'Sem Interesse',
      value: d?.sem_interesse_count?.toLocaleString('pt-BR') ?? '—',
      sub: `${d && d.total_contacts > 0 ? ((d.sem_interesse_count / d.total_contacts) * 100).toFixed(1) : 0}% do total`,
      icon: <UserX size={18} style={{ stroke: '#FF4444' }} />,
      bg: 'rgba(255,68,68,0.08)',
    },
    {
      label: 'Precisa Humano',
      value: d?.precisa_humano_count?.toLocaleString('pt-BR') ?? '—',
      sub: 'aguardando atendimento',
      icon: <PhoneCall size={18} style={{ stroke: '#FFB800' }} />,
      bg: 'rgba(255,184,0,0.08)',
    },
  ]

  const pipeline = d?.pipeline_cols
  const pipelineTotal = pipeline ? Object.values(pipeline).reduce((s, v) => s + v, 0) : 0
  const PIPE_COLS = [
    { key: 'lead',      label: 'Lead',      color: '#8B8FA8' },
    { key: 'cadastrou', label: 'Cadastrou', color: '#00C853' },
    { key: 'ativo',     label: 'Ativo',     color: '#00FF85' },
    { key: 'retencao',  label: 'Retenção',  color: '#4F46E5' },
  ] as const

  // MUVX KPI cards
  const muvxKpis = muvx ? [
    {
      label: 'Usuários Ativos',
      value: fmt(muvx.activeUsers),
      sub: `${fmt(muvx.totalUsers)} total cadastrados`,
      icon: <Activity size={18} style={{ stroke: '#00FF85' }} />,
      bg: 'rgba(0,255,133,0.08)',
      highlight: true,
    },
    {
      label: 'Alunos',
      value: fmt(muvx.totalStudents),
      sub: `+${fmt(muvx.studentsGrowthLastMonth)} no último mês`,
      icon: <Users size={18} style={{ stroke: '#4F46E5' }} />,
      bg: 'rgba(79,70,229,0.08)',
      highlight: false,
    },
    {
      label: 'Personal Trainers',
      value: fmt(muvx.totalPersonals),
      sub: `+${fmt(muvx.personalsGrowthLastMonth)} no último mês`,
      icon: <UserCheck size={18} style={{ stroke: '#00C853' }} />,
      bg: 'rgba(0,200,83,0.08)',
      highlight: false,
    },
    {
      label: 'Compras no Período',
      value: fmt(muvx.purchasesInPeriod),
      sub: `${periodLabel(period)} · Total: ${fmt(muvx.purchasesTotalInPeriod)}`,
      icon: <ShoppingCart size={18} style={{ stroke: '#6366f1' }} />,
      bg: 'rgba(99,102,241,0.08)',
      highlight: false,
    },
    {
      label: 'Receita no Período',
      value: fmtBRL(muvx.revenueInPeriod),
      sub: periodLabel(period),
      icon: <DollarSign size={18} style={{ stroke: '#FFB800' }} />,
      bg: 'rgba(255,184,0,0.08)',
      highlight: false,
    },
    {
      label: 'Novos Usuários',
      value: `+${fmt(muvx.usersGrowthLastMonth)}`,
      sub: `último mês · ${fmt(muvx.inactiveUsers)} inativos`,
      icon: <TrendingUp size={18} style={{ stroke: '#00C853' }} />,
      bg: 'rgba(0,200,83,0.08)',
      highlight: false,
    },
  ] : []

  // Purchases status chart data
  const statusEntries = muvx
    ? Object.entries(muvx.purchasesByStatus).sort((a, b) => b[1] - a[1])
    : []
  const maxStatus = statusEntries.length > 0 ? Math.max(...statusEntries.map(e => e[1])) : 1

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#F0F2F5' }}>

      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: '#E8EAED' }}>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: '#080D2F', letterSpacing: '-0.5px' }}>Dashboard</h1>
          <p className="text-xs mt-0.5" style={{ color: '#8B8FA8' }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodFilter period={period} onChange={setPeriod} />
          <button onClick={() => { load(); loadMuvx(period) }} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
            style={{ background: '#F0F2F5', color: '#8B8FA8' }}>
            <RefreshCw size={12} /> Atualizar
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#E8EAED', borderTopColor: '#00C853' }} />
        </div>
      )}

      {!loading && (
        <div className="p-6 flex flex-col gap-4">

          {/* Alert humanos */}
          {(d?.needs_human?.length ?? 0) > 0 && (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-lg"
              style={{ background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.2)' }}>
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#DC2626' }}>
                <AlertTriangle size={14} />
                {d!.needs_human.length} conversa{d!.needs_human.length > 1 ? 's' : ''} aguardando atendimento humano
              </div>
              <a href="/conversas" className="text-xs font-bold" style={{ color: '#DC2626' }}>Ver todas →</a>
            </div>
          )}

          {/* KPIs CRM */}
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {kpis.map(k => (
              <div key={k.label} className="rounded-xl p-4 bg-white" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#8B8FA8' }}>{k.label}</div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: k.bg }}>{k.icon}</div>
                </div>
                <div className="text-2xl font-extrabold" style={{ color: '#080D2F', letterSpacing: '-0.5px' }}>{k.value}</div>
                <div className="text-[11px] mt-1" style={{ color: '#8B8FA8' }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Pipeline + Status breakdown */}
          <div className="grid grid-cols-2 gap-4">

            {/* Pipeline Kanban */}
            <div className="rounded-xl bg-white p-5" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold" style={{ color: '#080D2F' }}>Pipeline CRM</div>
                <span className="text-xs" style={{ color: '#8B8FA8' }}>{pipelineTotal} cards total</span>
              </div>
              <div className="flex flex-col gap-3">
                {PIPE_COLS.map(col => {
                  const count = pipeline?.[col.key] ?? 0
                  const pct = pipelineTotal > 0 ? (count / pipelineTotal) * 100 : 0
                  return (
                    <div key={col.key} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.color }} />
                      <span className="text-xs font-semibold w-20 flex-shrink-0" style={{ color: '#080D2F' }}>{col.label}</span>
                      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 8, background: '#E8EAED' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: col.color }} />
                      </div>
                      <span className="text-sm font-bold w-8 text-right flex-shrink-0" style={{ color: '#080D2F' }}>{count}</span>
                    </div>
                  )
                })}
              </div>
              <a href="/pipeline" className="block text-xs font-bold mt-4" style={{ color: '#00C853' }}>Abrir Pipeline →</a>
            </div>

            {/* Status breakdown donut */}
            <div className="rounded-xl bg-white p-5" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div className="text-sm font-bold mb-4" style={{ color: '#080D2F' }}>Status dos Contatos</div>
              <div className="flex items-center gap-5">
                <DonutChart data={d?.status_breakdown ?? []} />
                <div className="flex flex-col gap-2 flex-1">
                  {(d?.status_breakdown ?? []).map(s => (
                    <div key={s.label} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-xs flex-1" style={{ color: '#080D2F' }}>{s.label}</span>
                      <span className="text-xs font-bold" style={{ color: s.color }}>{s.value.toLocaleString('pt-BR')}</span>
                      <span className="text-[10px]" style={{ color: '#8B8FA8' }}>
                        {d && d.total_contacts > 0 ? `${((s.value / d.total_contacts) * 100).toFixed(1)}%` : ''}
                      </span>
                    </div>
                  ))}
                  {(!d?.status_breakdown || d.status_breakdown.length === 0) && (
                    <p className="text-xs" style={{ color: '#8B8FA8' }}>Sem dados de status ainda</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Campanhas + Precisam de atenção */}
          <div className="grid grid-cols-2 gap-4">

            {/* Campanhas ativas */}
            <div className="rounded-xl bg-white p-5" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div className="text-sm font-bold mb-3" style={{ color: '#080D2F' }}>Campanhas</div>
              {(d?.active_campaigns ?? []).length === 0 ? (
                <div className="py-6 text-center text-xs" style={{ color: '#8B8FA8' }}>Nenhuma campanha criada ainda</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {(d?.active_campaigns ?? []).map(c => {
                    const pct = c.total_contacts > 0 ? Math.round((c.sent_count / c.total_contacts) * 100) : 0
                    const statusColor = c.status === 'active' ? '#00C853' : '#8B8FA8'
                    return (
                      <div key={c.id}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold truncate flex-1 mr-2" style={{ color: '#080D2F' }}>{c.name}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: statusColor + '20', color: statusColor }}>
                            {c.status === 'active' ? 'Ativa' : 'Rascunho'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-full overflow-hidden" style={{ height: 5, background: '#E8EAED' }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#00FF85,#00C853)' }} />
                          </div>
                          <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: '#8B8FA8' }}>
                            {c.sent_count}/{c.total_contacts} · {pct}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              <a href="/campanhas" className="block text-xs font-bold mt-4" style={{ color: '#00C853' }}>Ver campanhas →</a>
            </div>

            {/* Precisam de atenção humana */}
            <div className="rounded-xl bg-white p-5" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div className="text-sm font-bold mb-3" style={{ color: '#080D2F' }}>Precisam de Atenção Humana</div>
              {(d?.needs_human ?? []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
                  </svg>
                  <p className="text-xs font-medium" style={{ color: '#8B8FA8' }}>Nenhuma conversa pendente</p>
                </div>
              ) : (
                <div className="flex flex-col gap-0">
                  {(d?.needs_human ?? []).map(conv => (
                    <a key={conv.id} href={`/conversas?conv=${conv.id}`}
                      className="flex items-center gap-2.5 py-2 border-b last:border-0 hover:bg-gray-50 rounded transition-colors"
                      style={{ borderColor: '#E8EAED' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: '#FFB800' }}>
                        {conv.contact?.name?.split(' ')[0]?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: '#080D2F' }}>{conv.contact?.name}</p>
                        <p className="text-[10px]" style={{ color: '#8B8FA8' }}>{conv.contact?.phone}</p>
                      </div>
                      <span className="text-[11px] font-semibold flex-shrink-0" style={{ color: '#FF4444' }}>
                        {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Conversões por camada */}
          {(d?.conversions_by_camada ?? []).some(c => c.count > 0) && (
            <div className="rounded-xl bg-white p-5" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div className="text-sm font-bold mb-4" style={{ color: '#080D2F' }}>Conversões por Camada</div>
              <div className="flex gap-4 items-end h-28">
                {(d?.conversions_by_camada ?? []).map(({ camada, count }) => {
                  const maxC = Math.max(...(d?.conversions_by_camada ?? [{ count: 1 }]).map(c => c.count), 1)
                  return (
                    <div key={camada} className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-[11px] font-bold" style={{ color: '#080D2F' }}>{count}</span>
                      <div className="w-full rounded-t" style={{
                        height: `${Math.max((count / maxC) * 96, count > 0 ? 4 : 0)}px`,
                        background: 'linear-gradient(180deg,#00FF85,#00C853)',
                      }} />
                      <span className="text-[10px] font-semibold" style={{ color: '#8B8FA8' }}>C{camada}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              SEÇÃO MUVX · VISÃO C-LEVEL
          ══════════════════════════════════════════════ */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 h-px" style={{ background: '#E8EAED' }} />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
              style={{ background: '#080D2F', color: '#00FF85' }}>
              <Activity size={11} />
              MUVX · Visão Operacional
            </div>
            <div className="flex-1 h-px" style={{ background: '#E8EAED' }} />
          </div>

          {/* MUVX loading */}
          {muvxLoading && (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#E8EAED', borderTopColor: '#00FF85' }} />
              <span className="ml-3 text-xs" style={{ color: '#8B8FA8' }}>Carregando dados MUVX…</span>
            </div>
          )}

          {/* MUVX error */}
          {!muvxLoading && muvxError && (
            <div className="rounded-xl p-5 flex items-center gap-3" style={{ background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.2)' }}>
              <AlertTriangle size={16} style={{ stroke: '#DC2626', flexShrink: 0 }} />
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: '#DC2626' }}>Não foi possível carregar dados da API MUVX</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#8B8FA8' }}>{muvxError}</p>
                <p className="text-[10px] mt-1" style={{ color: '#8B8FA8' }}>Verifique se MUVX_EMAIL e MUVX_PASSWORD estão configurados no .env</p>
              </div>
              <button onClick={loadMuvx} className="text-xs font-semibold px-3 py-1 rounded-lg" style={{ background: '#DC2626', color: '#fff' }}>
                Tentar novamente
              </button>
            </div>
          )}

          {/* MUVX data */}
          {!muvxLoading && muvx && (
            <>
              {/* KPI Cards MUVX */}
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {muvxKpis.map(k => (
                  <div key={k.label} className="rounded-xl p-4 bg-white" style={{
                    boxShadow: k.highlight ? '0 0 0 2px #00FF8530, 0 1px 2px rgba(0,0,0,0.05)' : '0 1px 2px rgba(0,0,0,0.05)',
                  }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#8B8FA8' }}>{k.label}</div>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: k.bg }}>{k.icon}</div>
                    </div>
                    <div className="text-2xl font-extrabold" style={{ color: '#080D2F', letterSpacing: '-0.5px' }}>{k.value}</div>
                    <div className="text-[11px] mt-1" style={{ color: '#8B8FA8' }}>{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* Purchases by status chart + Recent purchases table */}
              <div className="grid grid-cols-2 gap-4">

                {/* Status distribution bar chart */}
                <div className="rounded-xl bg-white p-5" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-bold" style={{ color: '#080D2F' }}>Compras por Status</div>
                    <span className="text-xs" style={{ color: '#8B8FA8' }}>{periodLabel(period)}</span>
                  </div>
                  {statusEntries.length === 0 ? (
                    <div className="py-6 text-center text-xs" style={{ color: '#8B8FA8' }}>Nenhuma compra no período</div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {statusEntries.map(([status, count]) => {
                        const color = STATUS_COLORS[status] ?? '#8B8FA8'
                        const pct = (count / maxStatus) * 100
                        return (
                          <div key={status} className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                            <span className="text-xs font-semibold w-24 flex-shrink-0" style={{ color: '#080D2F' }}>
                              {STATUS_LABELS[status] ?? status}
                            </span>
                            <div className="flex-1 rounded-full overflow-hidden" style={{ height: 8, background: '#E8EAED' }}>
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                            </div>
                            <span className="text-sm font-bold w-8 text-right flex-shrink-0" style={{ color: '#080D2F' }}>{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Pending approvals + totals */}
                <div className="rounded-xl bg-white p-5" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <div className="text-sm font-bold mb-4" style={{ color: '#080D2F' }}>Resumo da Plataforma</div>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: 'Total de Usuários', value: fmt(muvx.totalUsers), color: '#6366f1' },
                      { label: 'Usuários Ativos', value: fmt(muvx.activeUsers), color: '#00C853' },
                      { label: 'Usuários Inativos', value: fmt(muvx.inactiveUsers), color: '#FF4444' },
                      { label: 'CREF Verificados', value: fmt(muvx.crefVerified), color: '#00FF85' },
                      { label: 'CREF Pendentes', value: fmt(muvx.crefPending), color: '#FFB800' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between py-1 border-b last:border-0" style={{ borderColor: '#F0F2F5' }}>
                        <span className="text-xs" style={{ color: '#8B8FA8' }}>{item.label}</span>
                        <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent purchases table */}
              {muvx.recentPurchases.length > 0 && (
                <div className="rounded-xl bg-white p-5" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-bold" style={{ color: '#080D2F' }}>Compras Recentes</div>
                    <span className="text-xs" style={{ color: '#8B8FA8' }}>{periodLabel(period)}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #E8EAED' }}>
                          {['Aluno', 'Personal', 'Valor', 'Status', 'Data'].map(h => (
                            <th key={h} className="text-left pb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#8B8FA8' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {muvx.recentPurchases.map(p => {
                          const color = STATUS_COLORS[p.status] ?? '#8B8FA8'
                          const dateStr = p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
                            : '—'
                          return (
                            <tr key={p.id} style={{ borderBottom: '1px solid #F0F2F5' }}>
                              <td className="py-2.5 text-xs font-semibold" style={{ color: '#080D2F' }}>{p.studentName}</td>
                              <td className="py-2.5 text-xs" style={{ color: '#8B8FA8' }}>{p.personalName}</td>
                              <td className="py-2.5 text-xs font-bold" style={{ color: '#080D2F' }}>{fmtBRL(p.amount)}</td>
                              <td className="py-2.5">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                  style={{ background: color + '20', color }}>
                                  {STATUS_LABELS[p.status] ?? p.status}
                                </span>
                              </td>
                              <td className="py-2.5 text-xs" style={{ color: '#8B8FA8' }}>{dateStr}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <PeriodProvider>
      <DashboardInner />
    </PeriodProvider>
  )
}
