"use client"

import { useState, useEffect } from "react"
import type { Product, UseProductReturn } from "@/lib/types"

export function useProduct(productId: string): UseProductReturn {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/products/${productId}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Producto no encontrado")
          }
          throw new Error("Error al cargar el producto")
        }

        const productData = await response.json()
        setProduct(productData)

        // Auto-select first available options
        if (productData.sizes?.length > 0) {
          setSelectedSize(productData.sizes[0])
        }
        if (productData.colors?.length > 0) {
          setSelectedColor(productData.colors[0])
        }
      } catch (err) {
        console.error("Error fetching product:", err)
        setError(err instanceof Error ? err.message : "Error al cargar el producto")
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const isValidSelection = Boolean(
    product && (product.sizes.length === 0 || selectedSize) && (product.colors.length === 0 || selectedColor),
  )

  const availableStock = product?.stock || 0

  return {
    product,
    loading,
    error,
    selectedSize,
    selectedColor,
    activeImageIndex,
    setSelectedSize,
    setSelectedColor,
    setActiveImageIndex,
    isValidSelection,
    availableStock,
  }
}
