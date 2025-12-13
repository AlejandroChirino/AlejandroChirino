"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"
import type { CartItem, Product } from "@/lib/types"
import { safeSupabase } from "@/lib/supabaseClient"

export interface CartContextType {
  items: CartItem[]
  itemCount: number
  subtotal: number
  selectedItems: CartItem[]
  selectedItemCount: number
  selectedSubtotal: number
  isLoading: boolean
  selectedIds: string[]
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  updateItemOptions: (itemId: string, options: { size?: string | null; color?: string | null }) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  toggleSelect: (itemId: string) => void
  selectAll: () => void
  clearSelection: () => void
  removeItems: (itemIds: string[]) => Promise<void>
  isItemInCart: (productId: string, size?: string | null, color?: string | null) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Rehydrate selected ids from localStorage to preserve selection across navigation and sessions
  useEffect(() => {
    try {
      const s = localStorage.getItem("la-fashion-selected")
      if (s) setSelectedIds(JSON.parse(s))
    } catch (e) {
      /* ignore */
    }
  }, [])

  // Persist selection to localStorage so it survives leaving the cart or closing the browser
  useEffect(() => {
    try {
      localStorage.setItem("la-fashion-selected", JSON.stringify(selectedIds))
    } catch (e) {
      /* ignore */
    }
  }, [selectedIds])

  // Calcular el número total de items
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  // Calcular el subtotal
  const subtotal = items.reduce((total, item) => {
    return total + item.quantity * item.product.price
  }, 0)

