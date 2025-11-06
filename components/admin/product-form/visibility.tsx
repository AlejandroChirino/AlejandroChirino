"use client"

import { Checkbox } from "@/components/ui/checkbox"
import type { ProductFormData } from "@/lib/admin-types"

interface VisibilityProps {
  formData: ProductFormData
  updateField: (field: keyof ProductFormData, value: any) => void
}

export function Visibility({ formData, updateField }: VisibilityProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Visibilidad</h3>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked) => updateField("featured", checked)}
          />
          <label htmlFor="featured" className="text-sm font-medium text-gray-700">
            Producto destacado
          </label>
          <span className="text-xs text-gray-500">(Aparece en la página principal)</span>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_new"
            checked={formData.is_new}
            onCheckedChange={(checked) => updateField("is_new", checked)}
          />
          <label htmlFor="is_new" className="text-sm font-medium text-gray-700">
            Producto nuevo
          </label>
          <span className="text-xs text-gray-500">(Aparece en la sección "Nuevo")</span>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_vip"
            checked={formData.is_vip}
            onCheckedChange={(checked) => updateField("is_vip", checked)}
          />
          <label htmlFor="is_vip" className="text-sm font-medium text-gray-700">
            Producto VIP
          </label>
          <span className="text-xs text-gray-500">(Solo visible para usuarios VIP)</span>
        </div>
      </div>
    </div>
  )
}
