"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Button from "@/components/ui/button"
import { Plus, Edit, Trash } from "lucide-react"

export default function AdminTendenciasPage() {
  const [trends, setTrends] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [productQuery, setProductQuery] = useState("")
  const [productResults, setProductResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const fetchTrends = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("trend_reports")
        .select("id, name, image_url, product_id, position, created_at")
        .order("position", { ascending: true })
        .limit(4)

      if (error) throw error
      setTrends(data || [])
    } catch (e) {
      console.error("Error fetching trend_reports:", e)
      setTrends([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTrends() }, [])

  const handleEdit = (t: any) => setEditing(t)

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar esta tendencia?")) return
    try {
      const { error } = await supabase.from("trend_reports").delete().eq("id", id)
      if (error) throw error
      fetchTrends()
    } catch (e) {
      console.error(e)
      alert("Error al eliminar")
    }
  }

  const handleNew = () => setEditing({ id: null, name: "", image_url: "", product_id: null, position: trends.length + 1 })

  const handleSave = async (ev?: React.FormEvent) => {
    ev?.preventDefault()
    if (!editing) return
    setSaving(true)
    try {
      const payload = {
        name: editing.name,
        image_url: editing.image_url || null,
        product_id: editing.product_id || null,
        position: editing.position || 0,
      }
      if (editing.id) {
        const { error } = await supabase.from("trend_reports").update(payload).eq("id", editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("trend_reports").insert(payload)
        if (error) throw error
      }
      setEditing(null)
      fetchTrends()
    } catch (e) {
      console.error(e)
      alert("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tendencias Destacadas</h1>
            <p className="text-sm text-gray-600">Gestiona las 4 casillas que aparecen en la home</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleNew} variant="primary">
              <Plus className="w-4 h-4 mr-2" /> Añadir
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <div className="grid grid-cols-6 gap-4 text-sm text-gray-500">
              <div>Pos</div>
              <div className="col-span-2">Nombre</div>
              <div>Producto</div>
              <div>Imagen</div>
              <div className="text-right">Acciones</div>
            </div>
          </div>
          <div>
            {loading ? (
              <div className="p-6 text-center">Cargando...</div>
            ) : trends.length === 0 ? (
              <div className="p-6 text-center">No hay tendencias</div>
            ) : (
              trends.map((t) => (
                <div key={t.id} className="p-4 border-b">
                  <div className="grid grid-cols-6 gap-4 items-center text-sm">
                    <div>{t.position}</div>
                    <div className="col-span-2 font-medium">{t.name}</div>
                    <div>{t.product_id ? (<a href={`/admin/productos/editar/${t.product_id}`} className="text-blue-600">Ver producto</a>) : <span className="text-gray-500">—</span>}</div>
                    <div>{t.image_url ? <img src={t.image_url} className="w-20 h-12 object-cover" alt={t.name} /> : <span className="text-gray-500">—</span>}</div>
                    <div className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(t)} className="mr-2"><Edit className="w-4 h-4" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(t.id)}><Trash className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
              <h3 className="text-lg font-medium mb-4">{editing.id ? "Editar" : "Nueva tendencia"}</h3>
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="text-sm">Nombre</label>
                  <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="text-sm">Image URL</label>
                  <input value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="text-sm">Buscar producto por nombre (opcional)</label>
                  <input
                    value={productQuery}
                    onChange={async (e) => {
                      const q = e.target.value
                      setProductQuery(q)
                      setProductResults([])
                      if (!q || q.length < 2) return
                      setSearching(true)
                      try {
                        const { data, error } = await supabase
                          .from("products")
                          .select("id, name, image_url")
                          .ilike("name", `%${q}%`)
                          .order("name", { ascending: true })
                        if (!error) setProductResults(data || [])
                      } catch (err) {
                        console.error(err)
                      } finally {
                        setSearching(false)
                      }
                    }}
                    placeholder="Escribe nombre del producto..."
                    className="w-full px-3 py-2 border rounded"
                  />

                  {productQuery && (
                    <div className="mt-2 max-h-40 overflow-auto border rounded">
                      {searching ? (
                        <div className="p-2 text-sm text-gray-500">Buscando...</div>
                      ) : productResults.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">Sin resultados</div>
                      ) : (
                        productResults.map((p) => (
                          <button
                            type="button"
                            key={p.id}
                            onClick={() => {
                              // Al seleccionar, rellenar solo product_id e image_url (no sobrescribir name)
                              setEditing({ ...editing, product_id: p.id, image_url: p.image_url || null })
                              setProductQuery("")
                              setProductResults([])
                            }}
                            className="w-full text-left p-2 hover:bg-gray-50 flex items-center gap-2"
                          >
                            {p.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.image_url} alt={p.name} className="w-10 h-8 object-cover rounded" />
                            ) : (
                              <div className="w-10 h-8 bg-gray-100 rounded" />
                            )}
                            <div className="text-sm">{p.name}</div>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  <div className="mt-2 text-sm text-gray-700">
                    Producto seleccionado: {editing.product_id ? (<span className="font-medium">{editing.product_id}</span>) : <span className="text-gray-500">ninguno</span>}
                  </div>
                </div>
                <div>
                  <label className="text-sm">Posición</label>
                  <input type="number" value={editing.position || 0} onChange={(e) => setEditing({ ...editing, position: Number(e.target.value) })} className="w-full px-3 py-2 border rounded" />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                  <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
