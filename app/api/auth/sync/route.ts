import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { key, value } = body || {}

    if (!key || !value) {
      return NextResponse.json({ error: 'missing key or value' }, { status: 400 })
    }

    const res = NextResponse.json({ ok: true })

    // Set cookie so server-side middleware can read the session
    const isProd = process.env.NODE_ENV === 'production'
    res.cookies.set({
      name: key,
      value: typeof value === 'string' ? value : JSON.stringify(value),
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: isProd,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return res
  } catch (err) {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
}

export const runtime = 'edge'
