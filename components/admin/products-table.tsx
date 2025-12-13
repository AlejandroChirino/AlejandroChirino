"use client"

import { useState } from "react"
import { Trash2, Edit, Settings } from "lucide-react"
// ✅ Correcto
import Button from "@/components/ui/button"

import { formatPrice } from "@/lib/utils"
import type { ProductWithCalculations } from "@/lib/admin-types"

interface ProductsTableProps {
  products: ProductWithCalculations[]
  selectedProducts: string[]
  onToggleSelection: (id: string) => void
  onSelectAll: () => void
  onClearSelection: () => void
  onEdit: (id: string) => void
  onDelete: (ids: string[]) => Promise<boolean>
  onBulkUpdate: (changes: Record<string, any>) => void
  onArchive: (ids: string[], archived: boolean) => Promise<boolean>
}

export function ProductsTable({
  products,
  selectedProducts,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onEdit,
  onDelete,
  onBulkUpdate,
  onArchive,
}: ProductsTableProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkFeatured, setBulkFeatured] = useState<string>("")
  const [bulkVip, setBulkVip] = useState<string>("")
  const [bulkNew, setBulkNew] = useState<string>("")
  const [bulkArchived, setBulkArchived] = useState<string>("")
  const [showSaleModal, setShowSaleModal] = useState(false)
  const [saleAction, setSaleAction] = useState<string>("") // "apply" | "remove"
  const [saleMode, setSaleMode] = useState<string>("percent") // "percent" | "amount"
  const [saleValue, setSaleValue] = useState<string>("")

  const allSelected = products.length > 0 && selectedProducts.length === products.length
  const someSelected = selectedProducts.length > 0

  const handleDeleteSelected = () => {
    if (selectedProducts.length > 0) {
      setShowDeleteConfirm(true)
    }
  }

  const confirmDelete = async () => {
    // Espera la operación delete. Solo cierra el modal si fue exitosa.
    try {
      const ok = await onDelete(selectedProducts)
      if (ok) setShowDeleteConfirm(false)
    } catch (err) {
      // Si ocurre un error, mantenemos el modal abierto para que el usuario lo note.
      // (El manejo de errores/mostrar toast está en el padre)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header con acciones */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={allSelected ? onClearSelection : onSelectAll}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-600">
            {selectedProducts.length > 0 ? `${selectedProducts.length} seleccionados` : `${products.length} productos`}
          </span>
        </div>

        {someSelected && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowBulkModal(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Acciones
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSaleModal(true)}>
              <span className="w-4 h-4 mr-2">%</span>
              Ofertas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteSelected}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar seleccionados
            </Button>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-[1100px] w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={allSelected ? onClearSelection : onSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                Inversión CUP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 h-20 sm:h-auto">
                <td className="px-6 py-4 min-w-0 align-middle">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => onToggleSelection(product.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4 min-w-0 align-middle">
                  <div className="flex items-center">
                    {product.image_url && (
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover mr-3 flex-shrink-0"
                      />
                    )}
                    <div className="overflow-hidden">
                      <div className="text-sm font-medium text-gray-900 whitespace-normal break-words">{product.name}</div>
                      {/* Descripción oculta en móvil, visible en sm+ */}
                      <div className="text-sm text-gray-500 hidden sm:block">{product.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 min-w-0 align-middle">
                  <div className="text-sm text-gray-900">{product.category}</div>
                  <div className="text-sm text-gray-500 hidden sm:block">{product.subcategoria}</div>
                </td>
                <td className="px-6 py-4 min-w-0">
                  <div className="text-sm text-gray-900">{formatPrice(product.price)}</div>
                  {product.on_sale && product.sale_price && (
                    <div className="text-sm text-red-600">{formatPrice(product.sale_price)}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 min-w-0">
                  ${product.inversion_cup?.toFixed(2)} CUP
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 min-w-0">{product.stock}</td>
                <td className="px-6 py-4 min-w-0">
                  <div className="flex flex-col gap-1">
                    {product.featured && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 w-fit">
                        Destacado
                      </span>
                    )}
                    {product.is_vip && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 w-fit">
                        VIP
                      </span>
                    )}
                    {product.is_new && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                        Nuevo
                      </span>
                    )}
                    {product.on_sale && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 w-fit">
                        Oferta
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium min-w-0 sticky right-0 bg-white z-10 align-middle">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(product.id)}
                      className="w-full sm:w-auto text-green-600 border border-green-600 rounded px-2 py-1 text-xs hover:bg-green-50"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => onArchive([product.id], !(product as any).archived)}
                      className="w-full sm:w-auto text-yellow-600 border border-yellow-400 rounded px-2 py-1 text-xs hover:bg-yellow-50"
                    >
                      {(product as any).archived ? "Restaurar" : "Archivar"}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete([product.id])}
                      className="w-full sm:w-auto text-red-600 border border-red-600 rounded px-2 py-1 text-xs hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar eliminación</h3>
            <p className="text-sm text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar {selectedProducts.length} producto(s)? Esta acción no se puede
              deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal acciones masivas */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones masivas</h3>
            <p className="text-sm text-gray-600 mb-4">Aplica cambios a {selectedProducts.length} producto(s)</p>

            <div className="grid grid-cols-1 gap-3">
              <label className="text-sm text-gray-700">Destacado</label>
              <select
                value={bulkFeatured}
                onChange={(e) => setBulkFeatured(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">No cambiar</option>
                <option value="true">Marcar como destacado</option>
                <option value="false">Quitar destacado</option>
              </select>

              <label className="text-sm text-gray-700">VIP</label>
              <select value={bulkVip} onChange={(e) => setBulkVip(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">No cambiar</option>
                <option value="true">Marcar VIP</option>
                <option value="false">Quitar VIP</option>
              </select>

              <label className="text-sm text-gray-700">Nuevo</label>
              <select value={bulkNew} onChange={(e) => setBulkNew(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">No cambiar</option>
                <option value="true">Marcar como nuevo</option>
                <option value="false">Quitar nuevo</option>
              </select>

              <label className="text-sm text-gray-700">Archivado</label>
              <select value={bulkArchived} onChange={(e) => setBulkArchived(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">No cambiar</option>
                <option value="true">Archivar</option>
                <option value="false">Restaurar</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowBulkModal(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const changes: { featured?: boolean | null; is_vip?: boolean | null; is_new?: boolean | null; archived?: boolean | null } = {}
                  if (bulkFeatured !== "") changes.featured = bulkFeatured === "true"
                  if (bulkVip !== "") changes.is_vip = bulkVip === "true"
                  if (bulkNew !== "") changes.is_new = bulkNew === "true"
                  if (bulkArchived !== "") changes.archived = bulkArchived === "true"

                  onBulkUpdate(changes)
                  setShowBulkModal(false)
                }}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ofertas (separado) */}
      {showSaleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Poner en oferta</h3>
            <p className="text-sm text-gray-600 mb-4">Aplica una oferta a {selectedProducts.length} producto(s)</p>

            <div className="grid grid-cols-1 gap-3">
              <label className="text-sm text-gray-700">Acción</label>
              <select value={saleAction} onChange={(e) => setSaleAction(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Seleccionar acción</option>
                <option value="apply">Aplicar descuento</option>
                <option value="remove">Quitar oferta</option>
              </select>

              {saleAction === "apply" && (
                <>
                  <label className="text-sm text-gray-700">Tipo</label>
                  <select value={saleMode} onChange={(e) => setSaleMode(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="percent">Porcentaje (%)</option>
                    <option value="amount">Monto fijo</option>
                  </select>

                  <label className="text-sm text-gray-700">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={saleValue}
                    onChange={(e) => setSaleValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder={saleMode === "percent" ? "% de descuento (ej. 20)" : "Monto a restar (ej. 5.00)"}
                  />
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowSaleModal(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  // Validation
                  if (saleAction === "") return
                  if (saleAction === "apply" && (!saleValue || Number(saleValue) <= 0)) return

                  const sale_action: any = { action: saleAction }
                  if (saleAction === "apply") {
                    sale_action.mode = saleMode
                    sale_action.value = Number(saleValue)
                  }

                  onBulkUpdate({ sale_action })
                  setShowSaleModal(false)
                }}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
