"use client"

import Link from "next/link"
import { useCart } from "@/contexts/cart-context"
import { formatPrice } from "@/lib/utils"
import Button from "@/components/ui/button"

interface CartSummaryProps {
  onCheckout?: () => void
}

export default function CartSummary({ onCheckout }: CartSummaryProps) {
  const { subtotal, itemCount, clearCart, isLoading } = useCart()

  // Valores de ejemplo para envío e impuestos
  const shipping = subtotal > 50 ? 0 : 4.99
  const tax = subtotal * 0.21 // IVA 21%
  const total = subtotal + shipping + tax

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout()
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-lg font-bold mb-4">Resumen de compra</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">
            Subtotal ({itemCount} {itemCount === 1 ? "producto" : "productos"})
          </span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between font-bold">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Los costos de envío se calcularán en el checkout</p>
        </div>
      </div>

      <div className="space-y-3">
        <Link href="/checkout" className="block">
          <Button disabled={itemCount === 0 || isLoading} className="w-full" size="lg">
            Proceder al checkout
          </Button>
        </Link>

        <Button
          onClick={() => clearCart()}
          disabled={itemCount === 0 || isLoading}
          variant="outline"
          className="w-full"
        >
          Vaciar bolsa
        </Button>
      </div>

      <div className="mt-6 text-xs text-gray-500">
        <p>• Entrega local: 250 CUP (gratis &gt;5000 CUP)</p>
        <p>• Entrega municipal: 500 CUP (gratis &gt;20000 CUP)</p>
        <p>• Efectivo CUP: 5% descuento automático</p>
      </div>
    </div>
  )
}
