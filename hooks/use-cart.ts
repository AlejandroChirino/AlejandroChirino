"use client"

import { useState, useCallback } from "react"
import type { UseCartReturn } from "@/lib/types"

export function useCart(): UseCartReturn {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const addToCart = useCallback(
    async (productId: string, size?: string, color?: string, quantity = 1): Promise<boolean> => {
      try {
        setLoading(true)
        setSuccess(false)

        // TODO: Replace with actual user ID when auth is implemented
        const userId = "temp-user-id"

        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            productId,
            quantity,
            size,
            color,
          }),
        })

        if (!response.ok) {
          throw new Error("Error al agregar al carrito")
        }

        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000) // Reset success state after 3s
        return true
      } catch (error) {
        return false
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return {
    addToCart,
    loading,
    success,
  }
}
