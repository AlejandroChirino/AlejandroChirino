"use client"

import { useState } from "react"
import { ProductForm } from "./product-form"
import Button from "@/components/ui/button"

export function MultipleProductsForm() {
  const [createdCount, setCreatedCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Creación múltiple de productos</h1>
            <p className="text-gray-600 mt-1">
              Crea varios productos de forma consecutiva. El formulario se limpiará después de cada creación.
            </p>
          </div>

          {createdCount > 0 && (
            <div className="text-right">
              <p className="text-lg font-semibold text-green-600">Productos creados: {createdCount}</p>
              <Button variant="outline" size="sm" onClick={() => setCreatedCount(0)}>
                Reiniciar contador
              </Button>
            </div>
          )}
        </div>

        <ProductForm allowMultiple onSuccess={() => setCreatedCount((prev) => prev + 1)} />
      </div>
    </div>
  )
}
