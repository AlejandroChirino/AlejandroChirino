"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { labelFromSlug, slugFromLabel } from "@/lib/subcategoryUtils"
// Header provisto por RootLayout
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import LoadingSkeleton from "@/components/loading-skeleton"
import ProductFilterBar from "@/components/product-filter-bar"
import { supabase } from "@/lib/supabaseClient"
import type { Product } from "@/lib/types"

function AccessoriesProducts({
  selectedSubcategory,
  selectedColors,
  selectedSizes,
  selectedSort,
  selectedOnSale,
  selectedFeatured,
  selectedIsVip,
  selectedIsNew,
}: {
  selectedSubcategory: string | null
  selectedColors: string[]
  selectedSizes: string[]
  selectedSort: string | null
  selectedOnSale: boolean
  selectedFeatured: boolean
  selectedIsVip: boolean
  selectedIsNew: boolean
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        params.set("category", "accesorios")
        params.set("subcategoria", selectedSubcategory ?? "all")
        if (selectedOnSale) params.set("on_sale", "true")
        if (selectedFeatured) params.set("featured", "true")
        if (selectedIsVip) params.set("is_vip", "true")
        if (selectedIsNew) params.set("is_new", "true")
        if (selectedSort) {
          const [sortBy, sortOrder] = selectedSort.split("-")
          params.set("sortBy", sortBy === "newest" ? "created_at" : sortBy)
          params.set("sortOrder", sortOrder === "asc" ? "asc" : "desc")
        }
        for (const c of selectedColors) params.append("colors", c)
        for (const s of selectedSizes) params.append("sizes", s)

        const res = await fetch(`/api/products?${params.toString()}`)
        if (!res.ok) {
          setError("Error al cargar los productos")
          return
        }
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : data?.products || [])
      } catch (err) {
        setError("Error al cargar los productos")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [selectedSubcategory, selectedColors, selectedSizes, selectedSort, selectedOnSale, selectedFeatured, selectedIsVip, selectedIsNew])

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

export default function AccesoriosClient() {
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

  useEffect(() => {
    try {
      const sub = searchParams.get("sub")
      if (sub) {
        const label = labelFromSlug("accesorios", sub)
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
      const base = "/accesorios"
      if (!selectedSubcategory) {
        router.replace(base)
      } else {
        const encoded = encodeURIComponent(slugFromLabel("accesorios", selectedSubcategory))
        router.replace(`${base}?sub=${encoded}`)
      }
    } catch (e) {
      // ignore router errors
    }
  }, [selectedSubcategory, router])

  const [availableColors, setAvailableColors] = useState<string[]>([])
  const [availableSizes, setAvailableSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedSort, setSelectedSort] = useState<string | null>(null)
  const [selectedOnSale, setSelectedOnSale] = useState<boolean>(false)
  const [selectedFeatured, setSelectedFeatured] = useState<boolean>(false)
  const [selectedIsVip, setSelectedIsVip] = useState<boolean>(false)
  const [selectedIsNew, setSelectedIsNew] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true
    async function fetchOptions() {
      try {
        const params = new URLSearchParams()
        params.set("category", "accesorios")
        if (selectedSubcategory) params.set("subcategoria", selectedSubcategory)
        else params.set("subcategoria", "all")
        if (selectedOnSale) params.set("on_sale", "true")
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
  }, [selectedSubcategory])

  return (
    <div className="min-h-screen">
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Accesorios</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Completa tu look con nuestra selección de accesorios: gorras, lentes de sol, cadenas, relojes y más
            </p>
          </div>

          <ProductFilterBar
            category="accesorios"
            availableColors={availableColors}
            availableSizes={availableSizes}
            selectedColors={selectedColors}
            selectedSizes={selectedSizes}
            selectedSort={selectedSort ?? undefined}
            selectedOnSale={selectedOnSale}
            selectedFeatured={selectedFeatured}
            selectedIsVip={selectedIsVip}
            selectedIsNew={selectedIsNew}
            onApplyFilters={(f) => {
              if (f.subcategoria === "Ver todo") setSelectedSubcategory(null)
              else setSelectedSubcategory(f.subcategoria ?? null)
              setSelectedColors(f.colors ?? [])
              setSelectedSizes(f.sizes ?? [])
              setSelectedSort(f.sort ?? null)
              setSelectedOnSale(Boolean(f.on_sale))
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
              setSelectedOnSale(false)
              setSelectedFeatured(false)
              setSelectedIsVip(false)
              setSelectedIsNew(false)
            }}
          />

          <AccessoriesProducts
            selectedSubcategory={selectedSubcategory}
            selectedColors={selectedColors}
            selectedSizes={selectedSizes}
            selectedSort={selectedSort}
            selectedOnSale={selectedOnSale}
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
