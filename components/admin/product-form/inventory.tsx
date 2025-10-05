"use client"

import Input from "@/components/ui/input"
import type { ProductFormData } from "@/lib/admin-types"

interface InventoryProps {
  formData: ProductFormData
  errors: Record<string, string>
  updateField: (field: keyof ProductFormData, value: any) => void
}

export function Inventory({ formData, errors, updateField }: InventoryProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Inventario</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Stock disponible"
          type="number"
          value={formData.stock}
          onChange={(e) => updateField("stock", Number(e.target.value))}
          error={errors.stock}
          required
          min="0"
          placeholder="0"
        />
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Nota:</strong> El stock se refiere a la cantidad total disponible del producto, considerando todas las
          variantes de tallas y colores.
        </p>
      </div>
    </div>
  )
}
