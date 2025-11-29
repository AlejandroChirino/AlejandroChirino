"use client"

import React from "react"
import { useRouter } from "next/navigation"
// CheckoutLayout removed — layout handled by `app/checkout/layout.tsx`
import DeliverySelection from "@/components/checkout/delivery-selection"
import { useCheckout } from "@/hooks/use-checkout"
import { useCart } from "@/contexts/cart-context"

export default function EntregaPage() {
  const router = useRouter()
  const { items, itemCount } = useCart()
  const { deliveryMethod, setDeliveryMethod, nextStep, prevStep, calculations } = useCheckout()

  React.useEffect(() => {
    if (itemCount === 0) router.replace("/carrito")
  }, [itemCount, router])

  if (itemCount === 0) return null

  const handleNext = () => {
    try { nextStep() } catch (e) {}
    router.push("/checkout/metododepago")
  }

  const handlePrev = () => {
    try { prevStep() } catch (e) {}
    router.push("/checkout/datos")
  }

  return (
    <DeliverySelection
      selected={deliveryMethod}
      onSelect={setDeliveryMethod}
      onNext={handleNext}
      onPrev={handlePrev}
      subtotal={calculations.subtotal}
    />
  )
}
