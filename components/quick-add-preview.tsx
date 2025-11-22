"use client"

import React from "react"
import Image from "next/image"
import ProductPrice from "@/components/product-price"
import VariantSelector from "@/components/variant-selector"

export default function QuickAddPreview({
  product,
  tempSize,
  tempColor,
  onSizeChange,
  onColorChange,
  onCancel,
  onAdd,
}: {
  product: any
  tempSize: string | null
  tempColor: string | null
  onSizeChange: (s: string) => void
  onColorChange: (c: string) => void
  onCancel: () => void
  onAdd: () => void
}) {
  if (!product) return null

  return (
    <div>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-20 h-24 relative rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
          <Image
            src={product.image_url || "/placeholder.svg?height=400&width=300&query=product"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 line-clamp-2" style={{ overflowWrap: "anywhere" }}>
            {product.name}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <ProductPrice price={product.price} sale_price={product.sale_price} on_sale={product.on_sale} compact={true} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <VariantSelector
          sizes={Array.isArray(product.sizes) ? product.sizes : []}
          colors={Array.isArray(product.colors) ? product.colors : []}
          selectedSize={tempSize}
          selectedColor={tempColor}
          onSizeChange={(s) => onSizeChange(s)}
          onColorChange={(c) => onColorChange(c)}
          availableStock={product.stock ?? 0}
        />

        <div className="pt-2 grid grid-cols-2 gap-2">
          <button onClick={onCancel} className="h-10 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={onAdd} className="h-10 rounded-full bg-accent-green text-white text-sm font-medium hover:brightness-105 transition-colors">
            Añadir a la bolsa
          </button>
        </div>
      </div>
    </div>
  )
}
