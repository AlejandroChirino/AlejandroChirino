"use client"

import React, { useEffect, useState, useRef } from "react"
import Button from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

// Small local debounce hook to avoid an extra dependency import
function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

type OrderRow = {
  id: string
  customer: string
  email?: string | null
  total: number
  status: string
  created_at: string
  coupon_code?: string | null
  total_discount?: number
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(false)
  const [updatingIds, setUpdatingIds] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [total, setTotal] = useState(0)

  // Filters
  const [status, setStatus] = useState("all")
  const [dateRange, setDateRange] = useState("all")
  const [coupon, setCoupon] = useState("")
  const [couponsList, setCouponsList] = useState<Array<any>>([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const couponMenuRef = useRef<HTMLDivElement | null>(null)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const debouncedCoupon = useDebounce(coupon, 300)
  const [minTotal, setMinTotal] = useState("")
  const [maxTotal, setMaxTotal] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortDir, setSortDir] = useState<"asc"|"desc">("desc")

  useEffect(() => {
    fetchOrders()
  }, [page, limit, status, dateRange, debouncedSearch, debouncedCoupon, minTotal, maxTotal, sortBy, sortDir])

  // Fetch available coupons for quick filter chips
  useEffect(() => {
    let mounted = true
    async function loadCoupons() {
      setLoadingCoupons(true)
      try {
        const res = await fetch('/api/admin/coupons')
        if (!res.ok) return
        const json = await res.json()
        if (!mounted) return
        setCouponsList((json && json.data) || [])
      } catch (err) {
        console.warn('Failed to load coupons for admin filter', err)
      } finally {
        if (mounted) setLoadingCoupons(false)
      }
    }
    loadCoupons()
    return () => { mounted = false }
  }, [])

  // close menu when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!couponMenuRef.current) return
      if (!couponMenuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [menuOpen])

  async function fetchOrders() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", String(limit))
      if (status) params.set("status", status)
      if (dateRange) params.set("dateRange", dateRange)
      if (debouncedSearch) params.set("search", debouncedSearch)
      if (debouncedCoupon) params.set("coupon", debouncedCoupon)
      if (minTotal) params.set("minTotal", minTotal)
      if (maxTotal) params.set("maxTotal", maxTotal)
      params.set("sortBy", sortBy)
      params.set("sortDir", sortDir)

      const res = await fetch(`/api/admin/pedidos?${params.toString()}`)

      // Safely parse response: some errors or 204 may return no JSON
      let json: any = null
      const contentType = res.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        try {
          json = await res.json()
        } catch (parseErr) {
          // If parsing fails, capture text for debugging
          console.warn("Failed to parse JSON from /api/admin/pedidos:", parseErr)
          try {
            const text = await res.text()
            console.warn("Response text:", text)
            json = { text }
          } catch (textErr) {
            console.warn("Failed to read response text:", textErr)
            json = null
          }
        }
      } else {
        // Non-JSON response (possibly an error page or empty body)
        try {
          const text = await res.text()
          json = { text }
        } catch (err) {
          json = null
        }
      }

      if (res.ok) {
        setOrders((json && json.orders) || [])
        setTotal((json && json.pagination && json.pagination.total) || 0)
        setErrorMessage(null)
      } else {
        const bodyText = json && (json.error || json.details || json.text) ? JSON.stringify(json) : String(json)
        console.warn("GET /api/admin/pedidos failed", { status: res.status, body: json })
        setOrders([])
        setTotal(0)
        setErrorMessage(`Error al obtener órdenes (status ${res.status}): ${bodyText}`)
      }
    } catch (err) {
      console.warn("Error fetching orders:", err)
      setErrorMessage(String(err))
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Administrar Órdenes</h1>
            <p className="text-gray-600 mt-1">Filtra, busca y gestiona las órdenes</p>
          </div>
          <div>
            <Button variant="primary" onClick={() => router.push('/admin/pedidos/nuevo')}>Añadir Nueva Orden</Button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-sm text-red-800">{errorMessage}</div>
        )}

        {/* Controls */}
        <div className="bg-white p-4 rounded-lg mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="block w-full border border-gray-200 rounded-md p-2">
                <option value="all">Todas</option>
                <option value="pending">Pendiente</option>
                <option value="processing">Confirmada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <select value={dateRange} onChange={(e) => { setDateRange(e.target.value); setPage(1) }} className="block w-full border border-gray-200 rounded-md p-2">
                <option value="all">Todas</option>
                <option value="today">Hoy</option>
                <option value="7">Últimos 7 días</option>
                <option value="30">Últimos 30 días</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <div className="relative">
                <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Nombre o email" className="block w-full border border-gray-200 rounded-md p-2 pr-10" />
                <div className="absolute right-2 top-2 text-gray-400">🔍</div>
              </div>
            </div>

            <div ref={couponMenuRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cupón</label>
              <div>
                <button
                  onClick={() => setMenuOpen((s) => !s)}
                  className="flex items-center gap-2 px-3 py-1 border rounded-md bg-white text-sm"
                >
                  <span>Filtrar por cupón</span>
                  {coupon ? <span className="text-xs text-gray-500">{coupon}</span> : null}
                </button>

                {menuOpen && (
                  <div className="absolute z-50 mt-2 w-72 bg-white border rounded shadow p-2 max-h-60 overflow-auto">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => { setCoupon(""); setPage(1); setMenuOpen(false) }}
                        className={`text-left text-sm px-2 py-1 rounded ${coupon === '' ? 'bg-gray-800 text-white' : 'hover:bg-gray-100'}`}
                      >Todos</button>
                      {loadingCoupons ? (
                        <div className="text-sm text-gray-500 px-2 py-1">Cargando...</div>
                      ) : (
                        couponsList.slice(0, 100).map((c) => (
                          <button
                            key={c.id}
                            onClick={() => { setCoupon(c.code); setPage(1); setMenuOpen(false) }}
                            title={c.description || ''}
                            className={`text-left text-sm px-2 py-1 rounded ${coupon === c.code ? 'bg-gray-800 text-white' : 'hover:bg-gray-100'}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{c.code}</span>
                            </div>
                            {c.description ? <div className="text-xs text-gray-500">{c.description}</div> : null}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto Total</label>
              <div className="flex gap-2">
                <input value={minTotal} onChange={(e) => { setMinTotal(e.target.value); setPage(1) }} placeholder="Mín" className="block w-1/2 border border-gray-200 rounded-md p-2" />
                <input value={maxTotal} onChange={(e) => { setMaxTotal(e.target.value); setPage(1) }} placeholder="Máx" className="block w-1/2 border border-gray-200 rounded-md p-2" />
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">Ordenar por:
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="ml-2 border border-gray-200 rounded-md p-1">
                <option value="created_at">Fecha</option>
                <option value="total">Monto</option>
                <option value="user_id">Cliente</option>
              </select>
              <button className="ml-2 p-1 border border-gray-200 rounded-md" onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}>{sortDir === 'asc' ? '↑' : '↓'}</button>
            </div>
            <div>
              <Button variant="outline" onClick={() => { setStatus('all'); setDateRange('all'); setSearch(''); setCoupon(''); setMinTotal(''); setMaxTotal(''); setPage(1) }}>Limpiar filtros</Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cupón usado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="p-6 text-center">Cargando...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="p-6 text-center">No se encontraron órdenes</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{o.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{o.customer}<div className="text-xs text-gray-400">{o.email}</div></td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <select
                          value={o.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value
                            // Optimistic UI
                            setOrders((prev) => prev.map(p => p.id === o.id ? { ...p, status: newStatus } : p))
                            setUpdatingIds((s) => [...s, o.id])
                            try {
                              const res = await fetch(`/api/admin/pedidos/${o.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: newStatus }),
                              })
                              if (!res.ok) {
                                const body = await res.json().catch(() => ({}))
                                console.warn("Failed to update status", body)
                                toast({ title: "Error", description: "No se pudo actualizar el estado", variant: "destructive" })
                                // revert
                                fetchOrders()
                              } else {
                                toast({ title: "Estado actualizado", description: `Orden ${o.id} ahora ${newStatus}` })
                              }
                            } catch (err) {
                              console.warn("Error updating status", err)
                              toast({ title: "Error", description: "No se pudo actualizar el estado", variant: "destructive" })
                              fetchOrders()
                            } finally {
                              setUpdatingIds((s) => s.filter(id => id !== o.id))
                            }
                          }}
                          disabled={updatingIds.includes(o.id)}
                          className="border border-gray-200 rounded-md p-1 text-sm"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="processing">Confirmada</option>
                          <option value="shipped">Enviada</option>
                          <option value="delivered">Entregada</option>
                          <option value="cancelled">Cancelada</option>
                        </select>
                        <span className={`px-2 py-1 rounded-full text-xs ${o.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : o.status === 'processing' ? 'bg-blue-100 text-blue-800' : o.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {o.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{o.coupon_code ? <span className="text-sm font-medium">{o.coupon_code}</span> : <span className="text-sm text-gray-400">—</span>}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      {(() => {
                        const before = Number(o.total || 0) + Number(o.total_discount || 0)
                        return <div className="text-sm">
                          <div className="text-xs text-gray-500">Antes: ${before.toFixed(2)}</div>
                          <div className="font-medium">Final: ${Number(o.total || 0).toFixed(2)}</div>
                        </div>
                      })()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{new Date(o.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/admin/pedidos/${o.id}`)}>Ver</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, total)} de {total} Órdenes</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>&lt; Anterior</Button>
            <div className="text-sm text-gray-600">Página {page} de {totalPages}</div>
            <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>Siguiente &gt;</Button>
          </div>
        </div>

      </div>
    </div>
  )
}
