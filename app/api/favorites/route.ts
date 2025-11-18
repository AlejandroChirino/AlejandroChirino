import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { data: favorites, error } = await supabase
      .from("favorites")
      .select(
        `
        id,
        created_at,
        products (
          id,
          name,
          description,
          price,
          image_url,
          category,
          sizes,
          colors,
          stock
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Error fetching favorites" }, { status: 500 })
    }

    return NextResponse.json(favorites)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, productId } = await request.json()

    if (!userId || !productId) {
      return NextResponse.json({ error: "User ID and Product ID are required" }, { status: 400 })
    }

    const supabase = await createServerClient()
    // Get user from server session instead of trusting client-provided userId
    const { data: authData } = await supabase.auth.getUser()
    const serverUserId = authData?.user?.id
    if (!serverUserId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { data: favorite, error } = await supabase
      .from("favorites")
      .insert([{ user_id: serverUserId, product_id: productId }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Error adding favorite" }, { status: 500 })
    }

    return NextResponse.json(favorite, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const productId = searchParams.get("productId")

    if (!userId || !productId) {
      return NextResponse.json({ error: "User ID and Product ID are required" }, { status: 400 })
    }

    const supabase = await createServerClient()
    // Use server session user id for deletion
    const { data: authData } = await supabase.auth.getUser()
    const serverUserId = authData?.user?.id
    if (!serverUserId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { error } = await supabase.from("favorites").delete().eq("user_id", serverUserId).eq("product_id", productId)

    if (error) {
      return NextResponse.json({ error: "Error removing favorite" }, { status: 500 })
    }

    return NextResponse.json({ message: "Favorite removed successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
