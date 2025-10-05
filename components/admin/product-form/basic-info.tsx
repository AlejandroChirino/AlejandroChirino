"use client"

import Input from "@/components/ui/input"
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

      <Input
        label="Nombre del producto"
        value={formData.name}
        onChange={(e) => updateField("name", e.target.value)}
        error={errors.name}
        required
        placeholder="Ej: Vestido elegante de verano"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción <span className="text-red-500">*</span>
        </label>
        <Textarea
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Describe las características, materiales, y detalles del producto..."
          rows={4}
          className={errors.description ? "border-red-300" : ""}
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>
    </div>
  )
}
