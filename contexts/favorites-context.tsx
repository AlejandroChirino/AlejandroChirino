"use client"

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { UseFavoritesReturn } from "@/lib/types"

const FavoritesContext = createContext<UseFavoritesReturn | null>(null)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const serverFavoritesRef = useRef<string[] | null>(null)

  useEffect(() => {
    console.log("FavoritesProvider: mounted")
    let mounted = true

    async function load() {
      console.log("FavoritesProvider: load start")
      try {
        const { data } = await supabase.auth.getUser()
        const userId = data?.user?.id

        if (userId) {
          const res = await fetch(`/api/favorites?userId=${encodeURIComponent(userId)}`)
          if (res.ok) {
            const json = await res.json()
            const serverIds = Array.isArray(json) ? json.map((f: any) => String(f.products?.id ?? f.product_id ?? f.id)).filter(Boolean) : []
            serverFavoritesRef.current = serverIds
            console.log("FavoritesProvider: loaded server favorites", { userId, count: serverIds.length })

            // migrate local favorites
            const stored = typeof window !== "undefined" ? localStorage.getItem("la-fashion-favorites") : null
            const localIds: string[] = stored ? JSON.parse(stored) : []
            const toAdd = localIds.filter((id) => !serverIds.includes(id))
            console.log("FavoritesProvider: local->server migration", { localCount: localIds.length, toAddCount: toAdd.length })
            for (const pid of toAdd) {
              try {
                const res = await fetch(`/api/favorites`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "x-user-id": userId },
                  body: JSON.stringify({ userId, productId: pid }),
                })
                if (!res.ok) {
                  let bodyText = null
                  try { bodyText = await res.text() } catch (e) {}
                  console.warn("FavoritesProvider: migration POST failed", { productId: pid, status: res.status, body: bodyText })
                } else {
                  console.log("FavoritesProvider: migration POST succeeded", { productId: pid, status: res.status })
                }
              } catch (e) {
                console.error("FavoritesProvider: migration POST error", { productId: pid, error: String(e) })
              }
            }

            const merged = Array.from(new Set([...serverIds, ...localIds]))
            if (mounted) setFavorites(merged)
            try { localStorage.setItem("la-fashion-favorites", JSON.stringify(merged)) } catch (e) {}
            console.log("FavoritesProvider: favorites set (merged)", { count: merged.length })
            return
          }
        }

        // fallback to localStorage
        const stored = typeof window !== "undefined" ? localStorage.getItem("la-fashion-favorites") : null
        if (stored && mounted) {
          try {
            const parsed = JSON.parse(stored)
            console.log("FavoritesProvider: fallback to localStorage", { count: Array.isArray(parsed) ? parsed.length : 0 })
          } catch (e) {}
          setFavorites(JSON.parse(stored))
        }
      } catch (error) {
        console.error("Error loading favorites:", error)
      } finally {
        if (mounted) setLoading(false)
        console.log("FavoritesProvider: load finished", { loading: false })
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("FavoritesProvider: auth state change", { event })
      try {
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          const userId = session?.user?.id
          console.log("FavoritesProvider: fetching server favorites after auth event", { userId })
          if (!userId) return

          const res = await fetch(`/api/favorites?userId=${encodeURIComponent(userId)}`)
          const json = res.ok ? await res.json() : []
          const serverIds = Array.isArray(json) ? json.map((f: any) => String(f.products?.id ?? f.product_id ?? f.id)).filter(Boolean) : []
          serverFavoritesRef.current = serverIds

          const stored = typeof window !== "undefined" ? localStorage.getItem("la-fashion-favorites") : null
          const localIds: string[] = stored ? JSON.parse(stored) : []
          const toAdd = localIds.filter((id) => !serverIds.includes(id))
          for (const pid of toAdd) {
            try {
              const res = await fetch(`/api/favorites`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-user-id": userId },
                body: JSON.stringify({ userId, productId: pid }),
              })
              if (!res.ok) {
                let bodyText = null
                try { bodyText = await res.text() } catch (e) {}
                console.warn("FavoritesProvider: migration POST failed (auth change)", { productId: pid, status: res.status, body: bodyText })
              } else {
                console.log("FavoritesProvider: migration POST succeeded (auth change)", { productId: pid, status: res.status })
              }
            } catch (e) {
              console.error("FavoritesProvider: migration POST error (auth change)", { productId: pid, error: String(e) })
            }
          }
          const merged = Array.from(new Set([...serverIds, ...localIds]))
          setFavorites(merged)
          try { localStorage.setItem("la-fashion-favorites", JSON.stringify(merged)) } catch (e) {}
          console.log("FavoritesProvider: synced favorites after auth", { event, count: merged.length })
        }

        if (event === "SIGNED_OUT") {
          const stored = typeof window !== "undefined" ? localStorage.getItem("la-fashion-favorites") : null
          setFavorites(stored ? JSON.parse(stored) : [])
          serverFavoritesRef.current = null
          console.log("FavoritesProvider: user signed out, restored local favorites")
        }
      } catch (e) {
        console.error("Error syncing favorites on auth change", e)
      }
    })

    return () => { sub?.subscription?.unsubscribe?.() }
  }, [])

  const toggleFavorite = useCallback(async (productId: string) => {
    const currentlyFavorite = favorites.includes(productId)
    const isNowFavorite = !currentlyFavorite

    console.log("FavoritesProvider: toggleFavorite", { productId, currentlyFavorite, isNowFavorite })

    // optimistic update
    setFavorites((prev) => {
      const newFavorites = isNowFavorite ? [...prev, productId] : prev.filter((id) => id !== productId)
      try { localStorage.setItem("la-fashion-favorites", JSON.stringify(newFavorites)) } catch (e) {}
      return newFavorites
    })

    try {
      const { data } = await supabase.auth.getUser()
      const userId = data?.user?.id

      if (userId) {
        const serverFavs = serverFavoritesRef.current ?? []
        if (isNowFavorite) {
          if (!serverFavs.includes(productId)) {
            const res = await fetch(`/api/favorites`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-user-id": userId },
              body: JSON.stringify({ userId, productId }),
            })
            if (!res.ok) throw new Error("Error adding favorite on server")
            serverFavoritesRef.current = [...serverFavs, productId]
          }
        } else {
          const res = await fetch(`/api/favorites?userId=${encodeURIComponent(userId)}&productId=${encodeURIComponent(productId)}`, {
            method: "DELETE",
          })
          if (!res.ok) throw new Error("Error removing favorite on server")
          serverFavoritesRef.current = serverFavs.filter((id) => id !== productId)
        }
      }
    } catch (error) {
      console.error("Error syncing favorites with server:", error)
      // rollback
      setFavorites((prev) => {
        const rolledBack = currentlyFavorite ? [...prev, productId] : prev.filter((id) => id !== productId)
        try { localStorage.setItem("la-fashion-favorites", JSON.stringify(rolledBack)) } catch (e) {}
        console.log("FavoritesProvider: rollback after sync error", { productId })
        return rolledBack
      })
    }
  }, [favorites])

  const isFavorite = useCallback((productId: string) => favorites.includes(productId), [favorites])

  const value: UseFavoritesReturn = {
    favorites,
    isFavorite,
    toggleFavorite,
    loading,
  }

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavoritesContext() {
  return useContext(FavoritesContext)
}
