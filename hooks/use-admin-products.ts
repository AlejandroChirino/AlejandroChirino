"use client"

import { useState, useEffect } from "react"
import type { ProductWithCalculations, AdminFilters } from "@/lib/admin-types"

interface UseAdminProductsReturn {
  products: ProductWithCalculations[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  selectedProducts: string[]
  filters: AdminFilters
  setFilters: (filters: AdminFilters) => void
  setPage: (page: number) => void
  toggleProductSelection: (id: string) => void
  selectAllProducts: () => void
  clearSelection: () => void
  deleteSelectedProducts: () => Promise<boolean>
  refreshProducts: () => void
}

export function useAdminProducts(): UseAdminProductsReturn {
  const [products, setProducts] = useState<ProductWithCalculations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [filters, setFilters] = useState<AdminFilters>({})
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== undefined && value !== "")),
      })

      const response = await fetch(`/api/admin/productos?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar productos")
      }

      setProducts(data.products)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const setPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const toggleProductSelection = (id: string) => {
    setSelectedProducts((prev) => (prev.includes(id) ? prev.filter((productId) => productId !== id) : [...prev, id]))
  }

  const selectAllProducts = () => {
    setSelectedProducts(products.map((p) => p.id))
  }

  const clearSelection = () => {
    setSelectedProducts([])
  }

  const deleteSelectedProducts = async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/productos?ids=${selectedProducts.join(",")}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al eliminar productos")
      }

      clearSelection()
      fetchProducts()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar productos")
      return false
    }
  }

  const refreshProducts = () => {
    fetchProducts()
  }

  useEffect(() => {
    fetchProducts()
  }, [pagination.page, filters])

  return {
    products,
    loading,
    error,
    pagination,
    selectedProducts,
    filters,
    setFilters,
    setPage,
    toggleProductSelection,
    selectAllProducts,
    clearSelection,
    deleteSelectedProducts,
    refreshProducts,
  }
}
