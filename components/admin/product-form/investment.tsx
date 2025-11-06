"use client"

import { useState, useEffect } from "react"
import Input from "@/components/ui/input"
import Button from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { ProductFormData } from "@/lib/admin-types"

interface InvestmentProps {
  formData: ProductFormData
  errors: Record<string, string>
  updateField: (field: keyof ProductFormData, value: any) => void
}

export function Investment({ formData, errors, updateField }: InvestmentProps) {
  const [autoCalculate, setAutoCalculate] = useState(true)
  const [config, setConfig] = useState({ precio_libra: 0, valor_dolar: 0 })
  const [calculatedInvestment, setCalculatedInvestment] = useState(0)

  useEffect(() => {
    // Load configuration
    const loadConfig = async () => {
      try {
        const res = await fetch("/api/admin/configuracion")

        if (!res.ok) {
          throw new Error(`Error al cargar config: ${res.status} - ${res.statusText}`)
        }

        const data = await res.json()
        if (data.config) {
          setConfig(data.config)
        }
      } catch (error) {
        console.error("Error loading config:", error)
      }
    }
    loadConfig()
  }, [])

  useEffect(() => {
    if (autoCalculate && config.precio_libra && config.valor_dolar) {
      const investment = (formData.peso * config.precio_libra + formData.precio_compra) * config.valor_dolar
      setCalculatedInvestment(investment)
    }
  }, [formData.peso, formData.precio_compra, config, autoCalculate])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Inversión</h3>

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

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Open configuration modal (to be implemented)
            alert("Modal de configuración - Por implementar")
          }}
        >
          Configurar valores
        </Button>
      </div>
    </div>
  )
}
