"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, Edit, ChevronRight, Plus } from "lucide-react"

type Address = {
  id: string
  alias?: string
  recipient?: string
  line1?: string
  line2?: string
  city?: string
  postal?: string
  country?: string
  isDefault?: boolean
}

const STORAGE_KEY = "saved_addresses"

function loadAddresses(): Address[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch (e) {
    return []
  }
}

export default function DireccionesClient() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch('/api/addresses')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        if (data?.error) {
          setError(data.error)
          setAddresses([])
        } else {
          // Normalize backend snake_case to frontend camelCase
          const normalized = (data || []).map((item: any) => ({
            ...item,
            isDefault: item.is_default ?? item.isDefault ?? false,
          }))
          setAddresses(normalized)
        }
      })
      .catch((e) => { if (mounted) setError('Error cargando direcciones') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const renderAddressLine = (a: Address) => {
    const parts = [a.recipient, a.line1, a.line2, a.city, a.postal, a.country].filter(Boolean)
    return parts.join(", ")
  }

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase">DIRECCIONES GUARDADAS</h2>
        <Link href="/cuenta/perfil/direcciones/nueva" className="text-sm font-semibold text-gray-700 hover:underline flex items-center gap-2">
          <Plus className="w-4 h-4" />
          AÑADIR NUEVA
        </Link>
      </div>

      <div className="divide-y divide-gray-100">
        {loading && (
          <div className="py-8 text-center text-sm text-gray-500">Cargando...</div>
        )}

        {!loading && error && (
          <div className="py-8 text-center text-sm text-red-600">{error}</div>
        )}

        {!loading && !error && addresses.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-500">No tienes direcciones guardadas aún.</div>
        )}

        {!loading && !error && addresses.map((a) => (
          <Link key={a.id} href={`/cuenta/perfil/direcciones/${a.id}`} className="block py-4 px-0 hover:bg-transparent">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="text-gray-500 mt-1"><MapPin className="w-5 h-5" /></div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-gray-900 truncate">{a.alias || renderAddressLine(a) || 'Dirección sin nombre'}</div>
                    {a.isDefault && (
                      <span className="ml-2 inline-flex items-center text-[11px] font-medium uppercase text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">Predeterminada</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1 truncate">{renderAddressLine(a)}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-400">
                <Edit className="w-4 h-4" />
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
