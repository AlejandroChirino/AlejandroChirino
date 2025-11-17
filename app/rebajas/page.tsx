"use client"

import { useState, useEffect } from "react"
// Header provisto por RootLayout
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import LoadingSkeleton from "@/components/loading-skeleton"
import ProductFilterBar from "@/components/product-filter-bar"
import { supabase } from "@/lib/supabaseClient"
import type { Product } from "@/lib/types"

// Sale products component
function SaleProducts({ selectedSubcategory, selectedColors, selectedSizes, selectedSort, selectedFeatured, selectedIsVip, selectedIsNew }:
  { selectedSubcategory: string | null; selectedColors: string[]; selectedSizes: string[]; selectedSort: string | null; selectedFeatured: boolean; selectedIsVip: boolean; selectedIsNew: boolean }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        params.set("on_sale", "true")
        if (selectedFeatured) params.set("featured", "true")
        if (selectedIsVip) params.set("is_vip", "true")
        if (selectedIsNew) params.set("is_new", "true")

        if (selectedSubcategory) {
          if (selectedSubcategory === "Hombre") params.set("category", "hombre")
          else if (selectedSubcategory === "Mujer") params.set("category", "mujer")
          else if (selectedSubcategory === "Accesorios") params.set("category", "accesorios")
          else if (selectedSubcategory === "Artículos destacados") params.set("featured", "true")
        } else {
          params.set("category", "all")
        }

        if (selectedSort) {
          const [sortBy, sortOrder] = selectedSort.split("-")
          params.set("sortBy", sortBy === "newest" ? "created_at" : sortBy)
          params.set("sortOrder", sortOrder === "asc" ? "asc" : "desc")
        }

        for (const c of selectedColors) params.append("colors", c)
        for (const s of selectedSizes) params.append("sizes", s)

        const res = await fetch(`/api/products?${params.toString()}`)
        if (!res.ok) {
          setError("Error al cargar las rebajas")
          return
        }
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : data?.products || [])
      } catch (err) {
        setError("Error al cargar las rebajas")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [selectedSubcategory, selectedColors, selectedSizes, selectedSort, selectedFeatured, selectedIsVip, selectedIsNew])

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
        <div className="text-6xl mb-4">🏷️</div>
        <h2 className="text-xl font-semibold mb-2">No hay rebajas disponibles</h2>
        <p className="mb-6">
          {selectedSubcategory
            ? `No hay rebajas en ${selectedSubcategory}`
            : "Mantente atento a nuestras próximas ofertas"}
        </p>
        <a
          href="/"
          className="inline-block bg-accent-orange text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Ver Todos los Productos
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

export default function RebajasPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)

  const [availableColors, setAvailableColors] = useState<string[]>([])
  const [availableSizes, setAvailableSizes] = useState<string[]>([])
  // filter state
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedSort, setSelectedSort] = useState<string | null>(null)
  const [selectedFeatured, setSelectedFeatured] = useState<boolean>(false)
  const [selectedIsVip, setSelectedIsVip] = useState<boolean>(false)
  const [selectedIsNew, setSelectedIsNew] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true
    async function fetchOptions() {
      try {
        const params = new URLSearchParams()
        params.set("on_sale", "true")

        if (selectedSubcategory) {
          if (selectedSubcategory === "Hombre") params.set("category", "hombre")
          else if (selectedSubcategory === "Mujer") params.set("category", "mujer")
          else if (selectedSubcategory === "Accesorios") params.set("category", "accesorios")
          else if (selectedSubcategory === "Artículos destacados") params.set("featured", "true")
          else params.set("subcategoria_like", selectedSubcategory)
        } else {
          params.set("category", "all")
        }

        if (selectedFeatured) params.set("featured", "true")
        if (selectedIsVip) params.set("is_vip", "true")
        if (selectedIsNew) params.set("is_new", "true")

        const res = await fetch(`/api/admin/options?${params.toString()}`)
        if (!res.ok) return
        const json = await res.json()
        if (!mounted) return
        setAvailableColors(json.colors || [])
        setAvailableSizes(json.sizes || [])
      } catch (err) {
        // ignore
      }
    }
    fetchOptions()
    return () => { mounted = false }
  }, [selectedSubcategory, selectedFeatured, selectedIsVip, selectedIsNew])

  return (
    <div className="min-h-screen">
      {/* Header ya incluido en el layout raíz */}

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero section */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-red-600">Rebajas exclusivas</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Aprovecha los mejores descuentos de La ⚡ Fashion</p>
          </div>

          <ProductFilterBar
            category="rebajas"
            availableColors={availableColors}
            availableSizes={availableSizes}
            selectedColors={selectedColors}
            selectedSizes={selectedSizes}
            selectedSort={selectedSort ?? undefined}
            selectedFeatured={selectedFeatured}
            selectedIsVip={selectedIsVip}
            selectedIsNew={selectedIsNew}
            onApplyFilters={(f) => {
              setSelectedSubcategory(f.subcategoria ?? null)
              setSelectedColors(f.colors ?? [])
              setSelectedSizes(f.sizes ?? [])
              setSelectedSort(f.sort ?? null)
              setSelectedFeatured(Boolean(f.featured))
              setSelectedIsVip(Boolean(f.is_vip))
              setSelectedIsNew(Boolean(f.is_new))
            }}
            onColorsChange={(c) => setSelectedColors(c)}
            onSizeChange={(s) => setSelectedSizes(s)}
            onSortChange={(s) => setSelectedSort(s)}
            onClearFilters={() => {
              setSelectedSubcategory(null)
              setSelectedColors([])
              setSelectedSizes([])
              setSelectedSort(null)
              setSelectedFeatured(false)
              setSelectedIsVip(false)
              setSelectedIsNew(false)
            }}
          />

          {/* Grid de productos */}
          <SaleProducts
            selectedSubcategory={selectedSubcategory}
            selectedColors={selectedColors}
            selectedSizes={selectedSizes}
            selectedSort={selectedSort}
            selectedFeatured={selectedFeatured}
            selectedIsVip={selectedIsVip}
            selectedIsNew={selectedIsNew}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
