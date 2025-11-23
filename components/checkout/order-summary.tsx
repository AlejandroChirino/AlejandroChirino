"use client"

import Image from "next/image"
import Button from "@/components/ui/button"
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
}

export default function OrderSummary({
  items,
  customer,
  deliveryMethod,
  paymentMethod,
  calculations,
  onSubmit,
  onPrev,
  isSubmitting = false,
}: OrderSummaryProps) {
  const deliveryLabels = {
    tienda: "Recogida en tienda",
    local: "Entrega local",
    municipal: "Entrega municipal",
  }

  const paymentLabels = {
    transferencia: "Transferencia bancaria",
    efectivo_cup: "Efectivo CUP",
    efectivo_usd: "Efectivo USD",
    zelle: "Zelle",
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Confirmar Pedido</h2>
        <p className="text-gray-600">Revisa todos los detalles antes de confirmar</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Información del pedido */}
        <div className="space-y-6">
          {/* Datos del cliente */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4">Datos de contacto</h3>
            <div className="space-y-3 text-sm">
              <p>
                <span className="text-gray-600">Nombre:</span>
                <span className="text-gray-900 font-medium ml-2">{customer.fullName}</span>
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
              <p>
                <span className="text-gray-600">Ciudad:</span>
                <span className="text-gray-900 font-medium ml-2">{customer.city}</span>
              </p>
              {customer.notes && (
                <p>
                  <span className="text-gray-600">Notas:</span>
                  <span className="text-gray-900 ml-2">{customer.notes}</span>
                </p>
              )}
            </div>
          </div>

          {/* Entrega y pago */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4">Entrega y pago</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-600">Entrega:</span>
                <span className="text-gray-900 font-medium ml-2">{deliveryLabels[deliveryMethod]}</span>
              </p>
              <p>
                <span className="text-gray-600">Pago:</span>
                <span className="text-gray-900 font-medium ml-2">{paymentLabels[paymentMethod]}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-4">Tu pedido</h3>

          {/* Productos */}
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

          {/* Totales */}
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

            {calculations.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuento:</span>
                <span>-{formatPrice(calculations.discount)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t">
              <span className="text-gray-900">Total:</span>
              <span className="text-gray-900 font-extrabold text-2xl">
                {formatPrice(calculations.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button onClick={onPrev} variant="outline" className="rounded-full w-full md:w-44" size="md">
          Volver
        </Button>
        <Button onClick={onSubmit} loading={isSubmitting} variant="primary" className="rounded-full w-full md:w-44 flex items-center justify-center" size="md">
          <Check className="h-4 w-4 mr-2" />
          Confirmar pedido
        </Button>
      </div>

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700">
        <p className="font-medium mb-1">📄 ¿Qué pasa después?</p>
        <p>
          Al confirmar, se abrirá WhatsApp con un resumen completo de tu pedido. Nuestro equipo te contactará para
          coordinar la entrega y el pago.
        </p>
      </div>
    </div>
  )
}
