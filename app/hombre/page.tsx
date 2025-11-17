"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { labelFromSlug, slugFromLabel } from "@/lib/subcategoryUtils"
// Header provisto por RootLayout
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import LoadingSkeleton from "@/components/loading-skeleton"
import SubcategoryTabs from "@/components/subcategory-tabs"
import { supabase } from "@/lib/supabaseClient"
import type { Product } from "@/lib/types"

// Men products component
function MenProducts({ selectedSubcategory }: { selectedSubcategory: string | null }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        let query = supabase
          .from("products")
          .select("id, name, price, sale_price, on_sale, image_url, category, subcategoria")
          .eq("category", "hombre")
          .order("created_at", { ascending: false })
        console.debug("[Hombre] fetchProducts selectedSubcategory:", selectedSubcategory)

        if (selectedSubcategory) {
          query = query.eq("subcategoria", selectedSubcategory)
        }

        const { data, error } = await query

        if (error) {
          setError("Error al cargar los productos")
          return
        }

        setProducts(data || [])
      } catch (err) {
        setError("Error al cargar los productos")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [selectedSubcategory])

  if (loading) {
    return <LoadingSkeleton count={8} compact />
  }

  if (error) {
    return (
      <div className="text-center text-gray-500 py-16">
        <p>{error}</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center text-gray-500 py-16">
        <p>No hay productos disponibles en esta {selectedSubcategory ? "subcategoría" : "categoría"}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} compact />
      ))}
    </div>
  )
}

export default function HombrePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Derive initial selectedSubcategory synchronously from searchParams so
  // server and client render match (avoids hydration mismatch).
    const initialSub = (() => {
      try {
        const s = searchParams.get("sub")
        if (s) {
          const label = labelFromSlug("hombre", s)
          if (label === "Ver todo") return null
          return label ?? null
        }
      } catch (e) {
        // ignore
      }
      return null
    })()

  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(initialSub)

  useEffect(() => {
    try {
      const sub = searchParams.get("sub")
      console.debug("[Hombre] useEffect searchParams -> sub:", sub)
      if (sub) {
        const label = labelFromSlug("hombre", sub)
        console.debug("[Hombre] labelFromSlug ->", label)
        if (label) {
          if (label === "Ver todo") setSelectedSubcategory(null)
          else setSelectedSubcategory(label)
        }
      }
    } catch (e) {
      // ignore
    }
  }, [searchParams])

  useEffect(() => {
    try {
      const base = "/hombre"
      if (!selectedSubcategory) {
        router.replace(base)
      } else {
        const encoded = encodeURIComponent(slugFromLabel("hombre", selectedSubcategory))
        router.replace(`${base}?sub=${encoded}`)
      }
    } catch (e) {
      // ignore
    }
  }, [selectedSubcategory, router])

  return (
    <div className="min-h-screen">
      {/* Header ya incluido en el layout raíz */}

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Ropa para Hombre</h1>
            <p className="text-gray-600">Descubre nuestra colección exclusiva para hombre</p>
          </div>

          {/* Filtros de subcategoría */}
          <SubcategoryTabs
            category="hombre"
            selectedSubcategory={selectedSubcategory}
            onSubcategoryChange={setSelectedSubcategory}
          />

          {/* Grid de productos */}
          <MenProducts selectedSubcategory={selectedSubcategory} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
