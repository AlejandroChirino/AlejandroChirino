"use client"

import { useEffect, useState } from "react"
import { SUBCATEGORIAS, type ProductCategory } from "@/lib/types"
import { ChevronDown } from "lucide-react"

type Pref = { id: string; category: string; subcategory: string; sizes: string[] }

export default function TallasClient() {
  const categories: ProductCategory[] = ["mujer", "hombre", "accesorios"]

  const [prefs, setPrefs] = useState<Record<string, Pref | null>>({})
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<string | null>(null) // key = `${cat}||${sub}`
  const [availableSizes, setAvailableSizes] = useState<Record<string, string[]>>({})
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])

  useEffect(() => {
    fetchPrefs()
  }, [])

  async function fetchPrefs() {
    setLoading(true)
    try {
      const res = await fetch(`/api/size-preferences`)
      if (!res.ok) return
      const data = await res.json()
      const map: Record<string, Pref> = {}
      ;(data || []).forEach((p: any) => {
        const key = `${p.category}||${p.subcategory}`
        map[key] = p
      })
      setPrefs(map)
    } catch (e) {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  function keyFor(cat: string, sub: string) {
    return `${cat}||${sub}`
  }

  async function openEditor(cat: string, sub: string) {
    const key = keyFor(cat, sub)
    setEditing(key)
    const existing = prefs[key]
    setSelectedSizes(existing?.sizes ?? [])
    // fetch available sizes for this subcategory if not present
    if (!availableSizes[key]) {
      try {
        const q = new URLSearchParams({ category: cat, subcategoria: sub })
        const res = await fetch(`/api/admin/options?${q.toString()}`)
        if (!res.ok) return
        const json = await res.json()
        setAvailableSizes((s) => ({ ...s, [key]: json.sizes || [] }))
      } catch (e) {
        setAvailableSizes((s) => ({ ...s, [key]: [] }))
      }
    }
  }

  function toggleSize(s: string) {
    setSelectedSizes((prev) => {
      if (prev.includes(s)) return prev.filter((x) => x !== s)
      if (prev.length >= 3) return prev // respect max 3
      return [...prev, s]
    })
  }

  async function savePref(cat: string, sub: string) {
    const key = keyFor(cat, sub)
    try {
      const res = await fetch(`/api/size-preferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat, subcategory: sub, sizes: selectedSizes }),
      })
      if (!res.ok) throw new Error("save failed")
      const json = await res.json()
      setPrefs((p) => ({ ...p, [key]: json }))
      setEditing(null)
    } catch (e) {
      // TODO: show toast
      console.error(e)
    }
  }

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  function toggleCategory(cat: string) {
    setExpanded((e) => ({ ...e, [cat]: !e[cat] }))
  }

  return (
    <div className="space-y-6">
      {loading && <p className="text-sm text-gray-500">Cargando preferencias...</p>}

      {categories.map((cat) => (
        <section key={cat} className="p-0">
          <div className="flex items-center justify-between py-6">
            <div className="text-sm font-bold uppercase text-gray-900">{cat}</div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-700">Seleccionar categorías</div>
              <button onClick={() => toggleCategory(cat)} className="p-2 -mr-2">
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${expanded[cat] ? "rotate-180" : "rotate-0"}`} />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {expanded[cat] ? (
            <div className="pt-3">
              <div className="divide-y divide-gray-100">
                {(SUBCATEGORIAS[cat] || []).filter(s => s !== "Ver todo").map((sub) => {
                  const key = keyFor(cat, sub)
                  const pref = prefs[key]
                  return (
                    <div key={sub}>
                      <div
                        className="py-4 flex items-center justify-between cursor-pointer"
                        onClick={() => {
                          const k = keyFor(cat, sub)
                          // toggle editing on click of the whole row
                          if (editing === k) {
                            setEditing(null)
                          } else {
                            openEditor(cat, sub)
                          }
                        }}
                      >
                        <div>
                          <div className="text-sm font-bold text-gray-900">{sub}</div>
                          <div className="mt-1 text-sm text-gray-500 font-light">{(pref && pref.sizes.length > 0) ? pref.sizes.join(", ") : <span className="text-gray-400">Sin preferencias</span>}</div>
                        </div>
                        <div className="text-sm text-gray-300">{/* chevron handled at category level */}</div>
                      </div>

                      {editing === key ? (
                        <div className="w-full mt-2 pl-4">
                          <div className="flex flex-wrap gap-2">
                            {(availableSizes[key] || []).length === 0 && <div className="text-sm text-gray-500">No hay tallas disponibles</div>}
                            {(availableSizes[key] || []).map((s) => (
                              <button key={s} onClick={() => toggleSize(s)} className={`px-3 py-1 rounded-md text-sm ${selectedSizes.includes(s) ? "bg-accent-orange text-white" : "bg-white border border-gray-200 text-gray-700"}`}>
                                {s}
                              </button>
                            ))}
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button onClick={() => setEditing(null)} className="px-3 py-2 rounded-md text-sm text-gray-600">Cancelar</button>
                            <button onClick={() => savePref(cat, sub)} className="px-3 py-2 rounded-md bg-accent-orange text-white text-sm">Guardar</button>
                          </div>
                          <p className="mt-2 text-sm text-gray-500">Puedes seleccionar hasta 3 tallas.</p>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}
        </section>
      ))}
    </div>
  )
}
