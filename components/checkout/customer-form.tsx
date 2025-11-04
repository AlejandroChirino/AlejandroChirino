"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Button from "@/components/ui/button"
import type { CustomerData } from "@/lib/types"

interface CustomerFormProps {
  data: CustomerData
  onUpdate: (data: Partial<CustomerData>) => void
  onNext: () => void
}

export default function CustomerForm({ data, onUpdate, onNext }: CustomerFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!data.fullName.trim()) newErrors.fullName = "El nombre es requerido"
    if (!data.phone.trim()) newErrors.phone = "El teléfono es requerido"
    if (!data.address.trim()) newErrors.address = "La dirección es requerida"
    if (!data.city.trim()) newErrors.city = "La ciudad es requerida"

    if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = "Email inválido"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onNext()
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Datos de Contacto</h2>
        <p className="text-gray-600">Completa tus datos para procesar el pedido</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="fullName">Nombre completo</Label>
            <Input
              id="fullName"
              value={data.fullName}
              onChange={(e) => onUpdate({ fullName: e.target.value })}
              required
              placeholder="Tu nombre completo"
            />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={data.phone}
              onChange={(e) => onUpdate({ phone: e.target.value })}
              required
              placeholder="+53 5xxx xxxx"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email (opcional)</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
            placeholder="tu@email.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="address">Dirección completa</Label>
          <Input
            id="address"
            value={data.address}
            onChange={(e) => onUpdate({ address: e.target.value })}
            required
            placeholder="Calle, número, entre calles, reparto"
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>

        <div>
          <Label htmlFor="city">Ciudad/Municipio</Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => onUpdate({ city: e.target.value })}
            required
            placeholder="La Habana, Santiago, etc."
          />
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notas adicionales (opcional)</label>
          <textarea
            value={data.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Instrucciones especiales, referencias, etc."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange"
          />
        </div>

        <Button type="submit" className="w-full" size="lg">
          Continuar con la entrega
        </Button>
      </form>
    </div>
  )
}
