"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"
import type { CartItem, Product } from "@/lib/types"

export interface CartContextType {
  items: CartItem[]
  itemCount: number
  subtotal: number
  isLoading: boolean
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  isItemInCart: (productId: string, size?: string | null, color?: string | null) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Calcular el número total de items
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  // Calcular el subtotal
  const subtotal = items.reduce((total, item) => {
    return total + item.quantity * item.product.price
  }, 0)

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

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    try {
      localStorage.setItem("la-fashion-cart", JSON.stringify(items))
    } catch (error) {
      console.error("Error saving cart to localStorage:", error)
    }
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
          // Añadir nuevo item
          const newItem: CartItem = {
            id: `${product.id}-${size || "default"}-${color || "default"}-${Date.now()}`,
            product,
            quantity,
            size: size || null,
            color: color || null,
          }
          setItems((prev) => [...prev, newItem])
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
    [items, toast],
  )

  // Actualizar cantidad de un producto
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      setIsLoading(true)
      try {
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
    [items, toast],
  )

  // Eliminar un producto del carrito
  const removeItem = useCallback(
    async (itemId: string) => {
      setIsLoading(true)
      try {
        const itemToRemove = items.find((item) => item.id === itemId)
        if (!itemToRemove) {
          throw new Error("Item not found")
        }

        setItems((prev) => prev.filter((item) => item.id !== itemId))

        toast({
          title: "Producto eliminado",
          description: `${itemToRemove.product.name} ha sido eliminado de tu bolsa`,
        })
      } catch (error) {
        console.error("Error removing item from cart:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el producto",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [items, toast],
  )

  // Vaciar el carrito
  const clearCart = useCallback(async () => {
    setIsLoading(true)
    try {
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
    isLoading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
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
