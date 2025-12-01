// Disabled debug admin endpoint — removed in preparation for production
// This file previously exposed a development-only admin endpoint. It has
// been disabled to avoid leaking privileged operations. If you need to
// re-enable admin debugging locally, restore this file from version control
// or create a gated script that uses your local service-role key.

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ error: 'Debug endpoint disabled' }, { status: 410 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Debug endpoint disabled' }, { status: 410 })
}
