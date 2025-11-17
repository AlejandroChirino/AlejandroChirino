"use client"

import { useState, useEffect } from "react"
// Header provisto por RootLayout
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import LoadingSkeleton from "@/components/loading-skeleton"
import SubcategoryTabs from "@/components/subcategory-tabs"
import { supabase } from "@/lib/supabaseClient"
import type { Product } from "@/lib/types"

// New products component
function NewProducts({ selectedSubcategory }: { selectedSubcategory: string | null }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)

        // Calcular la fecha de hace 7 días
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const sevenDaysAgoISO = sevenDaysAgo.toISOString()

        let query = supabase
          .from("products")
          .select("id, name, price, sale_price, on_sale, image_url, category, subcategoria")
          .gte("created_at", sevenDaysAgoISO)
          .order("created_at", { ascending: false })

        // Filtrar por subcategoría si está seleccionada
        if (selectedSubcategory) {
          if (selectedSubcategory === "Hombre") {
            query = query.eq("category", "hombre")
          } else if (selectedSubcategory === "Mujer") {
            query = query.eq("category", "mujer")
          } else if (selectedSubcategory === "Accesorios") {
            query = query.eq("category", "accesorios")
          } else {
            // Para subcategorías específicas como "Zapatillas nuevas", "Ropa nueva", etc.
            // Podemos implementar lógica más específica aquí
            query = query.ilike("subcategoria", `%${selectedSubcategory.replace(" nuevas", "").replace(" nueva", "")}%`)
          }
        }

        const { data, error } = await query

        if (error) {
          setError("Error al cargar los productos nuevos")
          return
        }

        setProducts(data || [])
      } catch (err) {
        setError("Error al cargar los productos nuevos")
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
        <div className="text-6xl mb-4">✨</div>
        <h2 className="text-xl font-semibold mb-2">No hay productos nuevos</h2>
        <p className="mb-6">
          {selectedSubcategory
            ? `No hay productos nuevos en ${selectedSubcategory}`
            : "Estamos trabajando en traer nuevos productos pronto"}
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

export default function NuevoPage() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)

  return (
    <div className="min-h-screen">
      {/* Header ya incluido en el layout raíz */}

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero section */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">NUEVO</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Descubre nuestras últimas novedades. Productos añadidos en los últimos 7 días.
            </p>
          </div>

          {/* Filtros de subcategoría */}
          <SubcategoryTabs
            category="nuevo"
            selectedSubcategory={selectedSubcategory}
            onSubcategoryChange={setSelectedSubcategory}
          />

          {/* Grid de productos */}
          <NewProducts selectedSubcategory={selectedSubcategory} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
