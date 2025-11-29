"use client"

import React from "react"
import { CheckoutProvider } from "@/contexts/checkout-context"

export default function CheckoutProviderClient({ children }: { children: React.ReactNode }) {
  return <CheckoutProvider>{children}</CheckoutProvider>
}
