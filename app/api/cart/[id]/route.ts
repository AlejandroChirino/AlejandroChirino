import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getAdminDb } from "@/lib/adminClient"
import type { TablesUpdate } from "@/lib/database.types"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    if (!id) return NextResponse.json({ error: "Cart item id is required" }, { status: 400 })

    const { quantity, size, color } = await request.json()

    const updateData: TablesUpdate<"cart_items"> = {
      quantity,
      size,
      color,
      updated_at: new Date().toISOString(),
    }

    // Prefer server session client; if none, allow admin fallback in dev.
    const serverSupabase = await createServerClient()
    const { data: authData } = await serverSupabase.auth.getUser()
    const sessionUserId = authData?.user?.id ?? null

    let dbClient: any
    if (sessionUserId) {
      dbClient = serverSupabase
    } else {
      try {
        dbClient = await getAdminDb()
      } catch (err) {
        return NextResponse.json({ error: "Not authenticated (no session) or admin client not available" }, { status: 401 })
      }
    }

    const { data: cartItem, error } = await dbClient
      .from("cart_items")
      .update(updateData as never)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Error updating cart item" }, { status: 500 })
    }

    return NextResponse.json(cartItem)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    if (!id) return NextResponse.json({ error: "Cart item id is required" }, { status: 400 })

    // Prefer server session client; if none, allow admin fallback in dev.
    const serverSupabase = await createServerClient()
    const { data: authData } = await serverSupabase.auth.getUser()
    const sessionUserId = authData?.user?.id ?? null

    let dbClient: any
    if (sessionUserId) {
      dbClient = serverSupabase
    } else {
      try {
        dbClient = await getAdminDb()
      } catch (err) {
        return NextResponse.json({ error: "Not authenticated (no session) or admin client not available" }, { status: 401 })
      }
    }

    const { error } = await dbClient.from("cart_items").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Error deleting cart item" }, { status: 500 })
    }

    return NextResponse.json({ deleted: id })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
