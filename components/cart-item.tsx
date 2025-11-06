"use client"

import Image from "next/image"
import Link from "next/link"
import { Trash2, Minus, Plus } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { formatPrice } from "@/lib/utils"
import type { CartItem as CartItemType } from "@/lib/types"

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem, isLoading } = useCart()
  const { product, quantity, size, color } = item

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      updateQuantity(item.id, newQuantity)
    }
  }

  const handleRemove = () => {
    removeItem(item.id)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 py-4 border-b">
      {/* Imagen del producto */}
      <div className="w-full sm:w-24 h-32 bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
        <Link href={`/producto/${product.id}`}>
          <Image
            src={product.image_url || "/placeholder.svg?height=400&width=300&query=product"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 96px"
          />
        </Link>
      </div>

      {/* Información del producto */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between">
          <div className="max-w-full">
            <Link
              href={`/producto/${product.id}`}
              className="font-medium hover:text-accent-orange transition-colors block w-full max-w-full break-all"
              style={{ overflowWrap: "anywhere" }}
            >
              {product.name}
            </Link>
            <p className="text-sm text-gray-600 mt-1">
              {size && <span className="mr-2">Talla: {size}</span>}
              {color && <span>Color: {color}</span>}
            </p>
            <p className="font-bold text-accent-orange mt-1">{formatPrice(product.price)}</p>
          </div>
          <button
            onClick={handleRemove}
            disabled={isLoading}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Eliminar producto"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        {/* Control de cantidad */}
        <div className="flex items-center mt-auto pt-2">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isLoading}
              className="px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
              aria-label="Disminuir cantidad"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-3 py-1 min-w-[40px] text-center">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= product.stock || isLoading}
              className="px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
              aria-label="Aumentar cantidad"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="ml-auto font-medium">{formatPrice(product.price * quantity)}</span>
        </div>
      </div>
    </div>
  )
}
