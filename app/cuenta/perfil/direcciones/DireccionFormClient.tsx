"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Trash2 } from "lucide-react"

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

function saveAddresses(list: Address[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {}
}

export default function DireccionFormClient({ id }: { id?: string } = {}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])

  const [alias, setAlias] = useState("")
  const [recipient, setRecipient] = useState("")
  const [line1, setLine1] = useState("")
  const [line2, setLine2] = useState("")
  const [city, setCity] = useState("")
  const [postal, setPostal] = useState("")
  const [country, setCountry] = useState("")
  const [isDefault, setIsDefault] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch('/api/addresses')
      .then(r => r.json())
      .then(data => {
        if (!mounted) return
        setAddresses(data || [])
        if (id) {
          const found = (data || []).find((x: Address) => x.id === id)
          if (found) {
            setAlias(found.alias ?? "")
            setRecipient(found.recipient ?? "")
            setLine1(found.line1 ?? "")
            setLine2(found.line2 ?? "")
            setCity(found.city ?? "")
            setPostal(found.postal ?? "")
            setCountry(found.country ?? "")
            setIsDefault(Boolean(found.is_default ?? found.isDefault))
          }
        }
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [id])

  const handleSave = async () => {
    setLoading(true)
    try {
      const payload = { alias, recipient, line1, line2, city, postal, country, isDefault }
      if (id) {
        const res = await fetch('/api/addresses', { method: 'PUT', body: JSON.stringify({ id, ...payload }), headers: { 'Content-Type': 'application/json' } })
        const data = await res.json()
        if (data?.error) throw new Error(data.error)
      } else {
        const res = await fetch('/api/addresses', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } })
        const data = await res.json()
        if (data?.error) throw new Error(data.error)
      }
      router.push('/cuenta/perfil/direcciones')
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'Error guardando')
    } finally { setLoading(false) }
  }

  const handleDelete = async () => {
    if (!id) return
    if (!confirm('¿Eliminar esta dirección?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/addresses?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const data = await res.json()
      if (data?.error) throw new Error(data.error)
      router.push('/cuenta/perfil/direcciones')
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'Error eliminando')
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase">{id ? 'EDITAR DIRECCIÓN' : 'AÑADIR NUEVA DIRECCIÓN'}</h2>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Nombre / Alias</label>
        <input value={alias} onChange={(e)=>setAlias(e.target.value)} className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-accent-orange outline-none py-2" placeholder="Casa, Trabajo" />
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Nombre del receptor</label>
        <input value={recipient} onChange={(e)=>setRecipient(e.target.value)} className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-accent-orange outline-none py-2" placeholder="Ej. Juan Pérez" />
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Línea 1</label>
        <input value={line1} onChange={(e)=>setLine1(e.target.value)} className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-accent-orange outline-none py-2" placeholder="Calle, número" />
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Línea 2 (opcional)</label>
        <input value={line2} onChange={(e)=>setLine2(e.target.value)} className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-accent-orange outline-none py-2" placeholder="Apartamento, piso" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Ciudad</label>
          <input value={city} onChange={(e)=>setCity(e.target.value)} className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-accent-orange outline-none py-2" />
        </div>
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Código postal</label>
          <input value={postal} onChange={(e)=>setPostal(e.target.value)} className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-accent-orange outline-none py-2" />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">País</label>
        <input value={country} onChange={(e)=>setCountry(e.target.value)} className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-accent-orange outline-none py-2" />
      </div>

      <div className="mb-6 flex items-center gap-3">
        <input id="def" type="checkbox" checked={isDefault} onChange={(e)=>setIsDefault(e.target.checked)} className="w-4 h-4 border-gray-300" />
        <label htmlFor="def" className="text-sm">Establecer como dirección predeterminada</label>
      </div>

      <div className="mt-6 flex items-center">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg border-0 shadow-none flex items-center justify-center"
          aria-label="Guardar cambios"
        >
          {loading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          )}
          <span className="text-sm font-medium">{loading ? 'Guardando...' : 'Guardar cambios'}</span>
        </button>

        {id && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="ml-4 text-red-600 text-sm hover:underline bg-transparent border-0 p-0"
            aria-label="Eliminar dirección"
          >
            Eliminar
          </button>
        )}

        <button
          onClick={()=>router.push('/cuenta/perfil/direcciones')}
          disabled={loading}
          className="ml-4 text-sm text-gray-600 bg-transparent border-0 p-0"
          aria-label="Cancelar"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
