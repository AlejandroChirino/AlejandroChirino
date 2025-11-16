"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { UseFavoritesReturn } from "@/lib/types"
import { supabase } from "@/lib/supabaseClient"

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const serverFavoritesRef = useRef<string[] | null>(null)

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
            const serverIds = Array.isArray(json) ? json.map((f: any) => String(f.products?.id ?? f.product_id ?? f.id)).filter(Boolean) : []
            serverFavoritesRef.current = serverIds

            // If the user had local favorites (guest), migrate them to server
            const stored = localStorage.getItem("la-fashion-favorites")
            const localIds: string[] = stored ? JSON.parse(stored) : []

            // Determine which local favorites need to be added to server
            const toAdd = localIds.filter((id) => !serverIds.includes(id))
            for (const pid of toAdd) {
              try {
                await fetch(`/api/favorites`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userId, productId: pid }),
                })
              } catch (e) {
                // ignore errors for individual items
              }
            }

            const merged = Array.from(new Set([...serverIds, ...localIds]))
            if (mounted) setFavorites(merged)
            try {
              localStorage.setItem("la-fashion-favorites", JSON.stringify(merged))
            } catch (e) {}
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

  // Subscribe to auth state changes to migrate favorites on sign in
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          const userId = session?.user?.id
          if (!userId) return

          // fetch server favorites
          const res = await fetch(`/api/favorites?userId=${encodeURIComponent(userId)}`)
          const json = res.ok ? await res.json() : []
          const serverIds = Array.isArray(json) ? json.map((f: any) => String(f.products?.id ?? f.product_id ?? f.id)).filter(Boolean) : []
          serverFavoritesRef.current = serverIds

          const stored = localStorage.getItem("la-fashion-favorites")
          const localIds: string[] = stored ? JSON.parse(stored) : []
          const toAdd = localIds.filter((id) => !serverIds.includes(id))
          for (const pid of toAdd) {
            try {
              await fetch(`/api/favorites`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, productId: pid }),
              })
            } catch (e) {}
          }
          const merged = Array.from(new Set([...serverIds, ...localIds]))
          setFavorites(merged)
          try { localStorage.setItem("la-fashion-favorites", JSON.stringify(merged)) } catch (e) {}
        }

        if (event === "SIGNED_OUT") {
          // revert to local storage state for anonymous browsing
          const stored = localStorage.getItem("la-fashion-favorites")
          setFavorites(stored ? JSON.parse(stored) : [])
          serverFavoritesRef.current = null
        }
      } catch (e) {
        console.error("Error syncing favorites on auth change", e)
      }
    })

    return () => {
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  const toggleFavorite = useCallback(async (productId: string) => {
    // Determine new state based on current favorites to avoid closure staleness
    const currentlyFavorite = favorites.includes(productId)
    const isNowFavorite = !currentlyFavorite

    try {
      // Debug log: ensure handler is invoked
      // eslint-disable-next-line no-console
      console.log("useFavorites.toggleFavorite called", { productId, currentlyFavorite, isNowFavorite })
    } catch (e) {}

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
        try {
          // eslint-disable-next-line no-console
          console.log("useFavorites: user is authenticated", { userId, productId, isNowFavorite })
        } catch (e) {}
        // Keep serverFavoritesRef in sync to avoid duplicate adds
        const serverFavs = serverFavoritesRef.current ?? []
        if (isNowFavorite) {
          if (!serverFavs.includes(productId)) {
            // Debug: log outgoing request
            try { console.log("useFavorites: POST /api/favorites", { productId }) } catch (e) {}
            const res = await fetch(`/api/favorites`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, productId }),
            })
            if (!res.ok) throw new Error("Error adding favorite on server")
            serverFavoritesRef.current = [...serverFavs, productId]
          }
        } else {
          // remove from server
          try { console.log("useFavorites: DELETE /api/favorites", { productId }) } catch (e) {}
          const res = await fetch(`/api/favorites?userId=${encodeURIComponent(userId)}&productId=${encodeURIComponent(productId)}`, {
            method: "DELETE",
          })
          if (!res.ok) throw new Error("Error removing favorite on server")
          serverFavoritesRef.current = serverFavs.filter((id) => id !== productId)
        }
      }
    } catch (error) {
      // on error, rollback optimistic change
      // eslint-disable-next-line no-console
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
