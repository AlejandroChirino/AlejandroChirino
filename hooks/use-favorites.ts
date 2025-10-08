"use client"

import { useState, useEffect, useCallback } from "react"
import type { UseFavoritesReturn } from "@/lib/types"

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load favorites from localStorage
    try {
      const stored = localStorage.getItem("la-fashion-favorites")
      if (stored) {
        setFavorites(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Error loading favorites:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]

      // Save to localStorage
      try {
        localStorage.setItem("la-fashion-favorites", JSON.stringify(newFavorites))
      } catch (error) {
        console.error("Error saving favorites:", error)
      }

      return newFavorites
    })
  }, [])

  const isFavorite = useCallback(
    (productId: string) => {
      return favorites.includes(productId)
    },
    [favorites],
  )

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    loading,
  }
}
