"use client"

import React from "react"
import { useRouter } from "next/navigation"
// CheckoutLayout removed — layout handled by `app/checkout/layout.tsx`
import CustomerForm from "@/components/checkout/customer-form"
import { useCheckout } from "@/hooks/use-checkout"
import { useCart } from "@/contexts/cart-context"

export default function DatosPage() {
  const router = useRouter()
  const { items, itemCount } = useCart()
  const { customerData, updateCustomerData, nextStep } = useCheckout()

  React.useEffect(() => {
    if (itemCount === 0) router.replace("/carrito")
  }, [itemCount, router])

  if (itemCount === 0) return null

  const handleNext = () => {
    try {
      nextStep()
    } catch (e) {}
    router.push("/checkout/entrega")
  }

  return <CustomerForm data={customerData} onUpdate={updateCustomerData} onNext={handleNext} />
}
