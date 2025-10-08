"use client"

import type React from "react"

import { Truck, Store, MapPin } from "lucide-react"
import Button from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import type { DeliveryMethod } from "@/lib/types"

interface DeliveryOption {
  id: DeliveryMethod
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  baseCost: number
  freeThreshold?: number
}

interface DeliverySelectionProps {
  selected: DeliveryMethod | null
  onSelect: (method: DeliveryMethod) => void
  onNext: () => void
  onPrev: () => void
  subtotal: number
}

const deliveryOptions: DeliveryOption[] = [
  {
    id: "tienda",
    title: "Recogida en tienda",
    description: "Recoge tu pedido en nuestra tienda física",
    icon: Store,
    baseCost: 0,
  },
  {
    id: "local",
    title: "Entrega local",
    description: "Entrega en La Habana y alrededores",
    icon: Truck,
    baseCost: 250,
    freeThreshold: 5000,
  },
  {
    id: "municipal",
    title: "Entrega municipal",
    description: "Entrega a nivel nacional",
    icon: MapPin,
    baseCost: 500,
    freeThreshold: 20000,
  },
]

export default function DeliverySelection({ selected, onSelect, onNext, onPrev, subtotal }: DeliverySelectionProps) {
  const getDeliveryCost = (option: DeliveryOption) => {
    if (option.baseCost === 0) return 0
    if (option.freeThreshold && subtotal >= option.freeThreshold) return 0
    return option.baseCost
  }

  const isEligibleForFree = (option: DeliveryOption) => {
    return option.freeThreshold && subtotal >= option.freeThreshold
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Método de Entrega</h2>
        <p className="text-gray-600">Selecciona cómo quieres recibir tu pedido</p>
      </div>

      <div className="space-y-4 mb-8">
        {deliveryOptions.map((option) => {
          const Icon = option.icon
          const cost = getDeliveryCost(option)
          const isFree = isEligibleForFree(option)
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
                      {cost === 0 ? (
                        <span className="text-green-600 font-semibold">Gratis</span>
                      ) : (
                        <span className="font-semibold">{formatPrice(cost)}</span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-2">{option.description}</p>

                  {/* Información de envío gratis */}
                  {option.freeThreshold && (
                    <div className="text-sm">
                      {isFree ? (
                        <span className="text-green-600 font-medium">
                          ✓ Envío gratis aplicado (pedido ≥ {formatPrice(option.freeThreshold)})
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          Envío gratis en pedidos ≥ {formatPrice(option.freeThreshold)}
                        </span>
                      )}
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
          Continuar con el pago
        </Button>
      </div>
    </div>
  )
}
