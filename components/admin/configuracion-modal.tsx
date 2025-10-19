"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
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

  useEffect(() => {
    if (config) {
      setFormData({
        precio_libra: config.precio_libra || 0,
        valor_dolar: config.valor_dolar || 0,
      })
    }
  }, [config])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.precio_libra <= 0 || formData.valor_dolar <= 0) {
      alert("Los valores deben ser mayores a 0")
      return
    }

    setSaving(true)
    const result = await updateConfig(formData)
    setSaving(false)

    if (result.success) {
      alert("Configuración actualizada exitosamente")
      onSuccess?.()
      onClose()
    } else {
      alert(`Error al actualizar: ${result.error}`)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Configuración de Inversión</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Precio por libra (USD)"
            type="number"
            value={formData.precio_libra}
            onChange={(e) => setFormData({ ...formData, precio_libra: Number(e.target.value) })}
            required
            min="0"
            step="0.01"
            placeholder="0.00"
            disabled={loading}
          />

          <Input
            label="Valor del dólar (CUP)"
            type="number"
            value={formData.valor_dolar}
            onChange={(e) => setFormData({ ...formData, valor_dolar: Number(e.target.value) })}
            required
            min="0"
            step="0.01"
            placeholder="0.00"
            disabled={loading}
          />

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
            <Button type="submit" disabled={saving || loading}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
