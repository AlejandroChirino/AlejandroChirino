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

interface ProductFormProps {
  productId?: string
  onSuccess?: () => void
  allowMultiple?: boolean
}

export function ProductForm({ productId, onSuccess, allowMultiple = false }: ProductFormProps) {
  const [createdCount, setCreatedCount] = useState(0)
  const [isMultipleMode, setIsMultipleMode] = useState(false)

  const { formData, loading, errors, updateField, submitForm, resetForm, loadProduct } = useProductForm(productId)

  useEffect(() => {
    if (productId) {
      loadProduct(productId)
    }
  }, [productId, loadProduct])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const success = await submitForm(isMultipleMode)
    if (success) {
      if (isMultipleMode) {
        setCreatedCount((prev) => prev + 1)
      } else {
        onSuccess?.()
      }
    }
  }

  const handleReset = () => {
    resetForm()
    setCreatedCount(0)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{productId ? "Editar producto" : "Crear nuevo producto"}</h1>

        {allowMultiple && !productId && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isMultipleMode}
                  onChange={(e) => setIsMultipleMode(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium">Modo creación múltiple</span>
              </label>

              {createdCount > 0 && (
                <span className="text-sm text-green-600 font-medium">Productos creados: {createdCount}</span>
              )}
            </div>

            {isMultipleMode && (
              <Button variant="outline" onClick={handleReset}>
                Reiniciar contador
              </Button>
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
                : isMultipleMode
                  ? "Crear y continuar"
                  : "Crear producto"}
          </Button>
        </div>
      </form>
    </div>
  )
}
