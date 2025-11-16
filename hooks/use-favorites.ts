"use client"

import { useState, useEffect, useCallback } from "react"
import type { UseFavoritesReturn } from "@/lib/types"
import { supabase } from "@/lib/supabaseClient"

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        // Try to get authenticated user from Supabase client
        const { data } = await supabase.auth.getUser()
        const userId = data?.user?.id

        if (userId) {
          // Fetch favorites from server-side API
          const res = await fetch(`/api/favorites?userId=${encodeURIComponent(userId)}`)
          if (res.ok) {
            const json = await res.json()
            // api returns array of favorite records with `products` relation
            const ids = Array.isArray(json) ? json.map((f: any) => String(f.products?.id ?? f.product_id ?? f.id)).filter(Boolean) : []
            if (mounted) setFavorites(ids)
            return
          }
        }

        // Fallback: load favorites from localStorage for anonymous users
        const stored = localStorage.getItem("la-fashion-favorites")
        if (stored && mounted) setFavorites(JSON.parse(stored))
      } catch (error) {
        console.error("Error loading favorites:", error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  const toggleFavorite = useCallback(async (productId: string) => {
    // Determine new state based on current favorites to avoid closure staleness
    const currentlyFavorite = favorites.includes(productId)
    const isNowFavorite = !currentlyFavorite

    // Optimistic update
    setFavorites((prev) => {
      const newFavorites = isNowFavorite ? [...prev, productId] : prev.filter((id) => id !== productId)
      try {
        localStorage.setItem("la-fashion-favorites", JSON.stringify(newFavorites))
      } catch (error) {
        console.error("Error saving favorites to localStorage:", error)
      }
      return newFavorites
    })

    try {
      const { data } = await supabase.auth.getUser()
      const userId = data?.user?.id

      if (userId) {
        if (isNowFavorite) {
          const res = await fetch(`/api/favorites`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, productId }),
          })
          if (!res.ok) throw new Error("Error adding favorite on server")
        } else {
          const res = await fetch(`/api/favorites?userId=${encodeURIComponent(userId)}&productId=${encodeURIComponent(productId)}`, {
            method: "DELETE",
          })
          if (!res.ok) throw new Error("Error removing favorite on server")
        }
      }
    } catch (error) {
      // on error, rollback optimistic change
      console.error("Error syncing favorites with server:", error)
      setFavorites((prev) => {
        const rolledBack = currentlyFavorite ? [...prev, productId] : prev.filter((id) => id !== productId)
        try {
          localStorage.setItem("la-fashion-favorites", JSON.stringify(rolledBack))
        } catch (e) {}
        return rolledBack
      })
    }
  }, [favorites])

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
