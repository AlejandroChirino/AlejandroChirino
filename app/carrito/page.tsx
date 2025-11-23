"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
// Header provisto por RootLayout
import Footer from "@/components/footer"
import CartItem from "@/components/cart-item"
import { useCart } from "@/contexts/cart-context"
import { toast } from "@/components/ui/use-toast"
import { cn, formatPrice } from "@/lib/utils"
import Button from "@/components/ui/button"

export default function CarritoPage() {
  const { items, itemCount, subtotal } = useCart()

  return (
  <div className="min-h-screen overflow-x-hidden">
      {/* Header ya incluido en el layout raíz */}

      <main className={cn("pt-4", itemCount > 0 ? "pb-28 lg:pb-8" : "")}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracked-strong uppercase">MI BOLSA</h2>

          {itemCount === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛍️</div>
              <h2 className="text-xl font-semibold mb-2">Tu bolsa está vacía</h2>
              <p className="text-gray-600 mb-6">Añade productos a tu bolsa para continuar con la compra</p>
              <Link
                href="/"
                className="inline-block bg-accent-orange text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Explorar Productos
              </Link>
            </div>
          ) : (
            <div>
              {/* Lista de productos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-medium text-gray-700">Productos ({itemCount})</h2>
                  <Link href="/" className="flex items-center text-[var(--brand-green)] hover:underline">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    <span className="align-middle">Seguir comprando</span>
                  </Link>
                </div>

                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Barra fija inferior en móvil */}
        {itemCount > 0 && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-6px_16px_rgba(0,0,0,0.06)] p-4 z-40">
            <div className="max-w-7xl mx-auto px-2">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500">Subtotal</p>
                  <p className="text-lg font-bold">{formatPrice(subtotal)}</p>
                </div>
                <p className="text-xs text-gray-500">El envío se calcula en el checkout</p>
              </div>
              <Link href="/checkout" className="block">
                <Button className="w-full" size="lg">
                  Proceder al checkout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
