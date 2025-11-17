"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { labelFromSlug, slugFromLabel } from "@/lib/subcategoryUtils"
import { Crown, Lock } from "lucide-react"
// Header provisto por RootLayout
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import VipBenefits from "@/components/vip-benefits"
import VipFilters from "@/components/vip-filters"
import ArticulosEnCamino from "@/components/articulos-en-camino"
import LoadingSkeleton from "@/components/loading-skeleton"
import type { Product, VipFilters as VipFiltersType } from "@/lib/types"

export default function VipPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [filters, setFilters] = useState<VipFiltersType>({
    category: "all",
    sortBy: "newest",
    sortOrder: "desc",
  })

  // Inicializar filtros desde query params (category=subcategory)
  useEffect(() => {
    try {
      const cat = searchParams.get("category")
      const sub = searchParams.get("sub")
      const newFilters: Partial<VipFiltersType> = {}
      if (cat && (cat === "hombre" || cat === "mujer" || cat === "accesorios")) {
        newFilters.category = cat as any
      }
      if (sub) {
        // intentar mapear slug a label dentro de la categoría indicada
        const categoryKey = (newFilters.category as string) || "accesorios"
        const label = labelFromSlug(categoryKey as any, sub)
        if (label) newFilters.subcategoria = label
      }
      if (Object.keys(newFilters).length > 0) setFilters((prev) => ({ ...prev, ...newFilters }))
    } catch (e) {
      // ignore
    }
  }, [searchParams])

  // Mantener la URL en sync con los filtros (category + sub)
  useEffect(() => {
    try {
      const params = new URLSearchParams()
      if (filters.category && filters.category !== "all") params.set("category", filters.category)
      if ((filters as any).subcategoria) {
        const subLabel = (filters as any).subcategoria as string
        // necesitamos elegir una categoríaKey para slugify; preferir filters.category
        const categoryKey = (filters.category as string) || "accesorios"
        params.set("sub", slugFromLabel(categoryKey as any, subLabel))
      }
      const base = "/vip"
      const qs = params.toString()
      router.replace(qs ? `${base}?${qs}` : base)
    } catch (e) {
      // ignore
    }
  }, [filters, router])

  // Simulación de autenticación (reemplazar con lógica real)
  useEffect(() => {
    const checkAuthentication = () => {
      // Por ahora, simular que el usuario está autenticado
      // En el futuro, aquí se verificará el estado de autenticación real
      setTimeout(() => {
        setIsAuthenticated(true)
        setCheckingAuth(false)
      }, 1000)
    }

    checkAuthentication()
  }, [])

  // Cargar productos VIP
  useEffect(() => {
    if (!isAuthenticated) return

    async function fetchVipProducts() {
      try {
        setLoading(true)
        const params = new URLSearchParams()

        if (filters.category && filters.category !== "all") {
          params.append("category", filters.category)
        }
        if (filters.minPrice !== undefined) {
          params.append("minPrice", filters.minPrice.toString())
        }
        if (filters.maxPrice !== undefined) {
          params.append("maxPrice", filters.maxPrice.toString())
        }
        if (filters.sortBy) {
          params.append("sortBy", filters.sortBy)
        }
        if (filters.sortOrder) {
          params.append("sortOrder", filters.sortOrder)
        }

        const response = await fetch(`/api/vip/products?${params}`)
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        }
      } catch (error) {
        console.error("Error fetching VIP products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVipProducts()
  }, [isAuthenticated, filters])

  // Pantalla de carga de autenticación
  if (checkingAuth) {
    return (
      <div className="min-h-screen">
        {/* Header ya incluido en el layout raíz */}
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange mx-auto mb-4" />
              <p className="text-gray-600">Verificando acceso VIP...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Pantalla de acceso denegado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        {/* Header ya incluido en el layout raíz */}
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center py-16">
              <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-4">Acceso Restringido</h1>
              <p className="text-gray-600 mb-6">Esta sección está disponible solo para miembros VIP autenticados.</p>
              <a
                href="/cuenta"
                className="inline-block bg-accent-orange text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Iniciar Sesión
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header ya incluido en el layout raíz */}

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-orange to-orange-600 rounded-full mb-6">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              ACCESO VIP
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Bienvenido a tu zona exclusiva. Descubre productos únicos, ofertas especiales y experiencias
              personalizadas.
            </p>
          </div>

          {/* Beneficios VIP */}
          <VipBenefits />

          {/* Artículos en Camino */}
          <section className="mb-16">
            <ArticulosEnCamino />
          </section>

          {/* Productos VIP */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Productos Exclusivos</h2>
                <p className="text-gray-600">Colección limitada solo para miembros VIP</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filtros */}
              <div className="lg:col-span-1">
                <VipFilters filters={filters} onFiltersChange={setFilters} />
              </div>

              {/* Lista de productos */}
              <div className="lg:col-span-3">
                {loading ? (
                  <LoadingSkeleton count={8} compact />
                ) : products.length === 0 ? (
                  <div className="text-center py-16">
                    <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No hay productos disponibles</h3>
                    <p className="text-gray-600">Ajusta los filtros o vuelve más tarde para ver nuevos productos VIP</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-gray-600">
                        {products.length} producto{products.length !== 1 ? "s" : ""} exclusivo
                        {products.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map((product) => (
                        <div key={product.id} className="relative">
                          <ProductCard product={product} compact />
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-accent-orange to-orange-600 text-white px-2 py-1 rounded text-xs font-medium">
                            VIP
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
