"use client"

import React from "react"
import { useRouter } from "next/navigation"
// CheckoutLayout removed — layout handled by `app/checkout/layout.tsx`
import PaymentSelection from "@/components/checkout/payment-selection"
import { useCheckout } from "@/hooks/use-checkout"
import { useCart } from "@/contexts/cart-context"

export default function MetodoDePagoPage() {
  const router = useRouter()
  const { items, itemCount } = useCart()
  const { paymentMethod, setPaymentMethod, nextStep, prevStep, calculations } = useCheckout()

  React.useEffect(() => {
    if (itemCount === 0) router.replace("/carrito")
  }, [itemCount, router])

  if (itemCount === 0) return null

  const handleNext = () => {
    try { nextStep() } catch (e) {}
    router.push("/checkout/confirmacion")
  }

  const handlePrev = () => {
    try { prevStep() } catch (e) {}
    router.push("/checkout/entrega")
  }

  return (
    <PaymentSelection
      selected={paymentMethod}
      onSelect={setPaymentMethod}
      onNext={handleNext}
      onPrev={handlePrev}
      subtotal={calculations.subtotal}
    />
  )
}
