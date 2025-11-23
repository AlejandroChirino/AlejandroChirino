"use client"

import React, { useState, useRef } from "react"
import Button from "@/components/ui/button"
import { useRouter } from "next/navigation"

type Item = { product_id: string; quantity: number; price: number; size?: string; color?: string }

export default function NewOrderPage() {
  const router = useRouter()
  const [userId, setUserId] = useState("")
  const [shipping, setShipping] = useState("")
  const [items, setItems] = useState<Item[]>([{ product_id: "", quantity: 1, price: 0 }])
  const [itemQueries, setItemQueries] = useState<string[]>(items.map(() => ""))
  const [suggestions, setSuggestions] = useState<any[][]>(items.map(() => []))
  const timersRef = useRef<Record<number, any>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateItem(index: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }

  function addItem() {
    setItems((prev) => [...prev, { product_id: "", quantity: 1, price: 0 }])
    setItemQueries((prev) => [...prev, ""])
    setSuggestions((prev) => [...prev, []])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
    setItemQueries((prev) => prev.filter((_, i) => i !== index))
    setSuggestions((prev) => prev.filter((_, i) => i !== index))
  }

  function setQueryFor(index: number, value: string) {
    setItemQueries((prev) => prev.map((v, i) => (i === index ? value : v)))

    // debounce fetch
    if (timersRef.current[index]) clearTimeout(timersRef.current[index])
    timersRef.current[index] = setTimeout(async () => {
      if (!value || value.length < 1) {
        setSuggestions((prev) => prev.map((s, i) => (i === index ? [] : s)))
        return
      }
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(value)}&limit=10`)
        const json = await res.json()
        const list = Array.isArray(json) ? json : json.products || []
        setSuggestions((prev) => prev.map((s, i) => (i === index ? list : s)))
      } catch (err) {
        setSuggestions((prev) => prev.map((s, i) => (i === index ? [] : s)))
      }
    }, 300)
  }

  function selectProduct(index: number, product: any) {
    updateItem(index, { product_id: product.id, price: product.price ?? product.sale_price ?? 0 })
    setItemQueries((prev) => prev.map((v, i) => (i === index ? product.name : v)))
    setSuggestions((prev) => prev.map((s, i) => (i === index ? [] : s)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const payload = { user_id: userId, shipping_address: shipping, items }
      const res = await fetch("/api/admin/pedidos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      const json = await res.json()
      if (!res.ok) {
        setError(json?.error || "Error desconocido")
      } else {
        const id = json.id
        router.push(`/admin/pedidos/${id}`)
      }
    } catch (err: any) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-4">Crear nueva orden</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700">User ID (o email)</label>
            <input value={userId} onChange={(e) => setUserId(e.target.value)} className="mt-1 block w-full border border-gray-200 rounded p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Dirección de envío</label>
            <textarea value={shipping} onChange={(e) => setShipping(e.target.value)} className="mt-1 block w-full border border-gray-200 rounded p-2" />
          </div>

          <div>
            <h3 className="font-medium">Items</h3>
            <div className="space-y-3 mt-2">
              {items.map((it, idx) => (
                <div key={idx} className="relative grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <input
                      className="w-full border border-gray-200 rounded p-2"
                      placeholder="Buscar producto por nombre"
                      value={itemQueries[idx] ?? ""}
                      onChange={(e) => setQueryFor(idx, e.target.value)}
                    />
                    {suggestions[idx] && suggestions[idx].length > 0 && (
                      <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded mt-1 max-h-48 overflow-auto text-sm">
                        {suggestions[idx].map((p: any) => (
                          <li key={p.id} className="p-2 hover:bg-gray-50 cursor-pointer" onClick={() => selectProduct(idx, p)}>
                            <div className="font-medium">{p.name}</div>
                            <div className="text-xs text-gray-500">{p.category} — ${p.price?.toFixed?.() ?? p.price}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <input type="number" min={1} className="col-span-2 border border-gray-200 rounded p-2" value={it.quantity} onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })} />
                  <input type="number" step="0.01" className="col-span-3 border border-gray-200 rounded p-2" value={it.price} onChange={(e) => updateItem(idx, { price: Number(e.target.value) })} />
                  <div className="col-span-2 flex gap-2">
                    <Button type="button" variant="outline" onClick={() => removeItem(idx)}>Eliminar</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <Button type="button" onClick={addItem}>Agregar item</Button>
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Creando...' : 'Crear orden'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
