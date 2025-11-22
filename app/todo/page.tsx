"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import LoadingSkeleton from "@/components/loading-skeleton"
import ProductFilterBar from "@/components/product-filter-bar"
import type { Product } from "@/lib/types"

export default function TodoPage() {
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // filter state
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedSort, setSelectedSort] = useState<string | null>(null)
  const [selectedOnSale, setSelectedOnSale] = useState<boolean>(false)
  const [selectedFeatured, setSelectedFeatured] = useState<boolean>(false)
  const [selectedIsVip, setSelectedIsVip] = useState<boolean>(false)
  const [selectedIsNew, setSelectedIsNew] = useState<boolean>(false)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)

        const params = new URLSearchParams()
        // Note: do NOT set category — this endpoint will return all products
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
  }, [selectedColors, selectedSizes, selectedSort, selectedOnSale, selectedFeatured, selectedIsVip, selectedIsNew])

  const [availableColors, setAvailableColors] = useState<string[]>([])
  const [availableSizes, setAvailableSizes] = useState<string[]>([])

  useEffect(() => {
    let mounted = true
    async function fetchOptions() {
      try {
        const params = new URLSearchParams()
        // no category param -> all
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
  }, [selectedOnSale, selectedFeatured, selectedIsVip, selectedIsNew])

  return (
    <div className="min-h-screen">
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 tracking-tighter leading-none">TIENDA COMPLETA</h1>
            <p className="text-gray-600">Encuentra tu estilo perfecto, la colección completa, lista para ti.</p>
          </div>

          <ProductFilterBar
            // use 'all' so the filter bar does not scope to a single category
            category="all"
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
              setSelectedColors([])
              setSelectedSizes([])
              setSelectedSort(null)
              setSelectedOnSale(false)
              setSelectedFeatured(false)
              setSelectedIsVip(false)
              setSelectedIsNew(false)
            }}
          />

          {loading ? (
            <LoadingSkeleton count={8} compact />
          ) : error ? (
            <div className="text-center text-gray-500 py-16"><p>{error}</p></div>
          ) : products.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              <p>No hay productos disponibles</p>
              <div className="mt-4">
                <button onClick={() => { setSelectedColors([]); setSelectedSizes([]); setSelectedSort(null); setSelectedOnSale(false); setSelectedFeatured(false); setSelectedIsVip(false); setSelectedIsNew(false); }} className="px-4 py-2 rounded-md bg-accent-orange text-white">Limpiar filtros</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} compact />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
