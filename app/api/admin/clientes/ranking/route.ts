import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/adminClient"

function rangeToDate(range: string | null) {
  const now = new Date()
  if (!range) return new Date(0)
  if (range === "day") return new Date(now.getTime() - 24 * 60 * 60 * 1000)
  if (range === "week") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  if (range === "month") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  if (range === "year") return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
  return new Date(0)
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const params = url.searchParams
    const range = params.get("range") || "month"

    const since = rangeToDate(range)

    let admin: any
    try {
      admin = await getAdminDb()
    } catch (e) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 401 })
    }

    // Total spent per user in range
    const { data: totals, error: totalsErr } = await admin
      .from("orders")
      .select("user_id,total")
      .gte("created_at", since.toISOString())

    if (totalsErr) {
      console.error("Error fetching orders for totals:", totalsErr)
      return NextResponse.json({ error: "Error" }, { status: 500 })
    }

    const totalsMap: Record<string, number> = {}
    const maxOrderMap: Record<string, number> = {}
    for (const o of totals || []) {
      const uid = o.user_id
      const value = Number(o.total || 0)
      totalsMap[uid] = (totalsMap[uid] || 0) + value
      maxOrderMap[uid] = Math.max(maxOrderMap[uid] || 0, value)
    }

    const uids = Object.keys(totalsMap)
    if (uids.length === 0) return NextResponse.json({ totalRanking: [], singleOrderRanking: [] })

    // Fetch user info for these uids
    const { data: profiles } = await admin.from("user_profiles").select("id,full_name,email").in("id", uids)

    const merged = (profiles || []).map((p: any) => ({
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      total_spent: totalsMap[p.id] || 0,
      largest_order: maxOrderMap[p.id] || 0,
    }))

    const totalRanking = merged.sort((a,b) => b.total_spent - a.total_spent).slice(0,10)
    const singleOrderRanking = merged.sort((a,b) => b.largest_order - a.largest_order).slice(0,10)

    return NextResponse.json({ totalRanking, singleOrderRanking })
  } catch (err: any) {
    console.error("Error in GET /api/admin/clientes/ranking:", err)
    return NextResponse.json({ error: "Internal error", details: process.env.NODE_ENV !== "production" ? String(err) : undefined }, { status: 500 })
  }
}
