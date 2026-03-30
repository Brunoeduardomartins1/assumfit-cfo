const BASE = process.env.MUVX_API_BASE ?? 'https://api.muvx.app'

interface TokenCache {
  token: string
  expiresAt: number
}

let cache: TokenCache | null = null

export async function getMuvxToken(): Promise<string> {
  const now = Date.now()
  if (cache && cache.expiresAt > now + 60_000) {
    return cache.token
  }

  const email = process.env.MUVX_EMAIL
  const password = process.env.MUVX_PASSWORD
  if (!email || !password) {
    throw new Error('MUVX_EMAIL and MUVX_PASSWORD environment variables are required')
  }

  const res = await fetch(`${BASE}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: email,
      password,
      loginType: 'NORMAL',
      deviceInfo: { deviceFid: 'crm-server' },
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`MUVX auth failed (${res.status}): ${body}`)
  }

  const json = await res.json()
  // Token is in data.tokens.accessToken
  const token: string = json?.data?.tokens?.accessToken ?? json?.data?.accessToken ?? json?.data?.token ?? json?.accessToken
  if (!token) {
    throw new Error('MUVX auth response did not contain a token')
  }

  // Cache for 23 hours
  cache = { token, expiresAt: now + 23 * 60 * 60 * 1000 }
  return token
}

export const MUVX_BASE = BASE
