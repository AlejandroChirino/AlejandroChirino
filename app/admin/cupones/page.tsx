"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Edit } from "lucide-react"
import Button from "@/components/ui/button"

type Coupon = {
  id: string
  code: string
  type: "percent" | "amount" | "free_shipping" | "bogo"
  value?: number
  applies_to_categories?: string[]
  applies_to_subcategories?: string[]
  applies_to_tags?: string[]
  applies_to_brand?: string | null
  applies_to_products?: string[]
  // BOGO specifics
  buy_quantity?: number | null
  get_quantity?: number | null
  bogo_apply_to?: "same" | "cheapest" | "filtered" | null
  bogo_free_filters?: {
    categories?: string[]
    subcategories?: string[]
    tags?: string[]
    brand?: string | null
  } | null
  // Customer segmentation
  customer_filters?: {
    vip?: boolean | null
    tags?: string[]
    last_purchase_after?: string | null
    last_purchase_before?: string | null
    spent_amount?: number | null
    spent_period_days?: number | null
    orders_count?: number | null
    orders_period_days?: number | null
  }
  min_purchase?: number | null
  customers_applicable?: string // e.g. 'all' | 'new' | 'returning' | 'segment:students'
  start_at?: string | null
  end_at?: string | null
  limit_global?: number | null
  limit_per_customer?: number | null
  active: boolean
  created_at: string
}

