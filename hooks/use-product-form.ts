"use client"

import { useState, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"
import type { ProductFormData } from "@/lib/admin-types"
import { v4 as uuidv4 } from "uuid"

interface UseProductFormReturn {
  formData: ProductFormData
  loading: boolean
  errors: Record<string, string>
  updateField: (field: keyof ProductFormData, value: any) => void
  validateForm: () => boolean
  submitForm: (quantity: number) => Promise<boolean>
  resetForm: () => void
  loadProduct: (id: string) => Promise<void>
}

const initialFormData: ProductFormData = {
  name: "",
  description: "",
  category: "",
  subcategoria: "",
  price: 0,
  sale_price: 0,
  on_sale: false,
  peso: 0,
  precio_compra: 0,
  sizes: [],
  colors: [],
  stock: 0,
  featured: false,
  is_vip: false,
  is_new: false,
  image_url: "",
  colaboracion_id: undefined,

}

export function useProductForm(productId?: string): UseProductFormReturn {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = useCallback(
    (field: keyof ProductFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      // Clear error when field is updated
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }))
      }
    },
    [errors],
  )

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "El nombre es requerido"
    if (!formData.description.trim()) newErrors.description = "La descripción es requerida"
    if (!formData.category) newErrors.category = "La categoría es requerida"
    if (!formData.subcategoria) newErrors.subcategoria = "La subcategoría es requerida"
    if (formData.price <= 0) newErrors.price = "El precio debe ser mayor a 0"
    if (formData.peso <= 0) newErrors.peso = "El peso debe ser mayor a 0"
    if (formData.precio_compra <= 0) newErrors.precio_compra = "El precio de compra debe ser mayor a 0"
    if (formData.stock < 0) newErrors.stock = "El stock no puede ser negativo"
    if (formData.sizes.length === 0) newErrors.sizes = "Debe seleccionar al menos una talla"
    if (formData.colors.length === 0) newErrors.colors = "Debe seleccionar al menos un color"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setErrors({})
  }, [])

  const submitForm = useCallback(
    async (quantity = 1): Promise<boolean> => {
      if (!validateForm()) {
        toast({
          title: "Error de validación",
          description: "Por favor, complete todos los campos requeridos",
          variant: "destructive",
        })
        return false
      }

      setLoading(true)
      try {
        if (productId) {
          // Lógica de actualización para un solo producto
          const response = await fetch(`/api/admin/productos/${productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          })
          const data = await response.json()
          if (!response.ok) throw new Error(data.error || "Error al actualizar producto")
          toast({ title: "Producto actualizado", description: "El producto se actualizó correctamente" })
        } else if (quantity > 1) {
          // Lógica de creación masiva
          const response = await fetch("/api/admin/productos/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productData: formData, quantity }),
          })
          const data = await response.json()
          if (!response.ok) throw new Error(data.error || "Error en la creación masiva")
          toast({
            title: "Creación masiva exitosa",
            description: `${data.createdCount} productos creados correctamente.`,
          })
        } else {
          // Lógica de creación para un solo producto
          const payload = { ...formData, id: uuidv4() }
          const response = await fetch("/api/admin/productos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
          const data = await response.json()

          // Verificar que la respuesta contiene el producto creado
          if (!response.ok) {
            const serverMessage = data?.error || data?.message || "Error al crear producto"
            throw new Error(serverMessage)
          }

          if (!data || !data.product) {
            // Respuesta 200 pero sin objeto creado: tratar como error
            console.error("POST /api/admin/productos returned OK but no product:", data)
            throw new Error("No se creó el producto. Revisa la consola del servidor para más detalles.")
          }

          toast({ title: "Producto creado", description: "El producto se creó correctamente" })

          // Sólo limpiar el formulario si el servidor confirma creación
          if (!productId) {
            resetForm()
          }
        }

        return true
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error desconocido",
          variant: "destructive",
        })
        return false
      } finally {
        setLoading(false)
      }
    },
    [formData, productId, validateForm, resetForm],
  )

  const loadProduct = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/productos/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar producto")
      }

      setFormData(data.product)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar producto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    formData,
    loading,
    errors,
    updateField,
    validateForm,
    submitForm,
    resetForm,
    loadProduct,
  }
}
