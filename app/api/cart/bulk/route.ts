import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getAdminDb } from "@/lib/adminClient"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const items = Array.isArray(body?.items) ? body.items : body?.itemsList || null

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 })
    }

    // Prefer server session client; if none, allow admin fallback in dev.
    const serverSupabase = await createServerClient()
    const { data: authData } = await serverSupabase.auth.getUser()
    const sessionUserId = authData?.user?.id ?? null

    let dbClient: any
    let finalUserId: string | null = null
    if (sessionUserId) {
      dbClient = serverSupabase
      finalUserId = sessionUserId
    } else {
      const allowAdminFallback = !!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.ALLOW_ADMIN_FALLBACK === "true"
      if (allowAdminFallback) {
        try {
          dbClient = await getAdminDb()
        } catch (err) {
          return NextResponse.json({ error: "Not authenticated (no session) or admin client not available" }, { status: 401 })
        }
        // Expect items to include a userId field when using admin fallback
        finalUserId = null
      } else {
        return NextResponse.json({ error: "Not authenticated (no session)" }, { status: 401 })
      }
    }

    // Normalize and prepare payload for upsert. If using admin fallback and
    // items include userId per item, honor it; otherwise use session user.
    const payload = items.map((it: any) => {
      const user_id = it.userId || it.user_id || finalUserId
      return {
        user_id,
        product_id: it.productId || it.product_id || it.product || null,
        quantity: it.quantity ?? 1,
        size: it.size === undefined ? null : it.size,
        color: it.color === undefined ? null : it.color,
        selected: it.selected === undefined ? true : !!it.selected,
      }
    }).filter((p: any) => p.user_id && p.product_id)

    if (payload.length === 0) return NextResponse.json({ error: "No valid items after normalization" }, { status: 400 })

    // Use upsert with conflict on user_id,product_id,size,color to make this
    // operation idempotent (re-running it won't create duplicates).
    try {
      const upsertRes = await dbClient
        .from("cart_items")
        .upsert(payload, { onConflict: "user_id,product_id,size,color" })
        .select()

      if (upsertRes.error) {
        // If the error indicates there's no unique constraint for the ON CONFLICT
        // specification, fall back to a safe per-item merge to avoid crashing
        // the server on startup. This is slightly less efficient but robust.
        const err = upsertRes.error
        console.warn("Bulk upsert failed, falling back to per-item merge:", err)

        if (String(err?.code).includes("42P10") || String(err?.message || "").toLowerCase().includes("no unique or exclusion constraint")) {
          const results: any[] = []
              for (const p of payload) {
            try {
              const matchQuery: any = { user_id: p.user_id, product_id: p.product_id }
              // size/color nullable, handle explicitly
              if (p.size === null) matchQuery.size = null
              else matchQuery.size = p.size
              if (p.color === null) matchQuery.color = null
              else matchQuery.color = p.color

              const existing = await dbClient.from("cart_items").select("id,quantity").match(matchQuery).limit(1).maybeSingle()
              if (existing.error) {
                console.warn("Error checking existing cart item:", existing.error)
              }
              if (existing.data) {
                // update quantity by adding
                const newQty = (Number(existing.data.quantity) || 0) + Number(p.quantity || 1)
                const upd = await dbClient.from("cart_items").update({ quantity: newQty, selected: p.selected }).eq("id", existing.data.id).select().limit(1).maybeSingle()
                if (upd.error) console.warn("Error updating cart item during fallback merge:", upd.error)
                else results.push(upd.data)
              } else {
                const ins = await dbClient.from("cart_items").insert(p).select().limit(1).maybeSingle()
                if (ins.error) console.warn("Error inserting cart item during fallback merge:", ins.error)
                else results.push(ins.data)
              }
            } catch (e) {
              console.error("Unexpected error merging cart item:", e)
            }
          }

          return NextResponse.json({ upserted: results })
        }

        console.error("Error upserting cart items (bulk):", upsertRes.error)
        return NextResponse.json({ error: "Error upserting cart items", details: String(upsertRes.error) }, { status: 500 })
      }

      return NextResponse.json({ upserted: upsertRes.data })
    } catch (err) {
      console.error("Unexpected error during bulk upsert:", err)
      return NextResponse.json({ error: "Internal server error", details: String(err) }, { status: 500 })
    }
  } catch (error) {
    console.error("POST /api/cart/bulk error:", error)
    return NextResponse.json({ error: "Invalid request or internal error", details: String(error) }, { status: 400 })
  }
}
