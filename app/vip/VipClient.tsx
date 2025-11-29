"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { labelFromSlug, slugFromLabel } from "@/lib/subcategoryUtils"
import { Crown, Lock } from "lucide-react"
import ProductCard from "@/components/product-card"
import VipBenefits from "@/components/vip-benefits"
import VipFilters from "@/components/vip-filters"
import LoadingSkeleton from "@/components/loading-skeleton"
import type { Product, VipFilters as VipFiltersType } from "@/lib/types"

export default function VipClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [preferredMap, setPreferredMap] = useState<Record<string, string[]>>({})
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
        const categoryKey = (newFilters.category as string) || "accesorios"
        const label = labelFromSlug(categoryKey as any, sub)
        if (label) newFilters.subcategoria = label
      }
      if (Object.keys(newFilters).length > 0) setFilters((prev) => ({ ...prev, ...newFilters }))
    } catch (e) {
      // ignore
    }
  }, [searchParams])

  useEffect(() => {
    try {
      const params = new URLSearchParams()
      if (filters.category && filters.category !== "all") params.set("category", filters.category)
      if ((filters as any).subcategoria) {
        const subLabel = (filters as any).subcategoria as string
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

  

  return (
    <div className="bg-white">
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-0">
          <div className="text-center mb-12 pl-4 md:pl-6">
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

          <VipBenefits />
        </div>
      </main>
    </div>
  )
}
