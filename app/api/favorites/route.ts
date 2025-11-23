import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // Log incoming request for debugging
    try { console.log("GET /api/favorites called", { url: request.url, userId }) } catch (e) {}

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = await createServerClient()
    try {
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
        console.error("Error fetching favorites from Supabase:", error)
        return NextResponse.json({ error: "Error fetching favorites", details: String(error) }, { status: 500 })
      }

      return NextResponse.json(favorites)
    } catch (err) {
      console.error("GET /api/favorites unexpected error:", err)
      return NextResponse.json({ error: "Internal server error", details: String(err) }, { status: 500 })
    }
  } catch (error) {
    console.error("GET /api/favorites top-level error:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, productId } = await request.json()

    if (!userId && !productId) {
      return NextResponse.json({ error: "User ID and Product ID are required" }, { status: 400 })
    }

    const supabase = await createServerClient()
    // Try to get server session user id, but allow client-provided userId as a
    // development fallback when server session is not present (helps local debugging).
    const { data: authData } = await supabase.auth.getUser()
    const serverUserId = authData?.user?.id ?? (process.env.NODE_ENV !== "production" ? userId : null)
    if (!serverUserId) {
      return NextResponse.json({ error: "Not authenticated (no server session)" }, { status: 401 })
    }

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Validate product exists to avoid FK constraint violations
    try {
      const { data: prodData, error: prodErr } = await supabase.from("products").select("id").eq("id", productId).maybeSingle()
      if (prodErr) {
        console.error("Error checking product existence:", prodErr)
        return NextResponse.json({ error: "Error checking product", details: String(prodErr) }, { status: 500 })
      }
      if (!prodData) {
        return NextResponse.json({ error: "Product not found", details: `product ${productId} does not exist` }, { status: 400 })
      }
    } catch (err) {
      console.error("Unexpected error checking product existence:", err)
      return NextResponse.json({ error: "Internal server error", details: String(err) }, { status: 500 })
    }

    const { data: favorite, error } = await supabase
      .from("favorites")
      .insert([{ user_id: serverUserId, product_id: productId }])
      .select()
      .single()

    if (error) {
      console.error("Error inserting favorite:", error)
      return NextResponse.json({ error: "Error adding favorite", details: String(error) }, { status: 500 })
    }

    return NextResponse.json(favorite, { status: 201 })
  } catch (error) {
    console.error("POST /api/favorites error:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const productId = searchParams.get("productId")
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { data: authData } = await supabase.auth.getUser()
    // Allow client userId in development as a fallback to ease debugging
    const serverUserId = authData?.user?.id ?? (process.env.NODE_ENV !== "production" ? userId : null)
    if (!serverUserId) {
      return NextResponse.json({ error: "Not authenticated (no server session)" }, { status: 401 })
    }

    // Validate product exists (deleting a favorite for a non-existent product
    // should be a no-op but we check to provide a clearer response).
    try {
      const { data: prodData, error: prodErr } = await supabase.from("products").select("id").eq("id", productId).maybeSingle()
      if (prodErr) {
        console.error("Error checking product existence for delete:", prodErr)
        return NextResponse.json({ error: "Error checking product", details: String(prodErr) }, { status: 500 })
      }
      if (!prodData) {
        return NextResponse.json({ error: "Product not found", details: `product ${productId} does not exist` }, { status: 400 })
      }
    } catch (err) {
      console.error("Unexpected error checking product existence for delete:", err)
      return NextResponse.json({ error: "Internal server error", details: String(err) }, { status: 500 })
    }

    // Attempt to delete and return deleted rows to verify action
    try {
      const { data: deleted, error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", serverUserId)
        .eq("product_id", productId)
        .select()

      if (error) {
        console.error("Error deleting favorite:", error)
        return NextResponse.json({ error: "Error removing favorite", details: String(error) }, { status: 500 })
      }

      if (!deleted || (Array.isArray(deleted) && deleted.length === 0)) {
        // No rows deleted. In development, try fallback delete using client-provided userId
        try {
          if (process.env.NODE_ENV !== "production" && userId) {
            console.warn("No rows deleted with serverUserId, attempting fallback delete with client userId (dev only)")
            const { data: deletedFallback, error: err2 } = await supabase
              .from("favorites")
              .delete()
              .eq("user_id", userId)
              .eq("product_id", productId)
              .select()

            if (err2) {
              console.error("Error deleting favorite with fallback userId:", err2)
              return NextResponse.json({ error: "Error removing favorite (fallback)", details: String(err2) }, { status: 500 })
            }

            if (deletedFallback && Array.isArray(deletedFallback) && deletedFallback.length > 0) {
              return NextResponse.json({ message: "Favorite removed successfully (fallback)", deleted: deletedFallback })
            }
          }
        } catch (e) {
          console.error("Fallback delete attempt failed:", e)
        }

        // Nothing deleted
        return NextResponse.json({ message: "No favorite found to remove" }, { status: 404 })
      }

      return NextResponse.json({ message: "Favorite removed successfully", deleted })
    } catch (e) {
      console.error("Unexpected error during delete:", e)
      return NextResponse.json({ error: "Internal server error", details: String(e) }, { status: 500 })
    }
  } catch (error) {
    console.error("DELETE /api/favorites error:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
