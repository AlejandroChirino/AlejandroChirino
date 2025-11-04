"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Button from "@/components/ui/button"
import { useProductForm } from "@/hooks/use-product-form"
import { BasicInfo } from "./product-form/basic-info"
import { Categorization } from "./product-form/categorization"
import { Pricing } from "./product-form/pricing"
import { Investment } from "./product-form/investment"
import { Variants } from "./product-form/variants"
import { Inventory } from "./product-form/inventory"
import { Visibility } from "./product-form/visibility"
import { ImageUpload } from "./product-form/image-upload"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface ProductFormProps {
  productId?: string
  onSuccess?: () => void
}

export function ProductForm({ productId, onSuccess }: ProductFormProps) {
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [quantity, setQuantity] = useState(10)
  const { formData, loading, errors, updateField, submitForm, resetForm, loadProduct } = useProductForm(productId)

  useEffect(() => {
    if (productId) {
      loadProduct(productId)
    }
  }, [productId, loadProduct])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const success = await submitForm(isBulkMode ? quantity : 1)
    if (success) {
      onSuccess?.()
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{productId ? "Editar producto" : "Crear nuevo producto"}</h1>

        {!productId && (
          <div className="mt-4 rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="bulk-mode"
                  checked={isBulkMode}
                  onCheckedChange={setIsBulkMode}
                  className="data-[state=checked]:bg-[#4CAF50] data-[state=unchecked]:bg-[#F44336]"
                />
                <Label htmlFor="bulk-mode" className="text-sm font-medium">
                  Creación en masa
                </Label>
              </div>
            </div>
            {isBulkMode && (
              <div className="mt-4">
                <Label htmlFor="quantity">Cantidad a crear</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(Number(e.target.value))}
                  className="mt-2 max-w-xs"
                  min="1"
                  placeholder="Ej: 50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se crearán {quantity} productos con la misma información.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg border p-6">
          <BasicInfo formData={formData} errors={errors} updateField={updateField} />
        </div>

        <div className="bg-white rounded-lg border p-6">
          <Categorization formData={formData} errors={errors} updateField={updateField} />
        </div>

        <div className="bg-white rounded-lg border p-6">
          <Pricing formData={formData} errors={errors} updateField={updateField} />
        </div>

        <div className="bg-white rounded-lg border p-6">
          <Investment formData={formData} errors={errors} updateField={updateField} />
        </div>

        <div className="bg-white rounded-lg border p-6">
          <Variants formData={formData} errors={errors} updateField={updateField} />
        </div>

        <div className="bg-white rounded-lg border p-6">
          <Inventory formData={formData} errors={errors} updateField={updateField} />
        </div>

        <div className="bg-white rounded-lg border p-6">
          <Visibility formData={formData} updateField={updateField} />
        </div>

        <div className="bg-white rounded-lg border p-6">
          <ImageUpload formData={formData} updateField={updateField} />
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancelar
          </Button>

          <Button type="submit" loading={loading} disabled={loading}>
            {loading
              ? "Guardando..."
              : productId
                ? "Actualizar producto"
                : isBulkMode
                  ? `Crear ${quantity} productos`
                  : "Crear producto"}
          </Button>
        </div>
      </form>
    </div>
  )
}
