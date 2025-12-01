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
  deleteProductsByIds: (ids: string[]) => Promise<boolean>
  updateSelectedProducts: (changes: Record<string, any>) => Promise<boolean>
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
    return deleteProductsByIds(selectedProducts)
  }

  const deleteProductsByIds = async (ids: string[]): Promise<boolean> => {
    if (!ids || ids.length === 0) {
      const msg = "No se especificaron ids para eliminar"
      setError(msg)
      throw new Error(msg)
    }

    // Sanitize ids (trim and remove surrounding angle brackets) and validate UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const cleanIds = ids.map((s) => String(s || "").trim().replace(/^<|>$/g, "")).filter(Boolean)
    const invalid = cleanIds.filter((id) => !uuidRegex.test(id))
    if (invalid.length > 0) {
      const msg = `IDs inválidos: ${invalid.join(", ")}`
      setError(msg)
      throw new Error(msg)
    }

    // First attempt without forcing (use cleaned ids)
    let response = await fetch(`/api/admin/productos?ids=${cleanIds.join(",")}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      const msg = data?.error || data?.message || "Error al eliminar productos"
      setError(msg)

      // If it's a FK conflict (409) or message mentions references, offer to force-delete
      if (response.status === 409 || (typeof msg === "string" && msg.toLowerCase().includes("referenci"))) {
        const confirmForce = typeof window !== "undefined" ? window.confirm(`${msg}\n\n¿Deseas forzar la eliminación y eliminar también las referencias en pedidos (esto borrará datos relacionados)?`) : false
        if (confirmForce) {
          // Retry with force flag (use cleaned ids)
          response = await fetch(`/api/admin/productos?ids=${cleanIds.join(",")}&force=true`, { method: "DELETE" })
          if (!response.ok) {
            const data2 = await response.json().catch(() => ({}))
            const msg2 = data2?.error || data2?.message || "Error al forzar eliminación"
            setError(msg2)
            throw new Error(msg2)
          }
          // success on forced delete
        } else {
          throw new Error(msg)
        }
      } else {
        throw new Error(msg)
      }
    }

    // Quitar ids eliminados de la selección si existen allí
    setSelectedProducts((prev) => prev.filter((id) => !cleanIds.includes(id)))
    fetchProducts()
    return true
  }

  const updateSelectedProducts = async (changes: Record<string, any>): Promise<boolean> => {
    try {
      const payload = {
        ids: selectedProducts,
        changes,
      }

      const response = await fetch(`/api/admin/productos`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al actualizar productos")
      }

      clearSelection()
      fetchProducts()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar productos")
      return false
    }
  }

  const updateProductsByIds = async (ids: string[], changes: Record<string, any>): Promise<boolean> => {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error("No se proporcionaron ids para actualizar")
      }

      const payload = { ids, changes }
      const response = await fetch(`/api/admin/productos`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        const msg = data?.error || data?.message || "Error al actualizar productos"
        setError(msg)
        throw new Error(msg)
      }

      // Remove updated ids from selection if present
      setSelectedProducts((prev) => prev.filter((id) => !ids.includes(id)))
      fetchProducts()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar productos")
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
    deleteProductsByIds,
    updateSelectedProducts,
    updateProductsByIds,
    refreshProducts,
  }
}
