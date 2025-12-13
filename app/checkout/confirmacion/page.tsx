"use client"

import React from "react"
import { useRouter } from "next/navigation"
// CheckoutLayout removed — layout handled by `app/checkout/layout.tsx`
import OrderSummary from "@/components/checkout/order-summary"
import { useCheckout } from "@/hooks/use-checkout"
import { useCart } from "@/contexts/cart-context"

export default function ConfirmacionPage() {
  const router = useRouter()
  const { items, itemCount, selectedItems, selectedItemCount } = useCart()
  const { customerData, deliveryMethod, paymentMethod, calculations, submitOrder, prevStep, applyCoupon, removeCoupon, appliedCoupon } = useCheckout()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    // If there are no selected items (nothing to confirm), go back to cart
    if (selectedItemCount === 0) router.replace("/carrito")
  }, [selectedItemCount, router])

  if (itemCount === 0) return null

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const ok = await submitOrder()
      if (ok) {
        router.push("/")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrev = () => {
    try { prevStep() } catch (e) {}
    router.push("/checkout/metododepago")
  }

  return (
    <OrderSummary
      items={selectedItems}
      customer={customerData}
      deliveryMethod={deliveryMethod!}
      paymentMethod={paymentMethod!}
      calculations={calculations}
      onSubmit={handleSubmit}
      onPrev={handlePrev}
      isSubmitting={isSubmitting}
      applyCoupon={applyCoupon}
      removeCoupon={removeCoupon}
      appliedCoupon={appliedCoupon}
    />
  )
}
