"use client"

import Image from "next/image"
import Button from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Check } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import type { CartItem, CustomerData, CheckoutCalculations, DeliveryMethod, PaymentMethod } from "@/lib/types"

interface OrderSummaryProps {
  items: CartItem[]
  customer: CustomerData
  deliveryMethod: DeliveryMethod
  paymentMethod: PaymentMethod
  calculations: CheckoutCalculations
  onSubmit: () => void
  onPrev: () => void
  isSubmitting?: boolean
  applyCoupon?: (code: string) => Promise<{ success: boolean; message?: string }>
  removeCoupon?: () => void
  appliedCoupon?: any | null
}

export default function OrderSummary(props: OrderSummaryProps) {
  const {
    items,
    customer,
    deliveryMethod,
    paymentMethod,
    calculations,
    onSubmit,
    onPrev,
    isSubmitting,
    applyCoupon,
    removeCoupon,
    appliedCoupon,
  } = props

  const handleApply = async (code: string) => {
    if (!applyCoupon) return toast({ title: "Cupón", description: "Función de cupón no disponible" })
    // applyCoupon called from OrderSummary
    const res = await applyCoupon(code)
    if (!res.success) {
      // applyCoupon failed
      toast({ title: "Cupón", description: res.message || "Código inválido" })
    } else {
      // applyCoupon success
      toast({ title: "Cupón aplicado", description: "Se aplicó el descuento" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4">Datos del cliente</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-600">Nombre:</span>
                <span className="text-gray-900 font-medium ml-2">{(customer as any).fullName || (customer as any).name || ""}</span>
              </p>
              <p>
                <span className="text-gray-600">Teléfono:</span>
                <span className="text-gray-900 font-medium ml-2">{customer.phone}</span>
              </p>
              {customer.email && (
                <p>
                  <span className="text-gray-600">Email:</span>
                  <span className="text-gray-900 font-medium ml-2">{customer.email}</span>
                </p>
              )}
              <p>
                <span className="text-gray-600">Dirección:</span>
                <span className="text-gray-900 font-medium ml-2">{customer.address}</span>
              </p>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4">Entrega y pago</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-600">Método de entrega:</span>
                <span className="text-gray-900 font-medium ml-2">{String(deliveryMethod)}</span>
              </p>
              <p>
                <span className="text-gray-600">Método de pago:</span>
                <span className="text-gray-900 font-medium ml-2">{String(paymentMethod)}</span>
              </p>
            </div>
          </section>
        </div>

        <aside className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-4">Tu pedido</h3>

          <div className="mb-4">
            {!appliedCoupon ? (
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Código de cupón"
                  aria-label="Código de cupón"
                  id="coupon_code_input"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      e.stopPropagation()
                      const input = e.currentTarget as HTMLInputElement
                      const code = input.value.trim()
                      if (!code) return
                      await handleApply(code)
                    }
                  }}
                />
                <button
                  type="button"
                  className="bg-[var(--brand-green)] text-white rounded-lg px-4 py-2 text-sm"
                  onClick={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const input = document.getElementById("coupon_code_input") as HTMLInputElement | null
                    const code = input?.value.trim() || ""
                    if (!code) return alert("Ingresa un código")
                    await handleApply(code)
                  }}
                >
                  Aplicar
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg p-3">
                <div>
                  <div className="text-sm font-medium">Cupón aplicado: <span className="uppercase">{String(appliedCoupon.code)}</span></div>
                </div>
                <button type="button" className="text-sm text-[var(--brand-green)] font-semibold" onClick={() => removeCoupon && removeCoupon()}>
                  Quitar
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.product.image_url || "/placeholder.svg"}
                    alt={item.product.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-gray-900 font-medium text-sm line-clamp-2">{item.product.name}</h4>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.size && <span>Talla: {item.size}</span>}
                    {item.size && item.color && <span> • </span>}
                    {item.color && <span>Color: {item.color}</span>}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Cant: {item.quantity}</span>
                    <span className="text-gray-900 font-medium text-sm">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-900">Subtotal:</span>
              <span className="text-gray-900">{formatPrice(calculations.subtotal)}</span>
            </div>

            {calculations.deliveryCost > 0 && (
              <div className="flex justify-between text-sm">
                <span>Envío:</span>
                <span>{formatPrice(calculations.deliveryCost)}</span>
              </div>
            )}

            {calculations.paymentDiscount && calculations.paymentDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuento (Pago):</span>
                <span>-{formatPrice(calculations.paymentDiscount)}</span>
              </div>
            )}

            {calculations.couponDiscount && calculations.couponDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuento (Cupón):</span>
                <span>-{formatPrice(calculations.couponDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t">
              <span className="text-gray-900">Total:</span>
              <span className="text-gray-900 font-extrabold text-2xl">{formatPrice(calculations.total)}</span>
            </div>
          </div>
        </aside>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-2">
        <Button onClick={onPrev} variant="outline" className="rounded-full w-full md:w-44" size="md">
          Volver
        </Button>
        <Button onClick={onSubmit} loading={isSubmitting} variant="primary" className="rounded-full w-full md:w-44 flex items-center justify-center" size="md">
          <Check className="h-4 w-4 mr-2" />
          Confirmar pedido
        </Button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700">
        <p className="font-medium mb-1">📄 ¿Qué pasa después?</p>
        <p>Al confirmar, se abrirá WhatsApp con un resumen completo de tu pedido. Nuestro equipo te contactará para coordinar la entrega y el pago.</p>
      </div>
    </div>
  )
}
