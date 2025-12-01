import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getAdminDb } from "@/lib/adminClient"

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
    // Parse and log request body for easier debugging when clients send malformed payloads
    const raw = await request.text()
    let parsed: any = {}
    if (raw) {
      try {
        parsed = JSON.parse(raw)
      } catch (e) {
        // If JSON parsing fails, attempt to parse as form-encoded body
        try {
          const params = new URLSearchParams(raw)
          parsed = {}
          for (const [k, v] of params.entries()) parsed[k] = v
          console.warn("POST /api/favorites: parsed body as form-urlencoded", { parsed })
        } catch (e2) {
          console.warn("POST /api/favorites: failed to parse body as JSON or form-urlencoded", { raw })
          return NextResponse.json({ error: "Invalid request body (not JSON nor form-encoded)", details: raw || null }, { status: 400 })
        }
      }
    }

    // Normalize common field names to be tolerant with different clients
    const userIdFromBody = parsed?.userId ?? parsed?.user_id ?? parsed?.user?.id ?? null
    const productIdFromBody = parsed?.productId ?? parsed?.product_id ?? parsed?.product?.id ?? parsed?.product ?? null

    // Allow x-user-id header as an additional fallback (useful for some clients)
    const headerUserId = request.headers.get("x-user-id")

    const bodyUserId = userIdFromBody || headerUserId || null


    // We'll create supabase client now to check session. If there is no server
    // session we may use the admin (service role) client in development to
    // perform checks/inserts; this avoids RLS blocking anonymous inserts while
    // keeping production behavior strict.
    const serverSupabase = await createServerClient()
    const { data: authData } = await serverSupabase.auth.getUser()
    const serverUserId = authData?.user?.id ?? null

    // Resolve which user id to use (server session preferred)
    const finalUserIdCandidate = serverUserId || (process.env.NODE_ENV !== "production" ? bodyUserId : null)

    // Choose DB client: prefer serverSupabase when we have a session. As a
    // safety measure, only enable the admin (service-role) fallback when an
    // explicit env var `ALLOW_ADMIN_FALLBACK` is set to "true" and a
    // service role key is present. This prevents accidental use of the
    // privileged client in unintended environments.
    const useAdmin = !serverUserId && !!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.ALLOW_ADMIN_FALLBACK === "true"
    let db: any = serverSupabase
    if (useAdmin) {
      try { console.warn("Using SUPABASE service-role client fallback for favorites (dev only)") } catch (e) {}
      try {
        db = await getAdminDb()
      } catch (e) {
        return NextResponse.json({ error: "No autorizado o cliente admin no disponible" }, { status: 401 })
      }
    }

    try {
      console.log("POST /api/favorites parsed body and headers", { parsed, headerUserId, finalUserIdCandidate, productIdFromBody })
    } catch (e) {}

    if (!finalUserIdCandidate) {
      return NextResponse.json({ error: "Not authenticated (no server session and no userId in body)" }, { status: 401 })
    }

    if (!productIdFromBody) {
      return NextResponse.json({ error: "Product ID is required", details: { productId: !!productIdFromBody, parsed } }, { status: 400 })
    }

    const finalUserId = finalUserIdCandidate

    // Validate product exists to avoid FK constraint violations
    try {
      const { data: prodData, error: prodErr } = await db.from("products").select("id, name, image_url").eq("id", productIdFromBody).maybeSingle()
      if (prodErr) {
        console.error("Error checking product existence:", prodErr)
        return NextResponse.json({ error: "Error checking product", details: String(prodErr) }, { status: 500 })
      }

      try { console.log("POST /api/favorites product lookup result", { productIdFromBody, prodData }) } catch (e) {}

      if (!prodData) {
        return NextResponse.json({ error: "Product not found", details: { productId: productIdFromBody, prodData: prodData || null, parsed } }, { status: 400 })
      }
    } catch (err) {
      console.error("Unexpected error checking product existence:", err)
      return NextResponse.json({ error: "Internal server error", details: String(err) }, { status: 500 })
    }

    try {
      console.log("POST /api/favorites inserting", { user: finalUserId, product: productIdFromBody })
    } catch (e) {}

    // Check existing to avoid duplicate inserts
    try {
      const { data: existing, error: existErr } = await db
        .from("favorites")
        .select("id")
        .eq("user_id", finalUserId)
        .eq("product_id", productIdFromBody)
        .maybeSingle()

      if (existErr) {
        console.error("Error checking existing favorite:", existErr)
      } else if (existing) {
        return NextResponse.json({ message: "Favorite already exists", favorite: existing }, { status: 200 })
      }
    } catch (e) {
      console.error("Error checking existing favorite:", e)
    }

    const { data: favorite, error } = await db
      .from("favorites")
      .insert([{ user_id: finalUserId, product_id: productIdFromBody }])
      .select()
      .single()

    if (error) {
      console.error("Error inserting favorite:", error)
      // Serialize Supabase error objects to JSON-friendly shape when possible
      let errDetails: any = null
      try {
        errDetails = JSON.parse(JSON.stringify(error))
      } catch (e) {
        errDetails = String(error)
      }
      return NextResponse.json({ error: "Error adding favorite", details: errDetails }, { status: 500 })
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
