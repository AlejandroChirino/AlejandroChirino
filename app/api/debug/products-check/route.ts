import { NextResponse } from 'next/server'

// Endpoint debug/products-check is deprecated and kept only temporarily in the
// repo so tests don't break. It now returns 410 to indicate removal.
export async function POST() {
  return NextResponse.json({ error: 'Endpoint removed', message: 'This debug endpoint was temporary and is now disabled' }, { status: 410 })
}
