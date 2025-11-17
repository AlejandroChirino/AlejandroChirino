"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Button from "@/components/ui/button"
import { X } from "lucide-react"
import type { ProductFormData } from "@/lib/admin-types"

interface VariantsProps {
  formData: ProductFormData
  errors: Record<string, string>
  updateField: (field: keyof ProductFormData, value: any) => void
}

const commonSizes = ["XS", "S", "M", "L", "XL", "XXL", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"]
const commonColors = ["Negro", "Blanco", "Gris", "Azul", "Rojo", "Verde", "Amarillo", "Rosa", "Morado", "Marrón"]

export function Variants({ formData, errors, updateField }: VariantsProps) {
  const [newSize, setNewSize] = useState("")
  const [newColor, setNewColor] = useState("")

  const addSize = (size: string) => {
    if (size && !formData.sizes.includes(size)) {
      updateField("sizes", [...formData.sizes, size])
    }
    setNewSize("")
  }

  const removeSize = (size: string) => {
    updateField("sizes", formData.sizes.filter((s) => s !== size))
  }

  const addColor = (color: string) => {
    if (color && !formData.colors.includes(color)) {
      updateField("colors", [...formData.colors, color])
    }
    setNewColor("")
  }

  const removeColor = (color: string) => {
    updateField("colors", formData.colors.filter((c) => c !== color))
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Variantes</h3>

      {/* Tallas */}
      <div className="space-y-2">
        <Label>
          Tallas disponibles <span className="text-red-500">*</span>
        </Label>

        <div className="flex flex-wrap gap-2">
          {commonSizes.map((size) => (
            <Button
              key={size}
              type="button"
              variant={formData.sizes.includes(size) ? "primary" : "outline"}
              className={
                formData.sizes.includes(size)
                  ? "bg-[#4CAF50] text-white hover:bg-[#43a047]"
                  : "border-[#424242] text-[#424242] hover:bg-transparent"
              }
              size="sm"
              onClick={() => {
                if (formData.sizes.includes(size)) {
                  removeSize(size)
                } else {
                  addSize(size)
                }
              }}
            >
              {size}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Talla personalizada"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSize(newSize);
              }
            }}
          />
          <Button type="button" onClick={() => addSize(newSize)} disabled={!newSize}>
            Agregar
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.sizes.map((size) => (
            <span
              key={size}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
            >
              {size}
              <button onClick={() => removeSize(size)} className="text-blue-600 hover:text-blue-800">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        {errors.sizes && <p className="mt-1 text-sm text-red-600">{errors.sizes}</p>}
      </div>

      {/* Colores */}
      <div className="space-y-2">
        <Label>
          Colores disponibles <span className="text-red-500">*</span>
        </Label>

        <div className="flex flex-wrap gap-2">
          {commonColors.map((color) => (
            <Button
              key={color}
              type="button"
              variant={formData.colors.includes(color) ? "primary" : "outline"}
              className={
                formData.colors.includes(color)
                  ? "bg-[#4CAF50] text-white hover:bg-[#43a047]"
                  : "border-[#424242] text-[#424242] hover:bg-transparent"
              }
              size="sm"
              onClick={() => {
                if (formData.colors.includes(color)) {
                  removeColor(color)
                } else {
                  addColor(color)
                }
              }}
            >
              {color}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Color personalizado"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addColor(newColor);
              }
            }}
          />
          <Button type="button" onClick={() => addColor(newColor)} disabled={!newColor}>
            Agregar
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.colors.map((color) => (
            <span
              key={color}
              className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm"
            >
              {color}
              <button onClick={() => removeColor(color)} className="text-green-600 hover:text-green-800">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        {errors.colors && <p className="mt-1 text-sm text-red-600">{errors.colors}</p>}
      </div>
    </div>
  )
}
