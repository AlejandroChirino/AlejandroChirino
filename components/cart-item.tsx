"use client"

import Image from "next/image"
import Link from "next/link"
import { Trash2, Minus, Plus, Heart, Check } from "lucide-react"
import { useState } from "react"
import { useCart } from "@/contexts/cart-context"
import { formatPrice } from "@/lib/utils"
import type { CartItem as CartItemType } from "@/lib/types"
import { useFavorites } from "@/hooks/use-favorites"
import ActionSheet from "@/components/ui/action-sheet"
import VariantSelector from "@/components/variant-selector"

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, updateItemOptions, removeItem, isLoading, selectedIds, toggleSelect } = useCart()
  const { product, quantity, size, color } = item
  const { isFavorite, toggleFavorite } = useFavorites()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [tempColor, setTempColor] = useState<string | null>(color)
  const [tempSize, setTempSize] = useState<string | null>(size)

  // Defensive defaults for sizes/colors (avoid TypeError if data is missing)
  const sizes = Array.isArray(product?.sizes) ? product.sizes : []
  const colors = Array.isArray(product?.colors) ? product.colors : []

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      updateQuantity(item.id, newQuantity)
    }
  }

  const handleRemove = () => removeItem(item.id)

  const currentPrice = product.on_sale && product.sale_price != null ? product.sale_price : product.price
  const hasDiscount = product.on_sale && product.sale_price != null && product.sale_price < product.price

  const isSelected = selectedIds.includes(item.id)

  return (
    <div className="flex gap-3 py-2 items-center">
      {/* Selector moved to the left of the image and made circular */}
      <div className="flex-shrink-0 flex items-center justify-center">
        <button
          aria-label={isSelected ? "Deseleccionar producto" : "Seleccionar producto"}
          onClick={() => toggleSelect(item.id)}
          className={
            `w-6 h-6 grid place-items-center focus:outline-none transition-colors border ${
              isSelected
                ? "bg-[var(--brand-green)] text-white border-transparent"
                : "bg-white text-[var(--brand-green)] border border-[var(--brand-green)]"
            } rounded-full`
          }
        >
          {isSelected ? <Check className="h-3 w-3" /> : <span className="text-sm font-semibold">✓</span>}
        </button>
      </div>

      {/* Imagen */}
      <div className="w-[80px] sm:w-[90px] aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
        <Link href={`/producto/${product.id}`}>
          <Image
            src={product.image_url || "/placeholder.svg?height=400&width=300&query=product"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="100px"
          />
        </Link>
      </div>

      {/* Selector único (circular a la izquierda) - antiguo selector cuadrado eliminado */}
      {/* Detalles */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Fila superior */}
        <div className="flex items-center justify-between gap-2 flex-nowrap">
          <Link
            href={`/producto/${product.id}`}
            className="min-w-0 flex-1 block text-sm sm:text-base font-medium text-gray-900 hover:text-accent-orange transition-colors truncate"
            title={product.name}
            style={{ overflowWrap: "anywhere" }}
          >
            {product.name}
          </Link>
          <button
            onClick={() => toggleFavorite(product.id)}
            aria-label={isFavorite(product.id) ? "Quitar de favoritos" : "Añadir a favoritos"}
            className={`ml-2 flex-shrink-0 transition-colors ${
              isFavorite(product.id) ? "text-[var(--brand-green)]" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Heart className="h-5 w-5" fill={isFavorite(product.id) ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Detalles y controles: nombre arriba, debajo selector + controles a la derecha */}
        <div className="mt-1">
          <div className="min-w-0">
            {/* Variante (texto compacto debajo del título) */}
            <div className="mt-1">
              <div className="text-sm text-gray-500">{color || size ? `${color || ""}${color && size ? " / " : ""}${size || ""}` : "-"}</div>
            </div>

            {/* Controles: cantidad | eliminar */}
            <div className="flex items-center gap-3 flex-wrap mt-2">
              <div className="flex-1 min-w-0" />

              {/* Modificador de cantidad centrado entre selector y eliminar */}
              <div className="flex-shrink-0 flex items-center justify-center">
                <div className="flex items-center rounded-md border border-gray-200 bg-white overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1 || isLoading}
                    className="w-6 h-6 grid place-items-center text-gray-700 border-r border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="px-2 text-sm min-w-[24px] text-center text-gray-900">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock || isLoading}
                    className="w-6 h-6 grid place-items-center text-gray-700 border-l border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Botón eliminar a la derecha, con dimensiones igualadas para evitar desbordes */}
              <div className="shrink-0">
                <button
                  onClick={handleRemove}
                  disabled={isLoading}
                  className="flex items-center justify-center w-6 h-6 text-gray-500 hover:text-gray-700 transition-colors rounded"
                  aria-label="Eliminar producto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Línea inferior exclusiva para el precio */}
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-gray-900 font-bold">{formatPrice(currentPrice)}</span>
                {hasDiscount && <span className="text-sm text-gray-500 line-through">{formatPrice(product.price)}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ActionSheet retained for advanced edits (kept for backward compatibility) */}
      <ActionSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Opciones del producto">
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
              <span className="text-accent-orange font-semibold text-sm">{formatPrice(currentPrice)}</span>
              {hasDiscount && (
                <span className="text-[11px] text-gray-500 line-through">{formatPrice(product.price)}</span>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <VariantSelector
            sizes={sizes}
            colors={colors}
            selectedSize={tempSize}
            selectedColor={tempColor}
            onSizeChange={(s) => setTempSize(s)}
            onColorChange={(c) => setTempColor(c)}
            availableStock={product.stock ?? 0}
          />
          <div className="pt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => setSheetOpen(false)}
              className="h-10 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                updateItemOptions(item.id, { color: tempColor || null, size: tempSize || null })
                setSheetOpen(false)
              }}
              className="h-10 rounded-full bg-[var(--brand-green)] text-[var(--brand-on-green)] text-sm font-medium hover:brightness-105 transition-colors"
            >
              Aplicar cambios
            </button>
          </div>
        </div>
      </ActionSheet>
    </div>
  )
}
