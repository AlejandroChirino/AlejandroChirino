"use client"

import Image from "next/image"
import Link from "next/link"
import { Trash2, Minus, Plus, Heart } from "lucide-react"
import { useState } from "react"
import { useCart } from "@/contexts/cart-context"
import { formatPrice } from "@/lib/utils"
import type { CartItem as CartItemType } from "@/lib/types"
import { useFavorites } from "@/hooks/use-favorites"
import ActionSheet from "@/components/ui/action-sheet"

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, updateItemOptions, removeItem, isLoading } = useCart()
  const { product, quantity, size, color } = item
  const { isFavorite, toggleFavorite } = useFavorites()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [tempColor, setTempColor] = useState<string | null>(color)
  const [tempSize, setTempSize] = useState<string | null>(size)

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      updateQuantity(item.id, newQuantity)
    }
  }

  const handleRemove = () => removeItem(item.id)

  const currentPrice = product.on_sale && product.sale_price != null ? product.sale_price : product.price
  const hasDiscount = product.on_sale && product.sale_price != null && product.sale_price < product.price

  return (
    <div className="flex gap-4 py-4 items-start">
      {/* Imagen */}
      <div className="w-[100px] sm:w-[110px] aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
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

      {/* Detalles */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Fila superior */}
        <div className="flex items-center justify-between gap-2 flex-nowrap">
          <Link
            href={`/producto/${product.id}`}
            className="min-w-0 flex-1 block font-semibold text-gray-900 hover:text-accent-orange transition-colors truncate"
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

        {/* Selector combinado */}
        {(product.sizes.length > 0 || product.colors.length > 0) && (
          <div className="mt-1">
            <button
              type="button"
              onClick={() => {
                setTempColor(color)
                setTempSize(size)
                setSheetOpen(true)
              }}
              className="h-7 px-3 text-xs rounded-full bg-gray-100 border border-gray-200 flex items-center gap-2 hover:bg-gray-200 transition-colors"
            >
              {color && (
                <span
                  className="h-3 w-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.toLowerCase() }}
                  aria-hidden="true"
                />
              )}
              <span className="truncate max-w-[120px]">
                {color || size ? `${color || ""}${color && size ? " / " : ""}${size || ""}` : "Selecciona"}
              </span>
            </button>
          </div>
        )}

        <div className="flex-1" />

        {/* Fila inferior */}
        <div className="mt-1 flex items-center gap-2 flex-nowrap">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-accent-orange font-bold">{formatPrice(currentPrice)}</span>
            {hasDiscount && <span className="text-sm text-gray-500 line-through">{formatPrice(product.price)}</span>}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={handleRemove}
              disabled={isLoading}
              className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
              aria-label="Eliminar producto"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <div className="flex items-center rounded-full border border-gray-200 bg-gray-50 overflow-hidden shrink-0">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isLoading}
                className="w-7 h-7 grid place-items-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                aria-label="Disminuir cantidad"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-2 text-xs min-w-[28px] text-center">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock || isLoading}
                className="w-7 h-7 grid place-items-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                aria-label="Aumentar cantidad"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Sheet */}
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
          {product.colors.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => {
                  const active = c === tempColor
                  return (
                    <button
                      key={c}
                      onClick={() => setTempColor(c)}
                      className={`px-3 h-8 rounded-full text-xs border transition-colors ${
                        active
                          ? "bg-[var(--brand-green)] text-[var(--brand-on-green)] border-[var(--brand-green)]"
                          : "bg-white border-gray-200 hover:border-gray-400"
                      }`}
                      type="button"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: c.toLowerCase() }}
                        />
                        {c}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          {product.sizes.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Talla</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const active = s === tempSize
                  return (
                    <button
                      key={s}
                      onClick={() => setTempSize(s)}
                      className={`h-8 min-w-[42px] px-3 rounded-full text-xs border flex items-center justify-center transition-colors ${
                        active
                          ? "bg-[var(--brand-green)] text-[var(--brand-on-green)] border-[var(--brand-green)]"
                          : "bg-white border-gray-200 hover:border-gray-400"
                      }`}
                      type="button"
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
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
