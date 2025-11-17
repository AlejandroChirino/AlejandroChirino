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

// Accessories products component
function AccessoriesProducts({ selectedSubcategory }: { selectedSubcategory: string | null }) {
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
          .eq("category", "accesorios")
          .order("created_at", { ascending: false })

        console.debug("[Accesorios] fetchProducts selectedSubcategory:", selectedSubcategory)

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
        <div className="text-6xl mb-4">👜</div>
        <h2 className="text-xl font-semibold mb-2">
          {selectedSubcategory ? `No hay productos en ${selectedSubcategory}` : "Próximamente"}
        </h2>
        <p className="mb-6">
          {selectedSubcategory
            ? "Prueba con otra subcategoría o revisa más tarde"
            : "Estamos preparando una increíble colección de accesorios"}
        </p>
        <a
          href="/"
          className="inline-block bg-accent-orange text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Ver Otros Productos
        </a>
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

export default function AccesoriosPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

    const initialSub = (() => {
      try {
        const s = searchParams.get("sub")
        if (s) {
          const label = labelFromSlug("accesorios", s)
          if (label === "Ver todo") return null
          return label ?? null
        }
      } catch (e) {
        // ignore
      }
      return null
    })()

    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(initialSub)

  // Sync initial state from ?sub= query param
  useEffect(() => {
    try {
      const sub = searchParams.get("sub")
      if (sub) {
        const label = labelFromSlug("accesorios", sub)
        if (label) {
          // treat "Ver todo" as no filter (show all)
          if (label === "Ver todo") setSelectedSubcategory(null)
          else setSelectedSubcategory(label)
        }
      }
    } catch (e) {
      // ignore
    }
  }, [searchParams])

  // Update URL when user changes selectedSubcategory (keeps history clean using replace)
  useEffect(() => {
    try {
      const base = "/accesorios"
      if (!selectedSubcategory) {
        // remove param
        router.replace(base)
      } else {
        const encoded = encodeURIComponent(slugFromLabel("accesorios", selectedSubcategory))
        router.replace(`${base}?sub=${encoded}`)
      }
    } catch (e) {
      // ignore router errors
    }
  }, [selectedSubcategory, router])

  return (
    <div className="min-h-screen">
      {/* Header ya incluido en el layout raíz */}

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero section */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Accesorios</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Completa tu look con nuestra selección de accesorios: gorras, lentes de sol, cadenas, relojes y más
            </p>
          </div>

          {/* Filtros de subcategoría */}
          <SubcategoryTabs
            category="accesorios"
            selectedSubcategory={selectedSubcategory}
            onSubcategoryChange={(label) => {
              // allow the tabs to emit "Ver todo" but treat it as null
              if (label === "Ver todo") setSelectedSubcategory(null)
              else setSelectedSubcategory(label)
            }}
          />

          {/* Grid de productos */}
          <AccessoriesProducts selectedSubcategory={selectedSubcategory} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
