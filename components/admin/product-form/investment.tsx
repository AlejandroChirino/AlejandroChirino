"use client"

import { useState, useEffect } from "react"
import Input from "@/components/ui/input"
import Button from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfiguracionModal } from "@/components/admin/configuracion-modal"
import type { ProductFormData } from "@/lib/admin-types"
import { useConfiguracion } from "@/hooks/use-configuracion"

interface InvestmentProps {
  formData: ProductFormData
  errors: Record<string, string>
  updateField: (field: keyof ProductFormData, value: any) => void
}

export function Investment({ formData, errors, updateField }: InvestmentProps) {
  const [autoCalculate, setAutoCalculate] = useState(true)
  const [calculatedInvestment, setCalculatedInvestment] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { config, loading, reloadConfig } = useConfiguracion()

  useEffect(() => {
    if (autoCalculate && config.precio_libra && config.valor_dolar) {
      const investment = (formData.peso * config.precio_libra + formData.precio_compra) * config.valor_dolar
      setCalculatedInvestment(investment)
    }
  }, [formData.peso, formData.precio_compra, config, autoCalculate])

  const handleModalSuccess = () => {
    reloadConfig()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Inversión</h3>
        <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(true)} disabled={loading}>
          Configurar valores
        </Button>
      </div>

      {loading ? (
        <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-600">Cargando configuración...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Peso (libras)"
              type="number"
              value={formData.peso}
              onChange={(e) => updateField("peso", Number(e.target.value))}
              error={errors.peso}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />

            <Input
              label="Precio de compra (USD)"
              type="number"
              value={formData.precio_compra}
              onChange={(e) => updateField("precio_compra", Number(e.target.value))}
              error={errors.precio_compra}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="auto_calculate" checked={autoCalculate} onCheckedChange={setAutoCalculate} />
            <label htmlFor="auto_calculate" className="text-sm font-medium text-gray-700">
              Calcular inversión automáticamente
            </label>
          </div>

          {autoCalculate && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Fórmula:</strong> (Peso × {config.precio_libra} + Precio compra) × {config.valor_dolar}
              </p>
              <p className="text-lg font-semibold text-blue-900 mt-2">
                Inversión calculada: {calculatedInvestment.toFixed(2)} CUP
              </p>
            </div>
          )}
        </>
      )}

      <ConfiguracionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleModalSuccess} />
    </div>
  )
}
