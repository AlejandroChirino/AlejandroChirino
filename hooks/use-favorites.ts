"use client"

import { useCallback, useEffect, useState } from "react"
import { useFavoritesContext } from "@/contexts/favorites-context"
import { supabase } from "@/lib/supabaseClient"
import type { UseFavoritesReturn } from "@/lib/types"

// Prefer the shared FavoritesProvider when available. If not, provide a
// backward-compatible fallback so existing imports keep working.
function useFavorites(): UseFavoritesReturn {
  const ctx = useFavoritesContext()
  if (ctx) return ctx

  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const { data } = await supabase.auth.getUser()
        const userId = data?.user?.id

        if (userId) {
          const res = await fetch(`/api/favorites?userId=${encodeURIComponent(userId)}`)
          if (res.ok) {
            const json = await res.json()
            const ids = Array.isArray(json) ? json.map((f: any) => String(f.products?.id ?? f.product_id ?? f.id)).filter(Boolean) : []
            if (mounted) setFavorites(ids)
            try { localStorage.setItem("la-fashion-favorites", JSON.stringify(ids)) } catch (e) {}
            return
          }
        }

        const stored = typeof window !== "undefined" ? localStorage.getItem("la-fashion-favorites") : null
        if (stored && mounted) setFavorites(JSON.parse(stored))
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error loading favorites:", error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          const userId = session?.user?.id
          if (!userId) return

          const res = await fetch(`/api/favorites?userId=${encodeURIComponent(userId)}`)
          const json = res.ok ? await res.json() : []
          const ids = Array.isArray(json) ? json.map((f: any) => String(f.products?.id ?? f.product_id ?? f.id)).filter(Boolean) : []
          const stored = typeof window !== "undefined" ? localStorage.getItem("la-fashion-favorites") : null
          const localIds: string[] = stored ? JSON.parse(stored) : []
          const toAdd = localIds.filter((id) => !ids.includes(id))
          for (const pid of toAdd) {
            try {
              await fetch(`/api/favorites`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-user-id": userId },
                body: JSON.stringify({ userId, productId: pid }),
              })
            } catch (e) {}
          }

          const merged = Array.from(new Set([...ids, ...localIds]))
          setFavorites(merged)
          try { localStorage.setItem("la-fashion-favorites", JSON.stringify(merged)) } catch (e) {}
        }

        if (event === "SIGNED_OUT") {
          const stored = typeof window !== "undefined" ? localStorage.getItem("la-fashion-favorites") : null
          setFavorites(stored ? JSON.parse(stored) : [])
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Error syncing favorites on auth change", e)
      }
    })

    return () => { sub?.subscription?.unsubscribe?.() }
  }, [])

  const toggleFavorite = useCallback(async (productId: string) => {
    const currentlyFavorite = favorites.includes(productId)
    const isNowFavorite = !currentlyFavorite

    setFavorites((prev) => {
      const newFavorites = isNowFavorite ? [...prev, productId] : prev.filter((id) => id !== productId)
      try { localStorage.setItem("la-fashion-favorites", JSON.stringify(newFavorites)) } catch (e) {}
      return newFavorites
    })

    try {
      const { data } = await supabase.auth.getUser()
      const userId = data?.user?.id

      if (userId) {
        if (isNowFavorite) {
          await fetch(`/api/favorites`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-user-id": userId },
            body: JSON.stringify({ userId, productId }),
          })
        } else {
          await fetch(`/api/favorites?userId=${encodeURIComponent(userId)}&productId=${encodeURIComponent(productId)}`, {
            method: "DELETE",
          })
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error syncing favorites with server:", error)
      setFavorites((prev) => {
        const rolledBack = currentlyFavorite ? [...prev, productId] : prev.filter((id) => id !== productId)
        try { localStorage.setItem("la-fashion-favorites", JSON.stringify(rolledBack)) } catch (e) {}
        return rolledBack
      })
    }
  }, [favorites])

  const isFavorite = useCallback((productId: string) => favorites.includes(productId), [favorites])

  return { favorites, isFavorite, toggleFavorite, loading }
}

// Export both named and default to remain compatible with different import styles
export { useFavorites }
export default useFavorites
