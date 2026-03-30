import { NextRequest, NextResponse } from 'next/server'
import { getMuvxToken, MUVX_BASE } from '@/lib/muvx/auth'

async function muvxGet(path: string, token: string) {
  const res = await fetch(`${MUVX_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  })
  if (!res.ok) return null
  const json = await res.json()
  return json?.data ?? json
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const days = searchParams.get('days')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let createdFrom: string
    let createdTo: string

    if (from && to) {
      createdFrom = from
      createdTo = to
    } else {
      const d = parseInt(days ?? '7', 10)
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - d)
      createdFrom = start.toISOString().split('T')[0]
      createdTo = end.toISOString().split('T')[0]
    }

    const token = await getMuvxToken()

    const purchasesUrl =
      `/admin/purchases?createdFrom=${createdFrom}&createdTo=${createdTo}&limit=100&page=1`

    const [dashboard, stats, purchasesRaw, overview] = await Promise.all([
      muvxGet('/admin/dashboard', token),
      muvxGet('/admin/dashboard/stats', token),
      muvxGet(purchasesUrl, token),
      muvxGet('/admin/stats/overview', token),
    ])

    // Real structure:
    // dashboard = { totals: { users, students, personals, activeUsers }, recentUsers: [...] }
    // stats     = { growth: { usersLastMonth, studentsLastMonth, personalsLastMonth }, cref: { verified, pending } }
    // overview  = { users: { total, active, inactive }, profiles: { students, personals, admins }, verification: {...} }
    // purchases = { data: [...], total, page, limit, totalPages }  (items have: id, studentId, personalId, status, totalAmount, createdAt)

    const purchases: any[] = purchasesRaw?.data ?? []

    const statusCount: Record<string, number> = {}
    let revenueInPeriod = 0
    for (const p of purchases) {
      const s = p.status ?? 'UNKNOWN'
      statusCount[s] = (statusCount[s] ?? 0) + 1
      if (['APPROVED', 'ACTIVE', 'SCHEDULED'].includes(s)) {
        revenueInPeriod += Number(p.totalAmount ?? 0)
      }
    }

    const recent = purchases.slice(0, 10).map((p: any) => ({
      id: p.id,
      studentName: p.student?.name ?? p.student?.fullName ?? `Aluno ${p.studentId?.slice(0,6)}`,
      personalName: p.personal?.name ?? p.personal?.fullName ?? `Personal ${p.personalId?.slice(0,6)}`,
      amount: Number(p.totalAmount ?? 0),
      status: p.status ?? 'UNKNOWN',
      createdAt: p.createdAt ?? null,
      paymentMethod: p.paymentMethod ?? null,
    }))

    return NextResponse.json({
      period: { from: createdFrom, to: createdTo },
      // Totals (from /admin/dashboard)
      totalUsers: dashboard?.totals?.users ?? 0,
      totalStudents: dashboard?.totals?.students ?? 0,
      totalPersonals: dashboard?.totals?.personals ?? 0,
      activeUsers: dashboard?.totals?.activeUsers ?? 0,
      // Growth (from /admin/dashboard/stats)
      usersGrowthLastMonth: stats?.growth?.usersLastMonth ?? 0,
      studentsGrowthLastMonth: stats?.growth?.studentsLastMonth ?? 0,
      personalsGrowthLastMonth: stats?.growth?.personalsLastMonth ?? 0,
      crefVerified: stats?.cref?.verified ?? 0,
      crefPending: stats?.cref?.pending ?? 0,
      // Overview (from /admin/stats/overview)
      activeSubscriptions: overview?.users?.active ?? dashboard?.totals?.activeUsers ?? 0,
      inactiveUsers: overview?.users?.inactive ?? 0,
      admins: overview?.profiles?.admins ?? 0,
      // Period purchases
      purchasesInPeriod: purchases.length,
      purchasesTotalInPeriod: purchasesRaw?.total ?? purchases.length,
      revenueInPeriod,
      purchasesByStatus: statusCount,
      recentPurchases: recent,
    })
  } catch (err: any) {
    console.error('[MUVX metrics]', err?.message)
    return NextResponse.json({ error: err?.message ?? 'internal error' }, { status: 500 })
  }
}