  // Selected items derived from selectedIds
  const selectedItems = items.filter((it) => selectedIds.includes(it.id))
  const selectedItemCount = selectedItems.reduce((count, item) => count + item.quantity, 0)
  const selectedSubtotal = selectedItems.reduce((total, item) => total + item.quantity * item.product.price, 0)

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem("la-fashion-cart")
        if (savedCart) {
          setItems(JSON.parse(savedCart))
        }
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }

    loadCart()
  }, [])

  // Detectar sesión y sincronizar carrito con servidor si hay usuario
  useEffect(() => {
    let mounted = true

    const initSync = async () => {
      try {
        const { data: authData } = await safeSupabase.auth.getUser()
        const uid = authData?.user?.id
        if (!uid) return
        if (!mounted) return
        setUserId(uid)

        // Merge: comprobar primero si el servidor acepta la sesión del cliente.
        // En algunos despliegues la sesión no se transmite a los endpoints server-side,
        // lo que provoca 401 en cada POST. Hacemos una comprobación GET previa y sólo
        // ejecutamos la migración si el servidor responde OK.
        const local = JSON.parse(localStorage.getItem("la-fashion-cart") || "[]") as CartItem[]

        // Safety guard: if the local cart contains an abnormally large number
        // of items (likely from a previous test run or a bug), skip the
        // automatic migration to avoid inserting hundreds/thousands of rows
        // repeatedly. The threshold is conservative and can be adjusted.
        if (Array.isArray(local) && local.length > 50) {
          console.warn("Skipping automatic cart migration: local cart contains too many items", { localCount: local.length })
          return
        }

        const testRes = await fetch(`/api/cart?userId=${encodeURIComponent(uid)}`)
        if (!testRes.ok) {
          // Si el servidor responde 401 (no autenticado) o falla, evitamos hacer muchos POST 401.
          console.warn("Failed to fetch server cart for sync", { status: testRes.status })
          // Mantener el carrito local tal cual y salir de la sincronización.
          return
        }

        // Si la verificación pasó, obtener carrito definitivo desde servidor y luego migrar local items.
        const serverItemsInitial = await testRes.json()
        // Mapeamos primero para reemplazar local más tarde (esto evita estados intermedios)
        const mappedInitial: CartItem[] = (serverItemsInitial || []).map((ci: any) => ({
          id: ci.id,
          product: ci.products,
          quantity: ci.quantity,
          size: ci.size || null,
          color: ci.color || null,
        }))

        // Enviar items locales al servidor con un solo request bulk (upsert)
        // Esto hace la migración idempotente y evita N peticiones seriales.
        try {
          const bulkPayload = (local || []).map((it) => ({ productId: it.product.id, quantity: it.quantity, size: it.size, color: it.color }))
          if (bulkPayload.length > 0) {
            await fetch(`/api/cart/bulk`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items: bulkPayload }),
            })
          }
        } catch (err) {
          console.warn("Error merging cart items to server (bulk):", err)
        }

        // Obtener carrito definitivo desde servidor y reemplazar local
        const res = await fetch(`/api/cart?userId=${encodeURIComponent(uid)}`)
        if (!res.ok) {
          console.warn("Failed to fetch server cart for sync after migration", { status: res.status })
          return
        }
        const serverItems = await res.json()
        const mapped: CartItem[] = (serverItems || []).map((ci: any) => ({
          id: ci.id,
          product: ci.products,
          quantity: ci.quantity,
          size: ci.size || null,
          color: ci.color || null,
          selected: ci.selected === undefined ? true : !!ci.selected,
        }))
        setItems(mapped)
        // Sync selection from server for authenticated user
        setSelectedIds(mapped.filter((it) => !!(it as any).selected).map((it) => it.id))
      } catch (err) {
        console.error("Error initializing cart sync:", err)
      }
    }

    initSync()

    return () => {
      mounted = false
    }
  }, [])

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    try {
      localStorage.setItem("la-fashion-cart", JSON.stringify(items))
      // Si hay usuario autenticado, mantener servidor en sync (re-fetch simple)
      ;(async () => {
        try {
          if (!userId) return
          // Obtener carrito desde servidor y actualizar local si difiere
          const res = await fetch(`/api/cart?userId=${encodeURIComponent(userId)}`)
          if (!res.ok) return
          const serverItems = await res.json()
          const mapped: CartItem[] = (serverItems || []).map((ci: any) => ({
            id: ci.id,
            product: ci.products,
            quantity: ci.quantity,
            size: ci.size || null,
            color: ci.color || null,
            selected: ci.selected === undefined ? true : !!ci.selected,
          }))
          setSelectedIds(mapped.filter((it) => !!(it as any).selected).map((it) => it.id))
          // Si el servidor tiene un estado distinto, prefierelo y sincroniza localStorage
          const serverJson = JSON.stringify(mapped)
          const localJson = JSON.stringify(items)
          if (serverJson !== localJson) {
            setItems(mapped)
            localStorage.setItem("la-fashion-cart", serverJson)
          }
        } catch (err) {
          // no bloquear en caso de fallo de red
        }
      })()
    } catch (error) {
      console.error("Error saving cart to localStorage:", error)
    }
  }, [items])

  // Mantener selección coherente cuando cambian los items (eliminar ids que ya no existan)
  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => items.some((it) => it.id === id)))
  }, [items])

  // Verificar si un producto ya está en el carrito
  const isItemInCart = useCallback(
    (productId: string, size?: string | null, color?: string | null) => {
      return items.some(
        (item) => item.product.id === productId && item.size === (size || null) && item.color === (color || null),
      )
    },
    [items],
  )

  // Selección de items (UI)
  const toggleSelect = useCallback((itemId: string) => {
    // Optimistic update: toggle locally and attempt to persist to server if authenticated
    setSelectedIds((prev) => {
      const isSelected = prev.includes(itemId)
      const next = isSelected ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      ;(async () => {
        try {
          // Only call server if we have a authenticated user id
          if (!userId) return
          const body = { selected: !isSelected }
          const res = await fetch(`/api/cart/${encodeURIComponent(itemId)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
          if (!res.ok) {
            // Revert optimistic update on failure
            setSelectedIds((current) => (isSelected ? [...current, itemId] : current.filter((id) => id !== itemId)))
            try { const err = await res.json().catch(() => ({})); console.warn("toggleSelect: server error", err) } catch (e) {}
            toast({ title: "Error", description: "No se pudo actualizar la selección en el servidor", variant: "destructive" })
          }
        } catch (err) {
          // network or unexpected error: revert and notify
          setSelectedIds((current) => (isSelected ? [...current, itemId] : current.filter((id) => id !== itemId)))
          console.error("toggleSelect error:", err)
          toast({ title: "Error", description: "No se pudo actualizar la selección", variant: "destructive" })
        }
      })()
      return next
    })
  }, [userId])

  const selectAll = useCallback(() => {
    setSelectedIds(items.map((it) => it.id))
  }, [items])

  const clearSelection = useCallback(() => setSelectedIds([]), [])

  // Eliminar múltiples items (mantiene comportamiento servidor/local)
  const removeItems = useCallback(
    async (itemIds: string[]) => {
      if (!itemIds || itemIds.length === 0) return
      setIsLoading(true)
      try {
        if (userId) {
          // Si hay usuario, intentar eliminar cada item en el servidor (el endpoint maneja borrado por id)
          // Si el servidor responde 401 (no autorizado), hacemos fallback a eliminación local para evitar loops de peticiones fallidas.
          let unauthorized = false
          for (const id of itemIds) {
            try {
              const res = await fetch(`/api/cart/${encodeURIComponent(id)}`, { method: "DELETE" })
              if (res.status === 401) {
                console.warn("Bulk delete: server returned 401, falling back to local delete")
                unauthorized = true
                break
              }
            } catch (e) {
              console.warn("Error deleting cart item during bulk remove:", id, e)
            }
          }

          if (!unauthorized) {
            // refrescar desde servidor sólo si no hubo 401
            try {
              const fetchRes = await fetch(`/api/cart?userId=${encodeURIComponent(userId)}`)
              if (fetchRes.ok) {
                const serverItems = await fetchRes.json()
                const mapped: CartItem[] = (serverItems || []).map((ci: any) => ({
                  id: ci.id,
                  product: ci.products,
                  quantity: ci.quantity,
                  size: ci.size || null,
                  color: ci.color || null,
                  selected: ci.selected === undefined ? true : !!ci.selected,
                }))
                setItems(mapped)
                setSelectedIds(mapped.filter((it) => !!(it as any).selected).map((it) => it.id))
              }
            } catch (e) {
              console.warn("Error refreshing server cart after bulk delete:", e)
            }
          } else {
            // Fallback local: eliminar las filas en localStorage/state para evitar peticiones repetidas no autorizadas
            setItems((prev) => prev.filter((it) => !itemIds.includes(it.id)))
          }
        } else {
          // local
          setItems((prev) => prev.filter((it) => !itemIds.includes(it.id)))
        }
        // limpiar selección
        setSelectedIds((prev) => prev.filter((id) => !itemIds.includes(id)))
      } catch (err) {
        console.error("Error removing multiple cart items:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [userId],
  )

  // Añadir un producto al carrito
  const addItem = useCallback(
    async (product: Product, quantity = 1, size?: string, color?: string) => {
      setIsLoading(true)
      try {
        // Verificar stock antes de añadir
        if (product.stock < quantity) {
          toast({
            title: "Stock insuficiente",
            description: `Solo quedan ${product.stock} unidades disponibles`,
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        // Buscar si el producto ya existe en el carrito con la misma talla y color
        const existingItemIndex = items.findIndex(
          (item) => item.product.id === product.id && item.size === (size || null) && item.color === (color || null),
        )

        if (existingItemIndex >= 0) {
          // Actualizar cantidad si ya existe
          const updatedItems = [...items]
          const newQuantity = updatedItems[existingItemIndex].quantity + quantity

          // Verificar que no exceda el stock disponible
          if (newQuantity > product.stock) {
            toast({
              title: "Stock insuficiente",
              description: `No se puede añadir más unidades. Stock disponible: ${product.stock}`,
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }

          updatedItems[existingItemIndex].quantity = newQuantity
          setItems(updatedItems)
        } else {
          // Si hay usuario autenticado, crear item en servidor y refrescar
          if (userId) {
            const res = await fetch(`/api/cart`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, productId: product.id, quantity, size, color }),
            })
            if (res.ok) {
              const created = await res.json()
              // refrescar carrito desde servidor
              const fetchRes = await fetch(`/api/cart?userId=${encodeURIComponent(userId)}`)
              if (fetchRes.ok) {
                const serverItems = await fetchRes.json()
                const mapped: CartItem[] = (serverItems || []).map((ci: any) => ({
                    id: ci.id,
                    product: ci.products,
                    quantity: ci.quantity,
                    size: ci.size || null,
                    color: ci.color || null,
                    selected: ci.selected === undefined ? true : !!ci.selected,
                  }))
                setItems(mapped)
                setSelectedIds(mapped.filter((it) => !!(it as any).selected).map((it) => it.id))
              }
            } else {
              // Fallback local behaviour si el servidor falla
              const newItem: CartItem = {
                id: `${product.id}-${size || "default"}-${color || "default"}-${Date.now()}`,
                product,
                quantity,
                size: size || null,
                color: color || null,
                selected: true,
              }
              setItems((prev) => [newItem, ...prev])
              setSelectedIds((prev) => [newItem.id, ...prev])
            }
          } else {
            // Añadir nuevo item localmente
            const newItem: CartItem = {
                id: `${product.id}-${size || "default"}-${color || "default"}-${Date.now()}`,
                product,
                quantity,
                size: size || null,
                color: color || null,
                selected: true,
              }
              // Prepend new items so the most recently added appear first (stack behavior)
              setItems((prev) => [newItem, ...prev])
              setSelectedIds((prev) => [newItem.id, ...prev])
          }
        }

        toast({
          title: "Producto añadido",
          description: `${product.name} se ha añadido a tu bolsa`,
        })
      } catch (error) {
        console.error("Error adding item to cart:", error)
        toast({
          title: "Error",
          description: "No se pudo añadir el producto a la bolsa",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [items, toast, userId],
  )

  // Actualizar cantidad de un producto
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      setIsLoading(true)
      try {
        // Si está autenticado, delegar en el servidor y refrescar
        if (userId) {
          const res = await fetch(`/api/cart/${encodeURIComponent(itemId)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity }),
          })
          if (!res.ok) {
            throw new Error("Error updating cart item on server")
          }
          // refrescar carrito
          const fetchRes = await fetch(`/api/cart?userId=${encodeURIComponent(userId)}`)
          if (fetchRes.ok) {
            const serverItems = await fetchRes.json()
            const mapped: CartItem[] = (serverItems || []).map((ci: any) => ({
              id: ci.id,
              product: ci.products,
              quantity: ci.quantity,
              size: ci.size || null,
              color: ci.color || null,
              selected: ci.selected === undefined ? true : !!ci.selected,
            }))
            setItems(mapped)
            setSelectedIds(mapped.filter((it) => !!(it as any).selected).map((it) => it.id))
          }
        } else {
          const itemIndex = items.findIndex((item) => item.id === itemId)
          if (itemIndex === -1) {
            throw new Error("Item not found")
          }

          const item = items[itemIndex]

          // Verificar stock
          if (quantity > item.product.stock) {
            toast({
              title: "Stock insuficiente",
              description: `Solo hay ${item.product.stock} unidades disponibles`,
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }

          // Actualizar cantidad
          const updatedItems = [...items]
          updatedItems[itemIndex].quantity = quantity
          setItems(updatedItems)

          toast({
            title: "Cantidad actualizada",
            description: `La cantidad de ${item.product.name} ha sido actualizada`,
          })
        }
      } catch (error) {
        console.error("Error updating item quantity:", error)
        toast({
          title: "Error",
          description: "No se pudo actualizar la cantidad",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [items, toast, userId],
  )

  // Actualizar talla/color de un producto
  const updateItemOptions = useCallback(
    async (itemId: string, options: { size?: string | null; color?: string | null }) => {
      setIsLoading(true)
      try {
        // Si está autenticado, delegar en servidor (PUT) y refrescar
        if (userId) {
          const res = await fetch(`/api/cart/${encodeURIComponent(itemId)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ size: options.size, color: options.color }),
          })
          if (!res.ok) throw new Error("Error updating cart item on server")
          const fetchRes = await fetch(`/api/cart?userId=${encodeURIComponent(userId)}`)
          if (fetchRes.ok) {
            const serverItems = await fetchRes.json()
            const mapped: CartItem[] = (serverItems || []).map((ci: any) => ({
              id: ci.id,
              product: ci.products,
              quantity: ci.quantity,
              size: ci.size || null,
              color: ci.color || null,
            }))
            setItems(mapped)
          }
        } else {
          const itemIndex = items.findIndex((item) => item.id === itemId)
          if (itemIndex === -1) {
            throw new Error("Item not found")
          }

          const current = items[itemIndex]

          const newSize = options.size === undefined ? current.size : options.size
          const newColor = options.color === undefined ? current.color : options.color

          // Validaciones básicas contra el producto
          if (newSize && current.product.sizes.length > 0 && !current.product.sizes.includes(newSize)) {
            toast({ title: "Talla inválida", description: "Selecciona una talla disponible", variant: "destructive" })
            setIsLoading(false)
            return
          }
          if (newColor && current.product.colors.length > 0 && !current.product.colors.includes(newColor)) {
            toast({ title: "Color inválido", description: "Selecciona un color disponible", variant: "destructive" })
            setIsLoading(false)
            return
          }

          // Si ya existe un item con las nuevas opciones, fusionar cantidades
          const existingIndex = items.findIndex(
            (it) =>
              it.id !== itemId &&
              it.product.id === current.product.id &&
              it.size === (newSize || null) &&
              it.color === (newColor || null),
          )

          const updatedItems = [...items]

          if (existingIndex >= 0) {
            const target = { ...updatedItems[existingIndex] }
            const mergedQty = Math.min(target.quantity + current.quantity, current.product.stock)
            const capped = mergedQty < target.quantity + current.quantity
            target.quantity = mergedQty
            updatedItems[existingIndex] = target
            // eliminar el item original
            updatedItems.splice(itemIndex, 1)

            setItems(updatedItems)

            toast({
              title: "Opciones actualizadas",
              description: capped
                ? "Se fusionaron items similares. Cantidad ajustada por stock disponible."
                : "Se fusionaron items similares correctamente",
            })
          } else {
            // Actualizar el propio item con nuevo id estable
            const newId = `${current.product.id}-${newSize || "default"}-${newColor || "default"}-${Date.now()}`
            const updated = { ...current, id: newId, size: newSize || null, color: newColor || null }
            updatedItems[itemIndex] = updated
            setItems(updatedItems)

            toast({ title: "Opciones actualizadas", description: "La talla/color han sido actualizados" })
          }
        }
      } catch (error) {
        console.error("Error updating item options:", error)
        toast({ title: "Error", description: "No se pudieron actualizar las opciones", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    },
    [items, toast, userId],
  )

  // Eliminar un producto del carrito
  const removeItem = useCallback(
    async (itemId: string) => {
      setIsLoading(true)
      // Optimistic delete: remove locally first, then call server. On error, restore previous state.
      const prevItems = items
      try {
        // Optimistic update immediately for snappier UI
        setItems((prev) => prev.filter((item) => item.id !== itemId))

        if (userId) {
          const res = await fetch(`/api/cart/${encodeURIComponent(itemId)}`, { method: "DELETE" })
          if (!res.ok) {
            // restore and throw to surface error
            setItems(prevItems)
            throw new Error("Error deleting cart item on server")
          }
          // Do not re-fetch full cart here for performance; trust the optimistic update.
          // If you need strong consistency, re-fetch on a separate background task or when encountering errors.
        } else {
          const itemToRemove = prevItems.find((item) => item.id === itemId)
          if (!itemToRemove) throw new Error("Item not found")

          toast({ title: "Producto eliminado", description: `${itemToRemove.product.name} ha sido eliminado de tu bolsa` })
        }
      } catch (error) {
        console.error("Error removing item from cart:", error)
        toast({ title: "Error", description: "No se pudo eliminar el producto", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    },
    [items, toast, userId],
  )

  // Vaciar el carrito
  const clearCart = useCallback(async () => {
    setIsLoading(true)
    try {
      if (userId) {
        // eliminar cada item del servidor
        try {
          const res = await fetch(`/api/cart?userId=${encodeURIComponent(userId)}`)
          if (res.ok) {
            const serverItems = await res.json()
            for (const ci of serverItems) {
              await fetch(`/api/cart/${encodeURIComponent(ci.id)}`, { method: "DELETE" })
            }
          }
        } catch (err) {
          console.warn("Error clearing server cart:", err)
        }
      }
      setItems([])
      toast({
        title: "Bolsa vacía",
        description: "Todos los productos han sido eliminados de tu bolsa",
      })
    } catch (error) {
      console.error("Error clearing cart:", error)
      toast({
        title: "Error",
        description: "No se pudo vaciar la bolsa",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const value = {
    items,
    itemCount,
    subtotal,
    selectedItems,
    selectedItemCount,
    selectedSubtotal,
    isLoading,
    selectedIds,
    addItem,
    updateQuantity,
    updateItemOptions,
    removeItem,
    clearCart,
    toggleSelect,
    selectAll,
    clearSelection,
    removeItems,
    isItemInCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
