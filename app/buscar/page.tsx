"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import { debounce } from "@/lib/utils"
import type { Product, ProductCategory } from "@/lib/types"

export default function BuscarPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(!!initialQuery)
  const [category, setCategory] = useState<ProductCategory | "all">("all")

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string, cat: ProductCategory | "all") => {
      if (!query.trim()) return

      setLoading(true)
      try {
        const params = new URLSearchParams({
          q: query,
          ...(cat !== "all" && { category: cat }),
        })

        const response = await fetch(`/api/search?${params}`)
        if (response.ok) {
          const results = await response.json()
          setProducts(results)
        } else {
          setProducts([])
        }
      } catch (error) {
        console.error("Error searching products:", error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }, 300),
    [],
  )

  // Effect for initial search
  useEffect(() => {
    if (initialQuery) {
      debouncedSearch(initialQuery, category)
    }
  }, [initialQuery, category, debouncedSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setHasSearched(true)
    debouncedSearch(searchQuery, category)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (value.trim() && hasSearched) {
      debouncedSearch(value, category)
    }
  }

  const handleCategoryChange = (newCategory: ProductCategory | "all") => {
    setCategory(newCategory)
    if (searchQuery.trim() && hasSearched) {
      debouncedSearch(searchQuery, newCategory)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Buscar Productos</h1>

          {/* Search form */}
          <form onSubmit={handleSearch} className="mb-8 space-y-4">
            <div className="flex gap-4">
              <Input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder="Buscar productos..."
                className="flex-1"
                aria-label="Buscar productos"
              />
              <Button type="submit" loading={loading} disabled={!searchQuery.trim()}>
                Buscar
              </Button>
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 py-2">Categoría:</span>
              {[
                { value: "all", label: "Todas" },
                { value: "mujer", label: "Mujer" },
                { value: "hombre", label: "Hombre" },
                { value: "accesorios", label: "Accesorios" },
                { value: "unisex", label: "Unisex" },
              ].map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleCategoryChange(cat.value as ProductCategory | "all")}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    category === cat.value
                      ? "bg-accent-orange text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </form>

          {/* Loading state */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-orange" />
                <span>Buscando productos...</span>
              </div>
            </div>
          )}

          {/* No search performed */}
          {!loading && !hasSearched && (
            <div className="text-center text-gray-500 py-16">
              <p>Ingresa un término de búsqueda para encontrar productos</p>
            </div>
          )}

          {/* No results */}
          {!loading && hasSearched && products.length === 0 && searchQuery.trim() && (
            <div className="text-center text-gray-500 py-16">
              <p>No se encontraron productos para "{searchQuery}"</p>
              <p className="text-sm mt-2">Intenta con otros términos de búsqueda</p>
            </div>
          )}

          {/* Results */}
          {!loading && products.length > 0 && (
            <div>
              <p className="mb-6 text-gray-600">
                Se encontraron {products.length} productos para "{searchQuery}"
                {category !== "all" && ` en la categoría ${category}`}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} compact />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