const STORAGE_KEY = "lafashion_coupons_v1"

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const router = useRouter()

  // Form state
  const [code, setCode] = useState("")
  const [type, setType] = useState<Coupon["type"]>("percent")
  const [value, setValue] = useState<string>("")
  const [categories, setCategories] = useState<string>("")
  const [subcategories, setSubcategories] = useState<string>("")
  const [tags, setTags] = useState<string>("")
  const [brand, setBrand] = useState<string>("")
  const [products, setProducts] = useState<string>("")
  const [minPurchase, setMinPurchase] = useState<string>("")
  const [customersApplicable, setCustomersApplicable] = useState<string>("all")
  const [startAt, setStartAt] = useState<string>("")
  const [endAt, setEndAt] = useState<string>("")
  const [limitGlobal, setLimitGlobal] = useState<string>("")
  const [limitPerCustomer, setLimitPerCustomer] = useState<string>("")
  const [active, setActive] = useState(true)
  // BOGO state
  const [buyQuantity, setBuyQuantity] = useState<string>("")
  const [getQuantity, setGetQuantity] = useState<string>("")
  const [bogoApplyTo, setBogoApplyTo] = useState<string>("same")
  const [bogoFreeFiltersCategories, setBogoFreeFiltersCategories] = useState<string>("")
  const [bogoFreeFiltersSubcategories, setBogoFreeFiltersSubcategories] = useState<string>("")
  const [bogoFreeFiltersTags, setBogoFreeFiltersTags] = useState<string>("")
  const [bogoFreeFiltersBrand, setBogoFreeFiltersBrand] = useState<string>("")
  const [bogoRequireStock, setBogoRequireStock] = useState<boolean>(true)
  // Customer filters state
  const [customerVip, setCustomerVip] = useState<string>("any")
  const [customerTags, setCustomerTags] = useState<string>("")
  const [lastPurchaseAfter, setLastPurchaseAfter] = useState<string>("")
  const [lastPurchaseBefore, setLastPurchaseBefore] = useState<string>("")
  const [spentAmount, setSpentAmount] = useState<string>("")
  const [spentPeriodDays, setSpentPeriodDays] = useState<string>("")
  const [ordersCount, setOrdersCount] = useState<string>("")
  const [ordersPeriodDays, setOrdersPeriodDays] = useState<string>("")

  useEffect(() => {
    let mounted = true
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return
        const list = json?.data || []
        setCoupons(list)
      })
      .catch((err) => {
        console.error("failed to fetch coupons", err)
        setCoupons([])
      })
    return () => {
      mounted = false
    }
  }, [])

  const saveLocal = (next: Coupon[]) => {
    // keep local state in sync; persistent storage handled by API
    setCoupons(next)
  }

  const openCreate = () => {
    router.push("/admin/cupones/nuevo")
  }

  const openEdit = (c: Coupon) => {
    router.push(`/admin/cupones/editar/${c.id}`)
  }

  const removeCoupon = (id: string) => {
    if (!confirm("¿Eliminar cupón?")) return
    fetch(`/api/admin/coupons/${id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then((json) => {
        if (json?.error) throw new Error(json.error)
        const next = coupons.filter((c) => c.id !== id)
        saveLocal(next)
      })
      .catch((err) => {
        console.error("failed to delete coupon", err)
        alert("No se pudo eliminar el cupón")
      })
  }

  const submit = () => {
    if (!code) return alert("El código es obligatorio")
    if (type !== "free_shipping" && (!value || Number(value) <= 0)) return alert("El valor debe ser mayor a 0")

    const coupon: Coupon = {
      id: editing ? editing.id : `${Date.now()}`,
      code: code.trim().toUpperCase(),
      type,
      value: value ? Number(value) : undefined,
      applies_to_categories: categories ? categories.split(",").map((s) => s.trim()) : [],
      applies_to_subcategories: subcategories ? subcategories.split(",").map((s) => s.trim()) : [],
      applies_to_tags: tags ? tags.split(",").map((s) => s.trim()) : [],
      applies_to_brand: brand || null,
      applies_to_products: products ? products.split(",").map((s) => s.trim()) : [],
      // BOGO
      buy_quantity: buyQuantity ? Number(buyQuantity) : null,
      get_quantity: getQuantity ? Number(getQuantity) : null,
      bogo_apply_to: bogoApplyTo as any,
      bogo_free_filters: {
        categories: bogoFreeFiltersCategories ? bogoFreeFiltersCategories.split(",").map((s) => s.trim()) : [],
        subcategories: bogoFreeFiltersSubcategories ? bogoFreeFiltersSubcategories.split(",").map((s) => s.trim()) : [],
        tags: bogoFreeFiltersTags ? bogoFreeFiltersTags.split(",").map((s) => s.trim()) : [],
        brand: bogoFreeFiltersBrand || null,
      },
      // Customer filters
      customer_filters: {
        vip: customerVip === "any" ? null : customerVip === "yes",
        tags: customerTags ? customerTags.split(",").map((s) => s.trim()) : [],
        last_purchase_after: lastPurchaseAfter || null,
        last_purchase_before: lastPurchaseBefore || null,
        spent_amount: spentAmount ? Number(spentAmount) : null,
        spent_period_days: spentPeriodDays ? Number(spentPeriodDays) : null,
        orders_count: ordersCount ? Number(ordersCount) : null,
        orders_period_days: ordersPeriodDays ? Number(ordersPeriodDays) : null,
      },
      min_purchase: minPurchase ? Number(minPurchase) : null,
      customers_applicable: customersApplicable,
      start_at: startAt || null,
      end_at: endAt || null,
      limit_global: limitGlobal ? Number(limitGlobal) : null,
      limit_per_customer: limitPerCustomer ? Number(limitPerCustomer) : null,
      active,
      created_at: new Date().toISOString(),
    }

    if (editing) {
      const next = coupons.map((c) => (c.id === editing.id ? coupon : c))
      saveLocal(next)
    } else {
      saveLocal([coupon, ...coupons])
    }

    setShowModal(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Descuentos</h1>
            <p className="text-gray-600">Gestión de cupones y promociones</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" /> Crear cupón
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {coupons.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No hay cupones creados. Crea uno nuevo para empezar.</p>
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" /> Crear cupón
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs text-gray-500">Código</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-500">Tipo</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-500">Valor</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-500">Vigencia</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-500">Límites</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-500">Activo</th>
                    <th className="px-4 py-2 text-right text-xs text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {coupons.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-medium">{c.code}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.type === "percent" ? `${c.value}%` : c.type === "amount" ? `$${c.value}` : c.type === "free_shipping" ? "Envío gratis" : `BOGO (${c.value})`}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.start_at ? new Date(c.start_at).toLocaleDateString() : "-"} — {c.end_at ? new Date(c.end_at).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.limit_global ?? "-"} / {c.limit_per_customer ?? "-"}</td>
                      <td className="px-4 py-3 text-sm">{c.active ? "Sí" : "No"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => removeCoupon(c.id)} className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/edit moved to separate pages */}
      </div>
    </div>
  )
}
