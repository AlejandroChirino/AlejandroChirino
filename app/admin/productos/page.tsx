"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Settings } from "lucide-react"
import Button from "@/components/ui/button"
import { ProductsTable } from "@/components/admin/products-table"
import { ProductsFilters } from "@/components/admin/products-filters"
import { useAdminProducts } from "@/hooks/use-admin-products"
import { useToast } from "@/components/ui/use-toast"

export default function AdminProductosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showConfigModal, setShowConfigModal] = useState(false)
  // Estado local solo para UI (sin backend): valores actuales mostrados y valores nuevos a ingresar
  const [currentDolar, setCurrentDolar] = useState<number | null>(null)
  const [currentLibra, setCurrentLibra] = useState<number | null>(null)
  const [newDolar, setNewDolar] = useState<string>("")
  const [newLibra, setNewLibra] = useState<string>("")

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
    refreshProducts,
  } = useAdminProducts()

  const handleEdit = (id: string) => {
    router.push(`/admin/productos/editar/${id}`)
  }

  const handleDelete = async (ids: string[]) => {
    const success = await deleteSelectedProducts()
    if (success) {
      toast({
        title: "Productos eliminados",
        description: `${ids.length} producto(s) eliminados correctamente`,
      })
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
            <p className="text-gray-600 mt-2">Administra el catálogo de productos de La ⚡ Fashion</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowConfigModal(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
            <Button variant="primary" onClick={() => router.push("/admin/productos/nuevo")}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Producto
            </Button>
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
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowConfigModal(false)}
              aria-hidden
            />

            {/* Dialog */}
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="config-modal-title"
              className="relative z-50 w-full max-w-md mx-4 bg-white rounded-lg shadow-xl border"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b">
                <h2 id="config-modal-title" className="text-xl font-semibold text-gray-900">
                  Configuración de precios
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Ajusta los valores de referencia que utiliza el panel de administración.
                </p>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-5">
                {/* Precios actuales */}
                <div className="rounded-md bg-gray-50 border p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Precios actuales</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Dólar (CUP):</span>
                    <span className="font-semibold text-gray-900">
                      {currentDolar !== null ? `${currentDolar}` : "—"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Precio por libra (USD):</span>
                    <span className="font-semibold text-gray-900">
                      {currentLibra !== null ? `${currentLibra}` : "—"}
                    </span>
                  </div>
                </div>

                {/* Nuevos valores */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo valor del dólar (CUP)</label>
                    <input
                      type="number"
                      value={newDolar}
                      onChange={(e) => setNewDolar(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:ring-offset-1 border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo precio por libra (USD)</label>
                    <input
                      type="number"
                      value={newLibra}
                      onChange={(e) => setNewLibra(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:ring-offset-1 border-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfigModal(false)
                    setNewDolar("")
                    setNewLibra("")
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    // Solo UI: aplicar a los valores actuales en memoria y cerrar
                    if (newDolar !== "") setCurrentDolar(Number(newDolar))
                    if (newLibra !== "") setCurrentLibra(Number(newLibra))
                    setShowConfigModal(false)
                    setNewDolar("")
                    setNewLibra("")
                  }}
                >
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
