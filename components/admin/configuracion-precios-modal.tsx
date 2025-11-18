"use client"

import type React from "react"
import { createPortal } from "react-dom"
import { useState, useEffect } from "react"
import Button from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useConfiguracion } from "@/hooks/use-configuracion" // El hook clave
import { X } from "lucide-react"

interface ConfiguracionPreciosModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ConfiguracionPreciosModal({ isOpen, onClose, onSuccess }: ConfiguracionPreciosModalProps) {
  // CRÍTICO: TODOS LOS HOOKS DEBEN LLAMARSE AQUÍ, AL INICIO.
  const { config, loading, updateConfig } = useConfiguracion() // useConfiguracion es un Hook.

  const [formData, setFormData] = useState({
    valor_dolar: 0,
    precio_libra: 0,
  })
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false) 

  // 1. Hook de montaje para el Portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // 2. Hook para cargar valores actuales a los inputs (depende de config y isOpen)
  useEffect(() => {
    // Solo cargamos los datos si está abierto Y tenemos la configuración
    if (isOpen && config) {
      setFormData({
        valor_dolar: config.valor_dolar ?? 0,
        precio_libra: config.precio_libra ?? 0,
      })
    }
  }, [config, isOpen]) // Dependencia de config E isOpen

  // 3. Función de guardado
  const handleSubmit = async () => {
    // ... (Tu lógica de validación y guardado)
    if (formData.valor_dolar <= 0 || formData.precio_libra <= 0) {
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

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // CRÍTICO: El renderizado condicional ocurre AQUÍ, justo antes del return final.
  if (!isOpen || !mounted) return null

  // Usamos createPortal
  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={handleModalContentClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Configuración de precios</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body - Eliminamos <form> y usamos <div> */}
        <div className="p-6 space-y-4">
          
          {/* Sección de Precios Actuales */}
          <div className="border p-4 rounded-lg space-y-2">
            <h3 className="text-md font-semibold text-gray-700">Precios actuales</h3>
            <p className="text-sm">
              Dólar (CUP): <strong>{loading ? 'Cargando...' : (config.valor_dolar ?? '—')}</strong>
            </p>
            <p className="text-sm">
              Precio por libra (USD): <strong>{loading ? 'Cargando...' : (config.precio_libra ?? '—')}</strong>
            </p>
          </div>

          {/* Input Nuevo Valor Dólar */}
          <div className="space-y-2">
            <Label htmlFor="nuevo-valor-dolar">Nuevo valor del dólar (CUP)</Label>
            <Input
              id="nuevo-valor-dolar"
              type="number"
              value={formData.valor_dolar ?? ""}
              onChange={(e) => setFormData({ ...formData, valor_dolar: Number(e.target.value) })}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              disabled={saving || loading}
            />
          </div>

          {/* Input Nuevo Precio por Libra */}
          <div className="space-y-2">
            <Label htmlFor="nuevo-precio-libra">Nuevo precio por libra (USD)</Label>
            <Input
              id="nuevo-precio-libra"
              type="number"
              value={formData.precio_libra ?? ""}
              onChange={(e) => setFormData({ ...formData, precio_libra: Number(e.target.value) })}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              disabled={saving || loading}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button 
                type="button" 
                onClick={handleSubmit} 
                disabled={saving || loading}
            >
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
