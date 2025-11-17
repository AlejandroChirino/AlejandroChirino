"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ProductFormData } from "@/lib/admin-types"
import { SUBCATEGORIAS, type ProductCategory } from "@/lib/types"

interface CategorizationProps {
  formData: ProductFormData
  errors: Record<string, string>
  updateField: (field: keyof ProductFormData, value: any) => void
}

// Build categories from SUBCATEGORIAS keys. Keep a stable ordering for the common categories.
const categories = ["mujer", "hombre", "accesorios"] as const
const CATEGORY_LABELS: Record<typeof categories[number], string> = {
  mujer: "Mujer",
  hombre: "Hombre",
  accesorios: "Accesorios",
}

function getSubcategoriesFor(category: ProductCategory) {
  const list = (SUBCATEGORIAS[category] || []) as readonly string[]
  // Exclude the "Ver todo" pseudo-subcategory used in filters/menus
  return list.filter((l) => l !== "Ver todo").map((label) => ({ value: label, label }))
}

export function Categorization({ formData, errors, updateField }: CategorizationProps) {
  const handleCategoryChange = (category: string) => {
    updateField("category", category)
    updateField("subcategoria", "") // Reset subcategory when category changes
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Categorización</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría <span className="text-red-500">*</span>
          </label>
          <Select value={formData.category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subcategoría <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.subcategoria}
            onValueChange={(value) => updateField("subcategoria", value)}
            disabled={!formData.category}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar subcategoría" />
            </SelectTrigger>
            <SelectContent>
              {formData.category &&
                getSubcategoriesFor(formData.category as ProductCategory).map((subcat) => (
                  <SelectItem key={subcat.value} value={subcat.value}>
                    {subcat.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.subcategoria && <p className="mt-1 text-sm text-red-600">{errors.subcategoria}</p>}
        </div>
      </div>
    </div>
  )
}
