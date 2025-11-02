import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { TablesUpdate } from "@/lib/database.types"

// CORRECCIÓN CLAVE: Los 'params' se reciben como un objeto normal, NO como una Promise
interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar que Supabase esté configurado
    if (!supabase) {
      console.error("🚨 API ERROR: Supabase is not configured.")
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    // ACCESO DIRECTO AL ID
    const { id } = params
    
    const { data: product, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error) {
      // ✅ LÍNEAS DE DEBUGGING AÑADIDAS
      console.error(
        "🚨 API GET FALLO SUPABASE:", 
        error.message, 
        "Code:", 
        error.code, 
        "Hint:", 
        error.hint
      )
      // ------------------------------------
      
      if (error.code === "PGRST116") {
        // PostgREST 116 = No Rows Found, correcto para 404
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }
      return NextResponse.json({ error: "Error fetching product" }, { status: 500 })
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("🚨 API GET ERROR CRÍTICO:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    if (!supabase) {
      console.error("🚨 API ERROR: Supabase is not configured for PUT.")
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const body = await request.json()
    const updateData: TablesUpdate<"products"> = {
      ...(body as Partial<TablesUpdate<"products">>),
      updated_at: new Date().toISOString(),
    }

    const { id } = params
    const { data: product, error } = await supabase
      .from("products")
      .update(updateData as never)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("🚨 API PUT FALLO SUPABASE:", error.message)
      return NextResponse.json({ error: "Error updating product" }, { status: 500 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("🚨 API PUT ERROR CRÍTICO:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    if (!supabase) {
      console.error("🚨 API ERROR: Supabase is not configured for DELETE.")
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const { id } = params
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      console.error("🚨 API DELETE FALLO SUPABASE:", error.message)
      return NextResponse.json({ error: "Error deleting product" }, { status: 500 })
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("🚨 API DELETE ERROR CRÍTICO:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
