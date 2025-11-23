"use client"

import React, { useEffect, useState } from "react"
import Button from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

type Cliente = {
  id: string
  full_name: string
  email: string
  is_vip?: boolean
  tags?: string[]
  total_spent?: number
  last_order_at?: string | null
  birthday?: string | null
}

const SAMPLE_CLIENTS: Cliente[] = [
  { id: "c1", full_name: "Alejandro Chirino", email: "alejandro@example.com", is_vip: true, tags: ["mayoristas"], total_spent: 12500, last_order_at: new Date().toISOString(), birthday: "1990-11-26" },
  { id: "c2", full_name: "María Pérez", email: "maria@example.com", is_vip: false, tags: ["newsletter"], total_spent: 5200, last_order_at: new Date().toISOString(), birthday: "1988-11-28" },
  { id: "c3", full_name: "Juan López", email: "juan@example.com", is_vip: false, tags: [], total_spent: 2400, last_order_at: null, birthday: null },
]

export default function AdminClientesPage() {
  const [clients, setClients] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null)
  // Filters
  const [vipFilter, setVipFilter] = useState<'any'|'yes'|'no'>('any')
  const [tagFilter, setTagFilter] = useState<string>('')
  const [minTotalFilter, setMinTotalFilter] = useState<string>('')
  const [lastOrderDays, setLastOrderDays] = useState<string>('')

  // Ranking filters
  const [rankingRange, setRankingRange] = useState<"day"|"week"|"month"|"year">("month")

  useEffect(() => {
    loadClients()
    loadRanking(rankingRange)
    loadUpcoming(5)
  }, [])

  async function loadClients(pageArg: number = page) {
    setLoading(true)
    try {
      // Fetch from API with pagination, search and filters
      const params = new URLSearchParams()
      params.set('page', String(pageArg))
      params.set('pageSize', String(pageSize))
      if (search.trim()) params.set('q', search.trim())
      if (vipFilter && vipFilter !== 'any') params.set('vip', vipFilter)
      if (tagFilter.trim()) params.set('tag', tagFilter.trim())
      if (minTotalFilter.trim()) params.set('minTotal', minTotalFilter.trim())
      if (lastOrderDays.trim()) params.set('lastOrderDays', lastOrderDays.trim())
      const res = await fetch(`/api/admin/clientes?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setClients((json && json.clients) || [])
        const totalFromResp = (json && (json.total || json.count)) || (json && json.pagination && json.pagination.total) || 0
        setTotal(totalFromResp)
        setPage(pageArg)
      } else {
        setClients(SAMPLE_CLIENTS)
        setTotal(SAMPLE_CLIENTS.length)
      }
    } catch (err) {
      setClients(SAMPLE_CLIENTS)
    } finally {
      setLoading(false)
    }
  }

  // If server-side search is used, `clients` is already filtered; keep client-side fallback
  function filtered() {
    const q = search.trim().toLowerCase()
    if (!q) return clients
    return clients.filter(c => (c.full_name || "").toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q) || (c.tags || []).some(t => t.toLowerCase().includes(q)))
  }

  async function toggleVip(id: string) {
    const client = clients.find(c => c.id === id)
    if (!client) return
    const newVal = !client.is_vip
    // Optimistic UI
    setClients(prev => prev.map(c => c.id === id ? { ...c, is_vip: newVal } : c))
    try {
      const res = await fetch(`/api/admin/clientes/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_vip: newVal }) })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        console.warn('Failed updating VIP', body)
        toast({ title: 'Error', description: 'No se pudo actualizar VIP', variant: 'destructive' })
        loadClients()
      } else {
        toast({ title: 'VIP actualizado', description: 'Estado VIP guardado.' })
      }
    } catch (err) {
      console.warn('Error updating VIP', err)
      toast({ title: 'Error', description: 'No se pudo actualizar VIP', variant: 'destructive' })
      loadClients()
    }
  }

  // Load full client details and open modal
  async function viewClient(id: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/clientes/${id}`)
      if (!res.ok) {
        toast({ title: 'Error', description: 'No se pudieron cargar los datos del cliente', variant: 'destructive' })
        return
      }
      const json = await res.json()
      // profile contains full profile, plus orders and addresses
      const profile = json.profile || json
      const combined: any = { ...profile }
      if (json.orders) combined.orders = json.orders
      if (json.addresses) combined.addresses = json.addresses
      // set selected client to the detailed object
      setSelectedClient(combined)
    } catch (err) {
      console.warn('Error loading client details', err)
      toast({ title: 'Error', description: 'No se pudieron cargar los datos del cliente', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function addTag(id: string, tag: string) {
    const client = clients.find(c => c.id === id)
    if (!client) return
    const newTags = Array.from(new Set([...(client.tags||[]), tag]))
    setClients(prev => prev.map(c => c.id === id ? { ...c, tags: newTags } : c))
    try {
      const res = await fetch(`/api/admin/clientes/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tags: newTags }) })
      if (!res.ok) {
        toast({ title: 'Error', description: 'No se pudo guardar etiqueta', variant: 'destructive' })
        loadClients()
      } else {
        toast({ title: 'Etiqueta agregada', description: `Etiqueta '${tag}' guardada.` })
      }
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudo guardar etiqueta', variant: 'destructive' })
      loadClients()
    }
  }

  async function removeTag(id: string, tag: string) {
    const client = clients.find(c => c.id === id)
    if (!client) return
    const newTags = (client.tags || []).filter(t => t !== tag)
    setClients(prev => prev.map(c => c.id === id ? { ...c, tags: newTags } : c))
    try {
      const res = await fetch(`/api/admin/clientes/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tags: newTags }) })
      if (!res.ok) {
        toast({ title: 'Error', description: 'No se pudo eliminar etiqueta', variant: 'destructive' })
        loadClients()
      } else {
        toast({ title: 'Etiqueta eliminada', description: `Etiqueta '${tag}' eliminada.` })
      }
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudo eliminar etiqueta', variant: 'destructive' })
      loadClients()
    }
  }

  // Derived data: ranking and upcoming birthdays
  const [ranking, setRanking] = useState<{ totalRanking: any[]; singleOrderRanking: any[] } | null>(null)
  const [upcoming, setUpcoming] = useState<any[]>([])

  async function loadRanking(range: 'day'|'week'|'month'|'year' = 'month') {
    try {
      const res = await fetch(`/api/admin/clientes/ranking?range=${range}`)
      if (res.ok) {
        const json = await res.json()
        setRanking(json)
      }
    } catch (err) {
      console.warn('Error loading ranking', err)
    }
  }

  async function loadUpcoming(days = 5) {
    try {
      const res = await fetch(`/api/admin/clientes/upcoming-birthdays?days=${days}`)
      if (res.ok) {
        const json = await res.json()
        setUpcoming((json && json.upcoming) || [])
      }
    } catch (err) {
      console.warn('Error loading upcoming birthdays', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestionar Clientes</h1>
            <p className="text-gray-600 mt-1">Ver, etiquetar y marcar VIP a tus clientes</p>
          </div>
          <div>
            <Button variant="primary" onClick={() => loadClients(1)}>Refrescar</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white p-4 rounded-lg shadow">
            <div className="mb-4 flex items-center gap-2">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, email o etiqueta" className="flex-1 border border-gray-200 rounded-md p-2" />
              <Button variant="primary" onClick={() => loadClients(1)}>Buscar</Button>
              <Button variant="outline" onClick={() => { setSearch(""); setVipFilter('any'); setTagFilter(''); setMinTotalFilter(''); setLastOrderDays(''); loadClients(1) }}>Limpiar</Button>
            </div>

            {/* Filters row */}
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">VIP</label>
                <select value={vipFilter} onChange={(e) => setVipFilter(e.target.value as any)} className="w-full border border-gray-200 rounded-md p-2 text-sm">
                  <option value="any">Todos</option>
                  <option value="yes">Solo VIP</option>
                  <option value="no">No VIP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Etiqueta</label>
                <input value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} placeholder="ej: mayoristas" className="w-full border border-gray-200 rounded-md p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Total mínimo</label>
                <input value={minTotalFilter} onChange={(e) => setMinTotalFilter(e.target.value)} placeholder="0" type="number" className="w-full border border-gray-200 rounded-md p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Último pedido</label>
                <select value={lastOrderDays} onChange={(e) => setLastOrderDays(e.target.value)} className="w-full border border-gray-200 rounded-md p-2 text-sm">
                  <option value="">Cualquiera</option>
                  <option value="7">Últimos 7 días</option>
                  <option value="30">Últimos 30 días</option>
                  <option value="90">Últimos 90 días</option>
                  <option value="365">Último año</option>
                </select>
              </div>
            </div>
            <div className="mb-4 flex items-center gap-2">
              <Button variant="primary" onClick={() => loadClients(1)}>Aplicar filtros</Button>
              <Button variant="outline" onClick={() => { setVipFilter('any'); setTagFilter(''); setMinTotalFilter(''); setLastOrderDays(''); }}>Restablecer filtros</Button>
              <div className="text-sm text-gray-500 ml-auto">Recuerda: presiona "Aplicar filtros" para ejecutar la búsqueda</div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">VIP</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Etiquetas</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Último pedido</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan={7} className="p-6 text-center">Cargando...</td></tr>
                  ) : clients.length === 0 ? (
                    <tr><td colSpan={7} className="p-6 text-center">No hay clientes</td></tr>
                  ) : (
                    clients.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{c.full_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{c.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <label className="inline-flex items-center">
                            <input type="checkbox" checked={!!c.is_vip} onChange={() => toggleVip(c.id)} className="form-checkbox h-4 w-4 text-indigo-600" />
                            <span className="ml-2 text-sm">VIP</span>
                          </label>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="flex items-center gap-2 flex-wrap">
                            {(c.tags || []).map(t => (
                              <span key={t} className="px-2 py-1 bg-gray-100 text-xs rounded-full flex items-center gap-1">
                                {t}
                                <button onClick={() => removeTag(c.id, t)} className="ml-1 text-red-500">×</button>
                              </span>
                            ))}
                            <InlineTagEditor onAdd={(tag) => addTag(c.id, tag)} />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">{(c.total_spent||0).toLocaleString()} CUP</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{c.last_order_at ? new Date(c.last_order_at).toLocaleString() : '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => viewClient(c.id)}>Ver</Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination controls */}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {total === 0 ? 'Sin resultados' : `Mostrando ${(page-1)*pageSize + 1} - ${Math.min(page*pageSize, total)} de ${total}`}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => { if (page > 1) loadClients(page-1) }} disabled={page <= 1}>Anterior</Button>
                <div className="text-sm">Página {page}</div>
                <Button size="sm" variant="outline" onClick={() => { if (page * pageSize < total) loadClients(page+1) }} disabled={page * pageSize >= total}>Siguiente</Button>
              </div>
            </div>
          </div>

          <aside className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Ranking - Top clientes</h3>
            <div className="mb-3">
              <label className="text-sm text-gray-600 mr-2">Rango</label>
              <select value={rankingRange} onChange={(e) => { setRankingRange(e.target.value as any); loadRanking(e.target.value as any) }} className="border border-gray-200 rounded-md p-1 text-sm">
                <option value="day">Día</option>
                <option value="week">Semana</option>
                <option value="month">Mes</option>
                <option value="year">Año</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h5 className="text-sm font-medium mb-2">Top 10 por total</h5>
                <div className="space-y-2">
                  {(ranking?.totalRanking || []).map((c, i) => (
                    <div key={c.id} className="flex items-center justify-between">
                      <div className="text-sm">
                        <div className="font-medium">{i+1}. {c.full_name}</div>
                        <div className="text-xs text-gray-500">{c.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold">{(c.total_spent||0).toLocaleString()}</div>
                        <Button size="sm" variant="outline" onClick={() => viewClient(c.id)}>Ver</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium mb-2">Top 10 mayor orden</h5>
                <div className="space-y-2">
                  {(ranking?.singleOrderRanking || []).map((c, i) => (
                    <div key={c.id} className="flex items-center justify-between">
                      <div className="text-sm">
                        <div className="font-medium">{i+1}. {c.full_name}</div>
                        <div className="text-xs text-gray-500">{c.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold">{(c.largest_order||0).toLocaleString()}</div>
                        <Button size="sm" variant="outline" onClick={() => viewClient(c.id)}>Ver</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <hr className="my-4" />

            <h4 className="text-md font-medium mb-2">Cumpleaños próximos (5 días)</h4>
            <div className="space-y-2">
              { (upcoming.length === 0) ? (
                <div className="text-sm text-gray-500">No hay cumpleaños en los próximos 5 días</div>
              ) : upcoming.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{c.full_name}</div>
                    <div className="text-xs text-gray-500">{c.birthdate || c.birthday || ''}</div>
                  </div>
                  <div>
                    <Button size="sm" variant="outline" onClick={() => viewClient(c.id)}>Ver</Button>
                  </div>
                </div>
              ))}
            </div>

            <hr className="my-4" />
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => {
                // placeholder for export
                toast({ title: "Exportar", description: "Funcionalidad de exportar se añadirá posteriormente" })
              }}>Exportar ranking (CSV)</Button>
              <Button variant="ghost" onClick={() => toast({ title: "Notas", description: "Aquí podrás añadir notas por cliente" })}>Notas por cliente</Button>
            </div>
          </aside>
        </div>

        {/* Modal / drawer simple */}
        {selectedClient && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white w-full max-w-3xl p-6 rounded-lg overflow-auto max-h-[80vh]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">{selectedClient.full_name || selectedClient.email}</h3>
                <button onClick={() => setSelectedClient(null)} className="text-gray-500">Cerrar</button>
              </div>
              <div className="space-y-3">
                <div><strong>ID:</strong> {selectedClient.id}</div>
                <div><strong>Email:</strong> {selectedClient.email}</div>
                <div><strong>Teléfono:</strong> {selectedClient.phone || '-'}</div>
                <div><strong>VIP:</strong> {selectedClient.is_vip ? 'Sí' : 'No'}</div>
                <div><strong>Etiquetas:</strong> {(selectedClient.tags||[]).join(', ') || '-'}</div>
                <div><strong>Birthdate:</strong> {selectedClient.birthdate || '-'}</div>
                <div><strong>Creado en:</strong> {selectedClient.created_at ? new Date(selectedClient.created_at).toLocaleString() : '-'}</div>

                {selectedClient.addresses && (
                  <div>
                    <h4 className="font-medium mt-3">Direcciones</h4>
                    <div className="space-y-2">
                      {selectedClient.addresses.map((a: any) => (
                        <div key={a.id} className="text-sm">
                          <div>{a.full_name || a.name} — {a.line1}{a.line2 ? `, ${a.line2}` : ''}</div>
                          <div className="text-xs text-gray-500">{a.city}, {a.state} {a.postal_code} — {a.country}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedClient.orders && (
                  <div>
                    <h4 className="font-medium mt-3">Pedidos recientes</h4>
                    <div className="space-y-2">
                      {selectedClient.orders.map((o: any) => (
                        <div key={o.id} className="text-sm flex items-center justify-between">
                          <div>
                            <div className="font-medium">Pedido {o.id}</div>
                            <div className="text-xs text-gray-500">{o.created_at ? new Date(o.created_at).toLocaleString() : ''} — {o.status}</div>
                          </div>
                          <div className="font-semibold">{(o.total||0).toLocaleString()} CUP</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InlineTagEditor({ onAdd }: { onAdd: (tag: string) => void }) {
  const [val, setVal] = useState("")
  return (
    <div className="flex items-center">
      <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="añadir etiqueta" className="border border-gray-200 rounded-md p-1 text-xs" />
      <button onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal("") } }} className="ml-2 text-sm text-blue-600">Agregar</button>
    </div>
  )
}
