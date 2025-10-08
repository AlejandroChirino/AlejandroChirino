"use client"

import type React from "react"

import { CreditCard, DollarSign, Banknote, Smartphone } from "lucide-react"
import Button from "@/components/ui/button"
import type { PaymentMethod } from "@/lib/types"

interface PaymentOption {
  id: PaymentMethod
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  discount?: number
  currency: "CUP" | "USD"
  details: string
}

interface PaymentSelectionProps {
  selected: PaymentMethod | null
  onSelect: (method: PaymentMethod) => void
  onNext: () => void
  onPrev: () => void
  subtotal: number
}

const paymentOptions: PaymentOption[] = [
  {
    id: "transferencia",
    title: "Transferencia bancaria",
    description: "Pago mediante transferencia a cuenta bancaria",
    icon: CreditCard,
    currency: "CUP",
    details: "Te enviaremos los datos bancarios por WhatsApp",
  },
  {
    id: "efectivo_cup",
    title: "Efectivo CUP",
    description: "Pago en efectivo en pesos cubanos",
    icon: Banknote,
    discount: 5,
    currency: "CUP",
    details: "5% de descuento automático aplicado",
  },
  {
    id: "efectivo_usd",
    title: "Efectivo USD",
    description: "Pago en efectivo en dólares americanos",
    icon: DollarSign,
    currency: "USD",
    details: "Pago al momento de la entrega",
  },
  {
    id: "zelle",
    title: "Zelle",
    description: "Pago internacional mediante Zelle",
    icon: Smartphone,
    currency: "USD",
    details: "Te enviaremos los datos de Zelle por WhatsApp",
  },
]

export default function PaymentSelection({ selected, onSelect, onNext, onPrev, subtotal }: PaymentSelectionProps) {
  const calculateDiscount = (option: PaymentOption) => {
    if (!option.discount) return 0
    return subtotal * (option.discount / 100)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Método de Pago</h2>
        <p className="text-gray-600">Selecciona cómo quieres pagar tu pedido</p>
      </div>

      <div className="space-y-4 mb-8">
        {paymentOptions.map((option) => {
          const Icon = option.icon
          const discount = calculateDiscount(option)
          const isSelected = selected === option.id

          return (
            <div
              key={option.id}
              className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                isSelected ? "border-accent-orange bg-orange-50" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => onSelect(option.id)}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-full ${
                    isSelected ? "bg-accent-orange text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{option.title}</h3>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">{option.currency}</span>
                      {discount > 0 && (
                        <div className="text-green-600 font-semibold text-sm">-{option.discount}% descuento</div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-2">{option.description}</p>
                  <p className="text-sm text-gray-500">{option.details}</p>

                  {discount > 0 && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                      Ahorras: ${discount.toFixed(2)} {option.currency}
                    </div>
                  )}
                </div>

                {/* Radio button indicator */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "border-accent-orange" : "border-gray-300"
                  }`}
                >
                  {isSelected && <div className="w-3 h-3 rounded-full bg-accent-orange" />}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">
          Volver
        </Button>
        <Button onClick={onNext} disabled={!selected} className="flex-1">
          Revisar pedido
        </Button>
      </div>
    </div>
  )
}
