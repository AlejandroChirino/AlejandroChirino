"use client"

import Input from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import type { ProductFormData } from "@/lib/admin-types"

interface PricingProps {
  formData: ProductFormData
  errors: Record<string, string>
  updateField: (field: keyof ProductFormData, value: any) => void
}

export function Pricing({ formData, errors, updateField }: PricingProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Precios</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Precio regular (CUP)"
          type="number"
          value={formData.price}
          onChange={(e) => updateField("price", Number(e.target.value))}
          error={errors.price}
          required
          min="0"
          step="0.01"
          placeholder="0.00"
        />

        <Input
          label="Precio de oferta (CUP)"
          type="number"
          value={formData.sale_price || ""}
          onChange={(e) => updateField("sale_price", Number(e.target.value) || undefined)}
          min="0"
          step="0.01"
          placeholder="0.00"
          disabled={!formData.on_sale}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="on_sale"
          checked={formData.on_sale}
          onCheckedChange={(checked) => {
            updateField("on_sale", checked)
            if (!checked) {
              updateField("sale_price", undefined)
            }
          }}
        />
        <label htmlFor="on_sale" className="text-sm font-medium text-gray-700">
          Producto en oferta
        </label>
      </div>
    </div>
  )
}
