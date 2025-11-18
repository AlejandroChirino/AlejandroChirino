"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ProductFormData } from "@/lib/admin-types"

interface BasicInfoProps {
  formData: ProductFormData
  errors: Record<string, string>
  updateField: (field: keyof ProductFormData, value: any) => void
}

export function BasicInfo({ formData, errors, updateField }: BasicInfoProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>

      <div className="space-y-2">
        <Label htmlFor="product-name">
          Nombre del producto <span className="text-red-500">*</span>
        </Label>
        <Input
          id="product-name"
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Ej: Vestido elegante de verano"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="product-description">
          Descripción <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="product-description"
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Describe las características, materiales, y detalles del producto..."
          rows={4}
          className={errors.description ? "border-red-500" : ""}
        />
        {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
      </div>
    </div>
  )
}
