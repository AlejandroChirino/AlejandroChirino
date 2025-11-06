"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import CartItem from "@/components/cart-item"
import CartSummary from "@/components/cart-summary"
import { useCart } from "@/contexts/cart-context"
import { toast } from "@/components/ui/use-toast"

export default function CarritoPage() {
  const { items, itemCount } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleCheckout = () => {
    setIsCheckingOut(true)

    // Simulación de proceso de checkout
    setTimeout(() => {
      toast({
        title: "Pedido realizado",
        description: "Tu pedido ha sido procesado correctamente",
      })
      setIsCheckingOut(false)
    }, 2000)
  }

  return (
  <div className="min-h-screen overflow-x-hidden">
      <Header />

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Tu Bolsa</h1>

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Lista de productos */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Productos ({itemCount})</h2>
                    <Link href="/" className="text-accent-orange flex items-center hover:underline">
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Seguir comprando
                    </Link>
                  </div>

                  <div className="divide-y">
                    {items.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Resumen de compra */}
              <div className="lg:col-span-1">
                <CartSummary onCheckout={handleCheckout} />
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
