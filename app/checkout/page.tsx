"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import CustomerForm from "@/components/checkout/customer-form"
import DeliverySelection from "@/components/checkout/delivery-selection"
import PaymentSelection from "@/components/checkout/payment-selection"
import OrderSummary from "@/components/checkout/order-summary"
import { useCart } from "@/contexts/cart-context"
import { useCheckout } from "@/hooks/use-checkout"
import { Check } from "lucide-react"

const steps = [
  { number: 1, title: "Datos", description: "Información de contacto" },
  { number: 2, title: "Entrega", description: "Método de entrega" },
  { number: 3, title: "Pago", description: "Método de pago" },
  { number: 4, title: "Confirmar", description: "Revisar pedido" },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, itemCount } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    currentStep,
    customerData,
    deliveryMethod,
    paymentMethod,
    calculations,
    goToStep,
    nextStep,
    prevStep,
    updateCustomerData,
    setDeliveryMethod,
    setPaymentMethod,
    submitOrder,
  } = useCheckout()

  // Redirigir si no hay productos (en efecto para evitar ejecución en SSR)
  useEffect(() => {
    if (itemCount === 0) {
      router.replace("/carrito")
    }
  }, [itemCount, router])

  if (itemCount === 0) {
    return null
  }

  const handleSubmitOrder = async () => {
    setIsSubmitting(true)
    try {
      const success = await submitOrder()
      if (success) {
        // Opcional: redirigir a página de confirmación
        router.push("/")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header />

      <main className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Progress indicator */}
          <div className="mb-10">
            <div className="flex flex-wrap items-center justify-center gap-y-4 gap-x-6 max-w-full">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center max-w-full">
                  <button
                    type="button"
                    className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-full border-2 transition-colors ${
                      currentStep >= step.number
                        ? "bg-accent-orange border-accent-orange text-white"
                        : "border-gray-300 text-gray-500 bg-white"
                    }`}
                    onClick={() => goToStep(step.number)}
                    aria-label={`Ir al paso ${step.number}: ${step.title}`}
                  >
                    {currentStep > step.number ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.number}</span>
                    )}
                  </button>

                  <div className="ml-3 text-left leading-tight">
                    <div
                      className={`text-xs sm:text-sm font-medium truncate max-w-[70px] sm:max-w-none ${
                        currentStep >= step.number ? "text-accent-orange" : "text-gray-600"
                      }`}
                      title={step.title}
                    >
                      {step.title}
                    </div>
                    <div className="hidden sm:block text-[11px] text-gray-500 truncate max-w-[140px]" title={step.description}>
                      {step.description}
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`hidden sm:block w-8 h-px mx-4 ${
                        currentStep > step.number ? "bg-accent-orange" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step content */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            {currentStep === 1 && <CustomerForm data={customerData} onUpdate={updateCustomerData} onNext={nextStep} />}

            {currentStep === 2 && (
              <DeliverySelection
                selected={deliveryMethod}
                onSelect={setDeliveryMethod}
                onNext={nextStep}
                onPrev={prevStep}
                subtotal={calculations.subtotal}
              />
            )}

            {currentStep === 3 && (
              <PaymentSelection
                selected={paymentMethod}
                onSelect={setPaymentMethod}
                onNext={nextStep}
                onPrev={prevStep}
                subtotal={calculations.subtotal}
              />
            )}

            {currentStep === 4 && (
              <OrderSummary
                items={items}
                customer={customerData}
                deliveryMethod={deliveryMethod!}
                paymentMethod={paymentMethod!}
                calculations={calculations}
                onSubmit={handleSubmitOrder}
                onPrev={prevStep}
                isSubmitting={isSubmitting}
              />
            )}
          </div>

          {/* Order summary sidebar - Solo en desktop */}
          {currentStep < 4 && (
            <div className="hidden lg:block fixed right-8 top-32 w-80 bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4">Resumen del pedido</h3>

              <div className="space-y-3 mb-4">
                {items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="truncate mr-2">
                      {item.product.name} x{item.quantity}
                    </span>
                    <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                {items.length > 3 && <div className="text-sm text-gray-500">+{items.length - 3} productos más</div>}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${calculations.subtotal.toFixed(2)}</span>
                </div>

                {calculations.deliveryCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Envío:</span>
                    <span>${calculations.deliveryCost.toFixed(2)}</span>
                  </div>
                )}

                {calculations.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Descuento:</span>
                    <span>-${calculations.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span>
                    ${calculations.total.toFixed(2)} {calculations.currency}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
