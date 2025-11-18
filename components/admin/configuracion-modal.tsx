"use client"

import type React from "react"
import { createPortal } from "react-dom"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import Button from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useConfiguracion } from "@/hooks/use-configuracion"

interface ConfiguracionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ConfiguracionModal({ isOpen, onClose, onSuccess }: ConfiguracionModalProps) {
  const { config, loading, updateConfig } = useConfiguracion()
  const [formData, setFormData] = useState({
    precio_libra: 0,
    valor_dolar: 0,
  })
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false) 

  // 1. Manejo del montaje para el Portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (config) {
      setFormData({
        precio_libra: config.precio_libra ?? 0,
        valor_dolar: config.valor_dolar ?? 0,
      })
    }
  }, [config])

  // Función de guardado que ya no espera un evento de submit del formulario
  const handleSubmit = async () => {
    if (formData.precio_libra <= 0 || formData.valor_dolar <= 0) {
      console.error("Los valores deben ser mayores a 0")
      return
    }

    setSaving(true)
    const result = await updateConfig(formData)
    setSaving(false)

    if (result.success) {
      console.log("Configuración actualizada exitosamente")
      onSuccess?.()
      onClose()
    } else {
      console.error(`Error al actualizar: ${result.error}`)
    }
  }
  
  // Función para detener la propagación del clic dentro del modal
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen || !mounted) return null

  // Renderizamos en un Portal
  return createPortal(
    // Overlay (Fondo oscuro) - Cierra al hacer clic fuera del modal
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      {/* Contenedor del Modal (Tarjeta blanca) - Detiene la propagación para evitar cierre accidental */}
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={handleModalContentClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Configuración de Inversión</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body - IMPORTANTE: Reemplazamos <form> por <div> para eliminar el comportamiento de submit */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="precio-libra">Precio por libra (USD)</Label>
            <Input
              id="precio-libra"
              type="number"
              value={formData.precio_libra ?? ""}
              onChange={(e) => setFormData({ ...formData, precio_libra: Number(e.target.value) })}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor-dolar">Valor del dólar (CUP)</Label>
            <Input
              id="valor-dolar"
              type="number"
              value={formData.valor_dolar ?? ""}
              onChange={(e) => setFormData({ ...formData, valor_dolar: Number(e.target.value) })}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              disabled={loading}
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Fórmula de cálculo:</strong>
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Inversión = (Peso × Precio/libra + Precio compra) × Valor dólar
            </p>
            <p className="text-xs text-blue-600 mt-2">
              Ejemplo: (2 lb × {formData.precio_libra} + 50 USD) × {formData.valor_dolar} CUP
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            {/* CRÍTICO: El botón ahora es type="button" y llama a la función directamente */}
            <Button 
                type="button" 
                onClick={handleSubmit} 
                disabled={saving || loading}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body // Destino final del Portal
  )
}
