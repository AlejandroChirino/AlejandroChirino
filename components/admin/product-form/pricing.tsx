"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
        <div className="space-y-2">
          <Label htmlFor="price">
            Precio regular (CUP) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => updateField("price", Number(e.target.value))}
            min="0"
            step="0.01"
            placeholder="0.00"
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sale_price">Precio de oferta (CUP)</Label>
          <Input
            id="sale_price"
            type="number"
            value={formData.sale_price || ""}
            onChange={(e) => updateField("sale_price", Number(e.target.value) || undefined)}
            min="0"
            step="0.01"
            placeholder="0.00"
            disabled={!formData.on_sale}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="on_sale"
          checked={formData.on_sale}
          onCheckedChange={(checked) => {
            const isChecked = checked === true
            updateField("on_sale", isChecked)
            if (!isChecked) {
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
