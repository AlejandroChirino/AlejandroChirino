"use client"

import { useCheckoutContext } from "@/contexts/checkout-context"

export function useCheckout() {
  return useCheckoutContext()
}
