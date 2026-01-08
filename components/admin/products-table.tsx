"use client"

import { useState, useEffect } from "react"
import { Trash2, Edit, Settings } from "lucide-react"
// ✅ Correcto
import Button from "@/components/ui/button"

import { formatPrice } from "@/lib/utils"
import type { ProductWithCalculations } from "@/lib/admin-types"
import { SUBCATEGORIAS } from "@/lib/types"

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
  const [saleAction, setSaleAction] = useState<string>("") // "apply" | "remove"
  const [saleMode, setSaleMode] = useState<string>("percent") // "percent" | "amount"
  const [saleValue, setSaleValue] = useState<string>("")
  // Campos editables adicionales y flags "dirty" para enviar solo los modificados
  const [name, setName] = useState<string>("")
  const [nameDirty, setNameDirty] = useState<boolean>(false)

  const [price, setPrice] = useState<string>("")
  const [priceDirty, setPriceDirty] = useState<boolean>(false)

  const [stock, setStock] = useState<string>("")
  const [stockDirty, setStockDirty] = useState<boolean>(false)

  const [sizes, setSizes] = useState<string[]>([])
  const [sizesDirty, setSizesDirty] = useState<boolean>(false)

  const [colors, setColors] = useState<string[]>([])
  const [colorsDirty, setColorsDirty] = useState<boolean>(false)

  const [imageUrl, setImageUrl] = useState<string>("")
  const [imageUrlDirty, setImageUrlDirty] = useState<boolean>(false)

  // nuevos campos solicitados
  const [brand, setBrand] = useState<string>("")
  const [brandDirty, setBrandDirty] = useState<boolean>(false)

  const [tagsField, setTagsField] = useState<string[]>([])
  const [tagsDirty, setTagsDirty] = useState<boolean>(false)

  const [peso, setPeso] = useState<string>("")
  const [pesoDirty, setPesoDirty] = useState<boolean>(false)

  const [precioCompra, setPrecioCompra] = useState<string>("")
  const [precioCompraDirty, setPrecioCompraDirty] = useState<boolean>(false)

  const [categoryField, setCategoryField] = useState<string>("")
  const [categoryDirty, setCategoryDirty] = useState<boolean>(false)

  const [subcategoriaField, setSubcategoriaField] = useState<string>("")
  const [subcategoriaDirty, setSubcategoriaDirty] = useState<boolean>(false)

  const [description, setDescription] = useState<string>("")
  const [descriptionDirty, setDescriptionDirty] = useState<boolean>(false)

  const allSelected = products.length > 0 && selectedProducts.length === products.length
  const someSelected = selectedProducts.length > 0

  // opciones predefinidas (traídas desde API admin/meta y admin/options)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([])
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState<Record<string, string[]>>({})
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [availableSizesOptions, setAvailableSizesOptions] = useState<string[]>([])
  const [availableColorsOptions, setAvailableColorsOptions] = useState<string[]>([])

  // inputs para crear nuevas opciones en el modal
  const [newSizeInput, setNewSizeInput] = useState<string>("")
  const [newColorInput, setNewColorInput] = useState<string>("")
  const [newTagInput, setNewTagInput] = useState<string>("")
  const [newCategoryInput, setNewCategoryInput] = useState<string>("")

  // Predefinidos (coinciden con product-form/variants y product-form/categorization)
  const PREDEFINED_CATEGORIES = ["mujer", "hombre", "accesorios"]
  const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"]
  const DEFAULT_COLORS = ["Negro", "Blanco", "Gris", "Azul", "Rojo", "Verde", "Amarillo", "Rosa", "Morado", "Marrón"]

  useEffect(() => {
    let mounted = true
    // meta (categories, subcategories, brands, tags)
    fetch('/api/admin/meta')
      .then(r => r.json())
      .then(json => {
        if (!mounted) return
        if (json && !json.error) {
          // Mostrar categorías predefinidas en lugar de depender solo de la BDD
          setAvailableCategories(PREDEFINED_CATEGORIES)
          setAvailableSubcategories(json.subcategories || [])
          setAvailableBrands(json.brands || [])
          setAvailableTags(json.tags || [])
          // Combinar subcategoriesByCategory de la API con las predefinidas (SUBCATEGORIAS)
          const mergedSubs = {
            ...(SUBCATEGORIAS as any),
            ...(json.subcategoriesByCategory || {}),
          }
          setSubcategoriesByCategory(mergedSubs)
        }
      })
      .catch(() => {})

    // options (sizes/colors). No filtros por defecto.
    fetch('/api/admin/options')
      .then(r => r.json())
      .then(json => {
        if (!mounted) return
        if (json && !json.error) {
          const sizes = Array.from(new Set([...(json.sizes || []), ...DEFAULT_SIZES])).sort()
          const colors = Array.from(new Set([...(json.colors || []), ...DEFAULT_COLORS])).sort()
          setAvailableSizesOptions(sizes)
          setAvailableColorsOptions(colors)
        } else {
          setAvailableSizesOptions(DEFAULT_SIZES)
          setAvailableColorsOptions(DEFAULT_COLORS)
        }
      })
      .catch(() => {})

    return () => { mounted = false }
  }, [])

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

  // Construir lista de campos para dividir en dos columnas
  const fieldNodes: JSX.Element[] = [
    (
      <div key="name">
        <label className="text-sm text-gray-700">Nombre</label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setNameDirty(true) }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Dejar vacío para no cambiar"
        />
      </div>
    ),
    (
      <div key="price">
        <label className="text-sm text-gray-700">Precio</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => { setPrice(e.target.value); setPriceDirty(true) }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Ej. 19.99"
        />
      </div>
    ),
    (
      <div key="stock">
        <label className="text-sm text-gray-700">Stock</label>
        <input
          type="number"
          step="1"
          min="0"
          value={stock}
          onChange={(e) => { setStock(e.target.value); setStockDirty(true) }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Ej. 10"
        />
      </div>
    ),
    (
      <div key="sizes">
        <label className="text-sm text-gray-700">Tallas</label>
        {availableSizesOptions.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2">
              {availableSizesOptions.map((s) => {
                const active = sizes.includes(s)
                return (
                  <Button
                    key={s}
                    type="button"
                    variant={active ? "primary" : "outline"}
                    size="sm"
                    className={active ? "bg-[#4CAF50] text-white" : "border-[#424242] text-[#424242]"}
                    onClick={() => {
                      let next = [] as string[]
                      if (active) next = sizes.filter(x => x !== s)
                      else next = [...sizes, s]
                      setSizes(next)
                      setSizesDirty(true)
                    }}
                  >
                    {s}
                  </Button>
                )
              })}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newSizeInput}
                onChange={(e) => setNewSizeInput(e.target.value)}
                placeholder="Agregar talla"
                className="px-2 py-1 border border-gray-300 rounded-lg"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  const v = newSizeInput.trim()
                  if (!v) return
                  if (!availableSizesOptions.includes(v)) {
                    setAvailableSizesOptions((prev) => [...prev, v])
                  }
                  if (!sizes.includes(v)) setSizes((prev) => [...prev, v])
                  setSizesDirty(true)
                  setNewSizeInput("")
                }}
              >
                Agregar
              </Button>
            </div>
          </>
        ) : (
          <input
            type="text"
            value={sizes.join(',')}
            onChange={(e) => { setSizes(e.target.value.split(',').map(s=>s.trim()).filter(Boolean)); setSizesDirty(true) }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="S,M,L"
          />
        )}
      </div>
    ),
    (
      <div key="colors">
        <label className="text-sm text-gray-700">Colores</label>
        {availableColorsOptions.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2">
              {availableColorsOptions.map((c) => {
                const active = colors.includes(c)
                return (
                  <Button
                    key={c}
                    type="button"
                    variant={active ? "primary" : "outline"}
                    size="sm"
                    className={active ? "bg-[#4CAF50] text-white" : "border-[#424242] text-[#424242]"}
                    onClick={() => {
                      let next = [] as string[]
                      if (active) next = colors.filter(x => x !== c)
                      else next = [...colors, c]
                      setColors(next)
                      setColorsDirty(true)
                    }}
                  >
                    {c}
                  </Button>
                )
              })}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newColorInput}
                onChange={(e) => setNewColorInput(e.target.value)}
                placeholder="Agregar color"
                className="px-2 py-1 border border-gray-300 rounded-lg"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  const v = newColorInput.trim()
                  if (!v) return
                  if (!availableColorsOptions.includes(v)) {
                    setAvailableColorsOptions((prev) => [...prev, v])
                  }
                  if (!colors.includes(v)) setColors((prev) => [...prev, v])
                  setColorsDirty(true)
                  setNewColorInput("")
                }}
              >
                Agregar
              </Button>
            </div>
          </>
        ) : (
          <input
            type="text"
            value={colors.join(',')}
            onChange={(e) => { setColors(e.target.value.split(',').map(s=>s.trim()).filter(Boolean)); setColorsDirty(true) }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Rojo,Azul,Negro"
          />
        )}
      </div>
    ),
    (
      <div key="image">
        <label className="text-sm text-gray-700">Imagen principal (URL)</label>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => { setImageUrl(e.target.value); setImageUrlDirty(true) }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="https://.../imagen.jpg"
        />
      </div>
    ),
    (
      <div key="brand">
        <label className="text-sm text-gray-700">Marca</label>
        {availableBrands.length > 0 ? (
          <>
            <select value={brand} onChange={(e) => { setBrand(e.target.value); setBrandDirty(true) }} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">No cambiar</option>
              {availableBrands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={"" /* placeholder for new brand input refactor if needed */}
                onChange={() => {}}
                placeholder="Nueva marca (usar campo inferior)"
                className="w-full px-2 py-1 border border-gray-200 rounded-lg bg-gray-50 text-sm"
                disabled
              />
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newCategoryInput /* reuse temp input state for quick add */}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                placeholder="Agregar marca"
                className="px-2 py-1 border border-gray-300 rounded-lg"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  const v = newCategoryInput.trim()
                  if (!v) return
                  if (!availableBrands.includes(v)) setAvailableBrands((prev) => [...prev, v])
                  setBrand(v)
                  setBrandDirty(true)
                  setNewCategoryInput("")
                }}
              >
                Agregar
              </Button>
            </div>
          </>
        ) : (
          <input type="text" value={brand} onChange={(e) => { setBrand(e.target.value); setBrandDirty(true) }} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Marca" />
        )}
      </div>
    ),
    (
      <div key="tags">
        <label className="text-sm text-gray-700">Etiquetas</label>
        {availableTags.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((t) => {
                const active = tagsField.includes(t)
                return (
                  <Button
                    key={t}
                    type="button"
                    variant={active ? "primary" : "outline"}
                    size="sm"
                    className={active ? "bg-[#4CAF50] text-white" : "border-[#424242] text-[#424242]"}
                    onClick={() => {
                      let next = [] as string[]
                      if (active) next = tagsField.filter(x => x !== t)
                      else next = [...tagsField, t]
                      setTagsField(next)
                      setTagsDirty(true)
                    }}
                  >
                    {t}
                  </Button>
                )
              })}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="Agregar etiqueta"
                className="px-2 py-1 border border-gray-300 rounded-lg"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  const v = newTagInput.trim()
                  if (!v) return
                  if (!availableTags.includes(v)) setAvailableTags((prev) => [...prev, v])
                  if (!tagsField.includes(v)) setTagsField((prev) => [...prev, v])
                  setTagsDirty(true)
                  setNewTagInput("")
                }}
              >
                Agregar
              </Button>
            </div>
          </>
        ) : (
          <input type="text" value={tagsField.join(',')} onChange={(e) => { setTagsField(e.target.value.split(',').map(s=>s.trim()).filter(Boolean)); setTagsDirty(true) }} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="tag1,tag2" />
        )}
      </div>
    ),
    (
      <div key="peso">
        <label className="text-sm text-gray-700">Peso (kg)</label>
        <input type="number" step="0.01" min="0" value={peso} onChange={(e) => { setPeso(e.target.value); setPesoDirty(true) }} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0.5" />
      </div>
    ),
    (
      <div key="precio_compra">
        <label className="text-sm text-gray-700">Precio compra</label>
        <input type="number" step="0.01" min="0" value={precioCompra} onChange={(e) => { setPrecioCompra(e.target.value); setPrecioCompraDirty(true) }} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ej. 10.00" />
      </div>
    ),
    (
      <div key="category">
        <label className="text-sm text-gray-700">Categoría</label>
        {availableCategories.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((c) => {
                const active = categoryField === c
                return (
                  <Button
                    key={c}
                    type="button"
                    variant={active ? "primary" : "outline"}
                    size="sm"
                    className={active ? "bg-[#4CAF50] text-white" : "border-[#424242] text-[#424242]"}
                    onClick={() => { setCategoryField(active ? "" : c); setCategoryDirty(true); if (!active) setSubcategoriaField('') }}
                  >
                    {c}
                  </Button>
                )
              })}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                placeholder="Agregar categoría"
                className="px-2 py-1 border border-gray-300 rounded-lg"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  const v = newCategoryInput.trim()
                  if (!v) return
                  if (!availableCategories.includes(v)) setAvailableCategories((prev) => [...prev, v])
                  setCategoryField(v)
                  setCategoryDirty(true)
                  setSubcategoriaField("")
                  setNewCategoryInput("")
                }}
              >
                Agregar
              </Button>
            </div>
          </>
        ) : (
          <input
            type="text"
            value={categoryField}
            onChange={(e) => { setCategoryField(e.target.value); setCategoryDirty(true) }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="mujer / hombre / accesorios"
          />
        )}
      </div>
    ),
    (
      <div key="subcategoria">
        <label className="text-sm text-gray-700">Subcategoría</label>
        {categoryField && subcategoriesByCategory[categoryField] ? (
          <div className="flex flex-wrap gap-2">
            {subcategoriesByCategory[categoryField].map((s) => {
              const active = subcategoriaField === s
              return (
                <Button
                  key={s}
                  type="button"
                  variant={active ? "primary" : "outline"}
                  size="sm"
                  className={active ? "bg-[#4CAF50] text-white" : "border-[#424242] text-[#424242]"}
                  onClick={() => { setSubcategoriaField(active ? "" : s); setSubcategoriaDirty(true) }}
                >
                  {s}
                </Button>
              )
            })}
          </div>
        ) : availableSubcategories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availableSubcategories.map((s) => {
              const active = subcategoriaField === s
              return (
                <Button
                  key={s}
                  type="button"
                  variant={active ? "primary" : "outline"}
                  size="sm"
                  className={active ? "bg-[#4CAF50] text-white" : "border-[#424242] text-[#424242]"}
                  onClick={() => { setSubcategoriaField(active ? "" : s); setSubcategoriaDirty(true) }}
                >
                  {s}
                </Button>
              )
            })}
          </div>
        ) : (
          <input
            type="text"
            value={subcategoriaField}
            onChange={(e) => { setSubcategoriaField(e.target.value); setSubcategoriaDirty(true) }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="vestidos, camisetas..."
          />
        )}
      </div>
    ),
    (
      <div key="description">
        <label className="text-sm text-gray-700">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => { setDescription(e.target.value); setDescriptionDirty(true) }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Texto descriptivo..."
        />
      </div>
    ),
    (
      <div key="featured">
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
      </div>
    ),
    (
      <div key="vip">
        <label className="text-sm text-gray-700">VIP</label>
        <select value={bulkVip} onChange={(e) => setBulkVip(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
          <option value="">No cambiar</option>
          <option value="true">Marcar VIP</option>
          <option value="false">Quitar VIP</option>
        </select>
      </div>
    ),
    (
      <div key="nuevo">
        <label className="text-sm text-gray-700">Nuevo</label>
        <select value={bulkNew} onChange={(e) => setBulkNew(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
          <option value="">No cambiar</option>
          <option value="true">Marcar como nuevo</option>
          <option value="false">Quitar nuevo</option>
        </select>
      </div>
    ),
    (
      <div key="archivado">
        <label className="text-sm text-gray-700">Archivado</label>
        <select value={bulkArchived} onChange={(e) => setBulkArchived(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
          <option value="">No cambiar</option>
          <option value="true">Archivar</option>
          <option value="false">Restaurar</option>
        </select>
      </div>
    ),
    (
      <div key="offers">
        <label className="text-sm text-gray-700">Ofertas</label>
        <select value={saleAction} onChange={(e) => setSaleAction(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
          <option value="">No cambiar</option>
          <option value="apply">Aplicar oferta</option>
          <option value="remove">Quitar oferta</option>
        </select>
      </div>
    ),
  ]

  // si saleAction === 'apply' añadir campos extra al final
  if (saleAction === "apply") {
    fieldNodes.push(
      (
        <div key="saleMode">
          <label className="text-sm text-gray-700">Tipo</label>
          <select value={saleMode} onChange={(e) => setSaleMode(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="percent">Porcentaje (%)</option>
            <option value="amount">Monto fijo</option>
          </select>
        </div>
      )
    )
    fieldNodes.push(
      (
        <div key="saleValue">
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
        </div>
      )
    )
  }

  const half = Math.ceil(fieldNodes.length / 2)
  const leftNodes = fieldNodes.slice(0, half)
  const rightNodes = fieldNodes.slice(half)

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
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-full mx-4 lg:mx-0 lg:rounded-none lg:w-screen lg:max-w-none max-h-[90vh] overflow-y-auto">
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
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-full mx-4 lg:mx-0 lg:rounded-none lg:w-screen lg:max-w-none max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones masivas</h3>
            <p className="text-sm text-gray-600 mb-4">Aplica cambios a {selectedProducts.length} producto(s)</p>

              {/* Mostrar campos divididos en dos columnas usando listas preconstruidas */}
              <div className="lg:flex lg:gap-6">
                <div className="lg:flex-1 flex flex-col gap-4">{leftNodes}</div>
                <div className="lg:flex-1 flex flex-col gap-4 mt-4 lg:mt-0">{rightNodes}</div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowBulkModal(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    const changes: Record<string, any> = {}
                    if (bulkFeatured !== "") changes.featured = bulkFeatured === "true"
                    if (bulkVip !== "") changes.is_vip = bulkVip === "true"
                    if (bulkNew !== "") changes.is_new = bulkNew === "true"
                    if (bulkArchived !== "") changes.archived = bulkArchived === "true"

                    // Campos adicionales: solo añadir si el usuario los modificó (dirty)
                    if (nameDirty && name !== "") changes.name = name
                    if (priceDirty && price !== "") changes.price = Number(price)
                    if (stockDirty && stock !== "") changes.stock = Number(stock)
                    if (sizesDirty && Array.isArray(sizes) && sizes.length > 0) {
                      changes.sizes = sizes
                    }
                    if (colorsDirty && Array.isArray(colors) && colors.length > 0) {
                      changes.colors = colors
                    }
                    if (imageUrlDirty && imageUrl !== "") {
                      // send both image_url and image_urls for compatibility
                      changes.image_url = imageUrl
                      const many = imageUrl.split(',').map(s => s.trim()).filter(Boolean)
                      if (many.length > 1) changes.image_urls = many
                    }
                    if (categoryDirty && categoryField !== "") changes.category = categoryField
                    if (subcategoriaDirty && subcategoriaField !== "") changes.subcategoria = subcategoriaField
                    if (descriptionDirty && description !== "") changes.description = description

                    // nuevos campos
                    if (brandDirty && brand !== "") changes.brand = brand
                    if (tagsDirty && Array.isArray(tagsField) && tagsField.length > 0) changes.tags = tagsField
                    if (pesoDirty && peso !== "") changes.peso = Number(peso)
                    if (precioCompraDirty && precioCompra !== "") changes.precio_compra = Number(precioCompra)

                    if (saleAction) {
                      if (saleAction === "remove") {
                        changes.sale_action = { action: "remove" }
                      } else if (saleAction === "apply") {
                        changes.sale_action = { action: "apply", mode: saleMode, value: Number(saleValue) }
                      }
                    }

                    // Enviar solo si hay cambios
                    if (Object.keys(changes).length > 0) {
                      onBulkUpdate(changes)
                      setShowBulkModal(false)
                    }
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
