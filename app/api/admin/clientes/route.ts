import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

// GET /api/admin/clientes?page=&limit=&search=
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const params = url.searchParams
    const page = Number(params.get("page") || "1")
    const limit = Number(params.get("pageSize") || params.get("limit") || "20")
    const search = params.get("q") || params.get("search") || ""
    const vip = params.get("vip") || null // 'yes' | 'no' | null
    const tag = params.get("tag") || null
    const minTotal = params.get("minTotal") ? Number(params.get("minTotal")) : null
    const lastOrderDays = params.get("lastOrderDays") ? Number(params.get("lastOrderDays")) : null

    const admin = getSupabaseAdmin()

    // Build base query with profile-level filters (search, vip, tag)
    let base = admin.from("user_profiles").select("id, email, full_name, birthdate, is_vip, tags, created_at", { count: "exact" }).order("created_at", { ascending: false })
    if (search) {
      base = base.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }
    if (vip === 'yes') base = base.eq('is_vip', true)
    if (vip === 'no') base = base.eq('is_vip', false)
    if (tag) base = base.contains('tags', [tag])

    // If filters depend on orders (minTotal or lastOrderDays), fetch matching profiles first then filter by orders in JS,
    // otherwise use database pagination.
    let profiles: any[] = []
    let count: number | null = 0
    let error: any = null

    if (minTotal !== null || lastOrderDays !== null) {
      // fetch all profiles matching profile-level filters (no range)
      const resp = await base
      const allProfiles = resp.data as any[]
      error = resp.error
      profiles = allProfiles || []
      count = profiles.length
    } else {
      const from = (page - 1) * limit
      const to = from + limit - 1
      const resp = await base.range(from, to)
      const meta = resp
      profiles = resp.data as any[]
      error = resp.error
      // try to read count from resp.count (PostgREST returns it when { count: 'exact' } used)
      // Supabase returns { data, count }
      try { count = (resp as any).count ?? null } catch { count = null }
    }
    if (error) {
      console.error("Error fetching clients:", error)
      return NextResponse.json({ error: "Error fetching clients" }, { status: 500 })
    }

    const ids = (profiles || []).map((p: any) => p.id).filter(Boolean)

    // Fetch aggregated totals for these profiles
    let totalsMap: Record<string, { total_spent: number; last_order_at: string | null }> = {}
    if (ids.length) {
      const { data: orders } = await admin
        .from("orders")
        .select("user_id,total,created_at")
        .in("user_id", ids)

      if (orders) {
        for (const o of orders) {
          const uid = o.user_id
          if (!totalsMap[uid]) totalsMap[uid] = { total_spent: 0, last_order_at: null }
          totalsMap[uid].total_spent = Number(totalsMap[uid].total_spent || 0) + Number(o.total || 0)
          const created = o.created_at ? new Date(o.created_at).toISOString() : null
          if (!totalsMap[uid].last_order_at || (created && new Date(created) > new Date(totalsMap[uid].last_order_at))) {
            totalsMap[uid].last_order_at = created
          }
        }
      }
    }

    // compute totals and last order per user
    const clientsBase = (profiles || []).map((p: any) => ({
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      is_vip: Boolean(p.is_vip),
      tags: p.tags || [],
      birthdate: p.birthdate || null,
      total_spent: totalsMap[p.id]?.total_spent || 0,
      last_order_at: totalsMap[p.id]?.last_order_at || null,
    }))

    // If minTotal or lastOrderDays filters present, apply them and then paginate in-memory
    let filteredClients = clientsBase
    if (minTotal !== null) {
      filteredClients = filteredClients.filter(c => Number(c.total_spent || 0) >= minTotal)
    }
    if (lastOrderDays !== null) {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - lastOrderDays)
      filteredClients = filteredClients.filter(c => c.last_order_at && new Date(c.last_order_at) >= cutoff)
    }

    // Pagination
    const totalAfterFilter = filteredClients.length
    const totalPages = Math.max(1, Math.ceil(totalAfterFilter / limit))
    const start = (page - 1) * limit
    const paged = filteredClients.slice(start, start + limit)

    return NextResponse.json({ clients: paged, pagination: { page, limit, total: totalAfterFilter, totalPages } })
  } catch (err: any) {
    console.error("Error in GET /api/admin/clientes:", err)
    return NextResponse.json({ error: "Internal error", details: process.env.NODE_ENV !== "production" ? String(err) : undefined }, { status: 500 })
  }
}
