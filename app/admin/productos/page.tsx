"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Settings } from "lucide-react"
import Button from "@/components/ui/button"
import { ProductsTable } from "@/components/admin/products-table"
import { ProductsFilters } from "@/components/admin/products-filters"
import { useAdminProducts } from "@/hooks/use-admin-products"
import { useToast } from "@/components/ui/use-toast"
import { ConfiguracionPreciosModal } from "@/components/admin/configuracion-precios-modal"

export default function AdminProductosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showConfigModal, setShowConfigModal] = useState(false)

  const {
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
    updateProductsByIds,
    updateSelectedProducts,
    refreshProducts,
  } = useAdminProducts()

  const handleEdit = (id: string) => {
    router.push(`/admin/productos/editar/${id}`)
  }

  const handleDelete = async (ids: string[]): Promise<boolean> => {
    try {
      const success = await deleteProductsByIds(ids)
      if (success) {
        toast({
          title: "Productos eliminados",
          description: `${ids.length} producto(s) eliminados correctamente`,
        })
      }
      return success
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar productos"
      toast({ title: "Error al eliminar", description: message })
      return false
    }
  }

  const handleArchive = async (ids: string[], archived: boolean): Promise<boolean> => {
    try {
      const success = await updateProductsByIds(ids, { archived })
      if (success) {
        toast({ title: archived ? "Productos archivados" : "Productos restaurados", description: `${ids.length} producto(s) actualizados correctamente` })
      }
      return success
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar productos"
      toast({ title: "Error", description: message })
      return false
    }
  }

  const handleBulkUpdate = async (changes: { featured?: boolean | null; is_vip?: boolean | null; is_new?: boolean | null }) => {
    try {
      const success = await updateSelectedProducts(changes)
      if (success) {
        toast({
          title: "Actualización masiva",
          description: `Se aplicaron los cambios a ${selectedProducts.length} producto(s)`,
        })
      }
    } catch (err) {
      toast({ title: "Error", description: "No se pudo aplicar la actualización masiva" })
    }
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refreshProducts}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header: responsive - apila botones en móvil */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Productos</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Administra el catálogo de productos de La ⚡ Fashion</p>
            </div>

            <div className="flex w-full sm:w-auto flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button variant="outline" onClick={() => setShowConfigModal(true)} className="w-full sm:w-auto">
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Button>
              <Button variant="primary" onClick={() => router.push("/admin/productos/nuevo")} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Producto
              </Button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <ProductsFilters filters={filters} onFiltersChange={setFilters} onClearFilters={handleClearFilters} />

        {/* Tabla de productos */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        ) : (
          <>
            <ProductsTable
              products={products}
              selectedProducts={selectedProducts}
              onToggleSelection={toggleProductSelection}
              onSelectAll={selectAllProducts}
              onClearSelection={clearSelection}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onBulkUpdate={handleBulkUpdate}
              onArchive={handleArchive}
            />

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} productos
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="px-3 py-1 text-sm">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal de configuración (solo UI/frontend) */}
        <ConfiguracionPreciosModal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} />
      </div>
    </div>
  )
}
