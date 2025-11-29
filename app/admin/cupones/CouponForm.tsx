"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/button"

type Coupon = {
  id?: string
  code: string
  type: "percent" | "amount" | "free_shipping" | "bogo"
  value?: number
  applies_to_categories?: string[]
  applies_to_subcategories?: string[]
  applies_to_tags?: string[]
  applies_to_brand?: string | null
  applies_to_products?: string[]
  buy_quantity?: number | null
  get_quantity?: number | null
  bogo_apply_to?: "same" | "cheapest" | "filtered" | null
  bogo_free_filters?: {
    categories?: string[]
    subcategories?: string[]
    tags?: string[]
    brand?: string | null
  } | null
  customer_filters?: any
  min_purchase?: number | null
  customers_applicable?: string
  start_at?: string | null
  end_at?: string | null
  limit_global?: number | null
  limit_per_customer?: number | null
  active: boolean
}

const STORAGE_KEY = "lafashion_coupons_v1"

export default function CouponForm({ initial, onSaved }: { initial?: Coupon | null; onSaved?: (c: Coupon) => void }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState(initial?.code ?? "")
  const [type, setType] = useState<Coupon["type"]>(initial?.type ?? "percent")
  const [value, setValue] = useState<string>(initial?.value?.toString() || "")
  const [categories, setCategories] = useState<string[]>(initial?.applies_to_categories || [])
  const [subcategories, setSubcategories] = useState<string[]>(initial?.applies_to_subcategories || [])
  const [tags, setTags] = useState<string[]>(initial?.applies_to_tags || [])
  const [brand, setBrand] = useState<string>(initial?.applies_to_brand || "")
  const [products, setProducts] = useState<string[]>(initial?.applies_to_products || [])
  const [minPurchase, setMinPurchase] = useState<string>(initial?.min_purchase?.toString() || "")
  const [customersApplicable, setCustomersApplicable] = useState<string>(initial?.customers_applicable || "all")
  const [customerVip, setCustomerVip] = useState<string>(
    initial?.customer_filters?.vip === undefined || initial?.customer_filters?.vip === null
      ? "any"
      : initial.customer_filters.vip
      ? "yes"
      : "no"
  )
  const [customerTags, setCustomerTags] = useState<string>(initial?.customer_filters?.tags ? (initial.customer_filters.tags as string[]).join(",") : "")
  const [startAt, setStartAt] = useState<string>(initial?.start_at || "")
  const [endAt, setEndAt] = useState<string>(initial?.end_at || "")
  const [limitGlobal, setLimitGlobal] = useState<string>(initial?.limit_global?.toString() || "")
  const [limitPerCustomer, setLimitPerCustomer] = useState<string>(initial?.limit_per_customer?.toString() || "")
  const [active, setActive] = useState(initial?.active ?? true)
  // BOGO state
  const [buyQuantity, setBuyQuantity] = useState<string>("")
  const [getQuantity, setGetQuantity] = useState<string>("")
  const [bogoApplyTo, setBogoApplyTo] = useState<string>("same")
  const [bogoFreeFiltersCategories, setBogoFreeFiltersCategories] = useState<string>("")
  const [bogoFreeFiltersSubcategories, setBogoFreeFiltersSubcategories] = useState<string>("")
  const [bogoFreeFiltersTags, setBogoFreeFiltersTags] = useState<string>("")
  const [bogoFreeFiltersBrand, setBogoFreeFiltersBrand] = useState<string>("")
  const [bogoRequireStock, setBogoRequireStock] = useState<boolean>(true)

  useEffect(() => {
    if (!initial) return
    setCode(initial.code)
    setType(initial.type)
    setValue(initial.value?.toString() || "")
    setCategories(initial.applies_to_categories || [])
    setSubcategories(initial.applies_to_subcategories || [])
    setTags(initial.applies_to_tags || [])
    setBrand(initial.applies_to_brand || "")
    setProducts(initial.applies_to_products || [])
    setMinPurchase((initial.min_purchase ?? "") as any)
    setCustomersApplicable(initial.customers_applicable || "all")
    setStartAt(initial.start_at || "")
    setEndAt(initial.end_at || "")
    setLimitGlobal((initial.limit_global ?? "") as any)
    setLimitPerCustomer((initial.limit_per_customer ?? "") as any)
    setActive(initial.active)
    setCustomerVip(initial.customer_filters?.vip === undefined || initial.customer_filters?.vip === null ? 'any' : initial.customer_filters.vip ? 'yes' : 'no')
    setCustomerTags(initial.customer_filters?.tags ? (initial.customer_filters.tags as string[]).join(',') : '')
    setBuyQuantity((initial.buy_quantity ?? "") as any)
    setGetQuantity((initial.get_quantity ?? "") as any)
    setBogoApplyTo(initial.bogo_apply_to || "same")
    setBogoFreeFiltersCategories((initial.bogo_free_filters?.categories || []).join(","))
    setBogoFreeFiltersSubcategories((initial.bogo_free_filters?.subcategories || []).join(","))
    setBogoFreeFiltersTags((initial.bogo_free_filters?.tags || []).join(","))
    setBogoFreeFiltersBrand(initial.bogo_free_filters?.brand || "")
    setBogoRequireStock(Boolean(initial.bogo_free_filters))
  }, [initial])

  // Simulated DB data (replace with real fetch to API/DB later)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([])
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState<Record<string, string[]>>({})
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [availableProducts, setAvailableProducts] = useState<{ id: string; title: string }[]>([])

  useEffect(() => {
    // Cargar metadata desde API; si falla, caer a datos simulados
    let mounted = true
    fetch('/api/admin/meta')
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return
        if (json && !json.error) {
          setAvailableCategories(json.categories || [])
          setAvailableSubcategories(json.subcategories || [])
          setAvailableTags(json.tags || [])
          setAvailableBrands(json.brands || [])
          setAvailableProducts(json.products || [])
          setSubcategoriesByCategory(json.subcategoriesByCategory || {})
        } else {
          // fallback
          setAvailableCategories(["hombre", "mujer", "accesorios", "niños"])
          setAvailableSubcategories(["camisetas", "pantalones", "zapatos", "chaquetas"])
          setAvailableTags(["nuevo", "rebajas", "verano", "edicion-limitada"])
          setAvailableBrands(["Nike", "Adidas", "LaFashion", "Zara"])
          setAvailableProducts([
            { id: "p_1", title: "Camiseta básica" },
            { id: "p_2", title: "Pantalón chino" },
            { id: "p_3", title: "Zapatillas blancas" },
            { id: "p_4", title: "Chaqueta de cuero" },
          ])
        }
      })
      .catch(() => {
        if (!mounted) return
        setAvailableCategories(["hombre", "mujer", "accesorios", "niños"])
        setAvailableSubcategories(["camisetas", "pantalones", "zapatos", "chaquetas"])
        setAvailableTags(["nuevo", "rebajas", "verano", "edicion-limitada"])
        setAvailableBrands(["Nike", "Adidas", "LaFashion", "Zara"])
        setAvailableProducts([
          { id: "p_1", title: "Camiseta básica" },
          { id: "p_2", title: "Pantalón chino" },
          { id: "p_3", title: "Zapatillas blancas" },
          { id: "p_4", title: "Chaqueta de cuero" },
        ])
      })

    return () => {
      mounted = false
    }
  }, [])

  // Derived: subcategories filtered by selected categories
  const [filteredSubcategories, setFilteredSubcategories] = useState<string[]>([])

  useEffect(() => {
    // If no categories selected, show all available subcategories
    if (!categories || categories.length === 0) {
      setFilteredSubcategories(availableSubcategories)
      return
    }
    // Use server-provided mapping subcategoriesByCategory
    const selectedSet = new Set(categories.map((c) => (c || "").toString()))
    const nextSet = new Set<string>()
    for (const cat of selectedSet) {
      const subs = subcategoriesByCategory[cat] || []
      subs.forEach((s) => nextSet.add(s))
    }
    const next = availableSubcategories.filter((s) => nextSet.has(s))
    setFilteredSubcategories(next)
  }, [categories, availableSubcategories])

  // Helpers para toggles multi-select
  const toggleValue = (arr: string[], set: (v: string[]) => void, value: string) => {
    if (arr.includes(value)) set(arr.filter((a) => a !== value))
    else set([...arr, value])
  }

  const submit = () => {
    if (!code) return alert("El código es obligatorio")
    if (type !== "free_shipping" && (!value || Number(value) <= 0)) return alert("El valor debe ser mayor a 0")

    const coupon: Coupon = {
      id: initial?.id ?? undefined as any,
      code: code.trim().toUpperCase(),
      type,
      value: value ? Number(value) : undefined,
      applies_to_categories: categories,
      applies_to_subcategories: subcategories,
      applies_to_tags: tags,
      applies_to_brand: brand || null,
      applies_to_products: products,
      buy_quantity: buyQuantity ? Number(buyQuantity) : null,
      get_quantity: getQuantity ? Number(getQuantity) : null,
      bogo_apply_to: bogoApplyTo as any,
      bogo_free_filters: {
        categories: bogoFreeFiltersCategories ? bogoFreeFiltersCategories.split(",").map((s) => s.trim()) : [],
        subcategories: bogoFreeFiltersSubcategories ? bogoFreeFiltersSubcategories.split(",").map((s) => s.trim()) : [],
        tags: bogoFreeFiltersTags ? bogoFreeFiltersTags.split(",").map((s) => s.trim()) : [],
        brand: bogoFreeFiltersBrand || null,
      },
      customer_filters: {
        vip: customerVip === 'any' ? null : customerVip === 'yes',
        tags: customerTags ? customerTags.split(',').map((s) => s.trim()).filter(Boolean) : [],
      },
      min_purchase: minPurchase ? Number(minPurchase) : null,
      customers_applicable: customersApplicable,
      start_at: startAt || null,
      end_at: endAt || null,
      limit_global: limitGlobal ? Number(limitGlobal) : null,
      limit_per_customer: limitPerCustomer ? Number(limitPerCustomer) : null,
      active,
    }
    // Persist via API (POST for new, PATCH for existing)
    const save = async () => {
      try {
        setLoading(true)
        const method = initial ? "PATCH" : "POST"
        const url = initial ? `/api/admin/coupons/${coupon.id}` : "/api/admin/coupons"
        // When creating a new coupon, do not send a non-UUID id field (DB expects uuid)
        const bodyPayload = initial ? coupon : { ...coupon }
        if (!initial && bodyPayload.id) delete bodyPayload.id
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPayload),
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          console.error("failed to save coupon", body)
          alert("Error guardando el cupón")
          return
        }

        const result = await res.json().catch(() => ({}))
        onSaved?.(result.data || coupon)
        router.push("/admin/cupones")
      } catch (err) {
        console.error(err)
        alert("Error al guardar el cupón")
      } finally {
        setLoading(false)
      }
    }

    void save()
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">{initial ? "Editar cupón" : "Crear cupón"}</h2>

      <div className="space-y-6">
        {/* Sección Productos */}
        <section>
          <h3 className="text-sm font-medium mb-2">Productos y reglas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-700">Código</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="text-sm text-gray-700">Tipo</label>
              <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-3 py-2 border rounded">
                <option value="percent">Porcentaje (%)</option>
                <option value="amount">Monto fijo</option>
                <option value="free_shipping">Envío gratis</option>
                <option value="bogo">Compra X obtiene Y</option>
              </select>
            </div>

            {type !== "free_shipping" && (
              <div>
                <label className="text-sm text-gray-700">Valor</label>
                <input type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
            )}

            <div>
              <label className="text-sm text-gray-700">Categorías</label>
              <div className="mt-2 grid grid-cols-2 gap-2 max-h-36 overflow-auto border rounded p-2">
                {availableCategories.map((cat) => (
                  <label key={cat} className={`flex items-center gap-2 p-1 rounded cursor-pointer ${categories.includes(cat) ? 'bg-gray-100' : ''}`}>
                    <input type="checkbox" checked={categories.includes(cat)} onChange={() => toggleValue(categories, setCategories, cat)} />
                    <span className="text-sm">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700">Subcategorías</label>
              <div className="mt-2 grid grid-cols-2 gap-2 max-h-36 overflow-auto border rounded p-2">
                {filteredSubcategories.map((sub) => (
                  <label key={sub} className={`flex items-center gap-2 p-1 rounded cursor-pointer ${subcategories.includes(sub) ? 'bg-gray-100' : ''}`}>
                    <input type="checkbox" checked={subcategories.includes(sub)} onChange={() => toggleValue(subcategories, setSubcategories, sub)} />
                    <span className="text-sm">{sub}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700">Etiquetas</label>
              <div className="mt-2 flex flex-wrap gap-2 max-h-36 overflow-auto border rounded p-2">
                {availableTags.map((t) => (
                  <button key={t} type="button" onClick={() => toggleValue(tags, setTags, t)} className={`px-2 py-1 rounded text-sm border ${tags.includes(t) ? 'bg-black text-white' : 'bg-white'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700">Marca aplicable</label>
              <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full px-3 py-2 border rounded">
                <option value="">-- Ninguna --</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-700">Productos (selección múltiple)</label>
              <div className="mt-2 grid grid-cols-1 gap-2 max-h-40 overflow-auto border rounded p-2">
                {availableProducts.map((p) => (
                  <label key={p.id} className={`flex items-center gap-2 p-1 rounded cursor-pointer ${products.includes(p.id) ? 'bg-gray-100' : ''}`}>
                    <input type="checkbox" checked={products.includes(p.id)} onChange={() => toggleValue(products, setProducts, p.id)} />
                    <span className="text-sm">{p.title} <span className="text-xs text-gray-400">({p.id})</span></span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sección Clientes */}
        <section>
          <h3 className="text-sm font-medium mb-2">Clientes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-700">Clientes aplicables</label>
              <select value={customersApplicable} onChange={(e) => setCustomersApplicable(e.target.value)} className="w-full px-3 py-2 border rounded">
                <option value="all">Todos</option>
                <option value="new">Nuevos clientes</option>
                <option value="returning">Clientes recurrentes</option>
                <option value="segment:students">Segmento: estudiantes</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-700">Segmentación avanzada (VIP / etiquetas)</label>
              <div className="flex gap-2 mt-2 items-center">
                <div className="inline-flex rounded-md shadow-sm" role="tablist" aria-label="VIP filter">
                  <button type="button" onClick={() => setCustomerVip('any')} className={`px-3 py-2 border rounded-l ${customerVip === 'any' ? 'bg-black text-white' : 'bg-white'}`}>Cualquiera</button>
                  <button type="button" onClick={() => setCustomerVip('yes')} className={`px-3 py-2 border-t border-b ${customerVip === 'yes' ? 'bg-black text-white' : 'bg-white'}`}>Solo VIP</button>
                  <button type="button" onClick={() => setCustomerVip('no')} className={`px-3 py-2 border rounded-r ${customerVip === 'no' ? 'bg-black text-white' : 'bg-white'}`}>Excluir VIP</button>
                </div>
                <input value={customerTags} onChange={(e) => setCustomerTags(e.target.value)} placeholder="etiquetas cliente (coma)" className="px-3 py-2 border rounded flex-1 min-w-0" />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700">Mínimo de compra</label>
              <input type="number" step="0.01" value={minPurchase} onChange={(e) => setMinPurchase(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
          </div>
        </section>

        {/* Sección Fechas y límites */}
        <section>
          <h3 className="text-sm font-medium mb-2">Fechas y límites</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-sm text-gray-700">Fecha inicio</label>
              <input type="date" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="text-sm text-gray-700">Fecha fin</label>
              <input type="date" value={endAt} onChange={(e) => setEndAt(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="text-sm text-gray-700">Activo</label>
              <div>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                  <span className="text-sm text-gray-700">Activo</span>
                </label>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-700">Límite global</label>
              <input type="number" value={limitGlobal} onChange={(e) => setLimitGlobal(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="text-sm text-gray-700">Límite por cliente</label>
              <input type="number" value={limitPerCustomer} onChange={(e) => setLimitPerCustomer(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
          </div>
        </section>

        {/* BOGO */}
        {type === "bogo" && (
          <section>
            <h3 className="text-sm font-medium mb-2">BOGO</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="number" min={1} value={buyQuantity} onChange={(e) => setBuyQuantity(e.target.value)} placeholder="Comprar (cantidad)" className="px-3 py-2 border rounded" />
              <input type="number" min={1} value={getQuantity} onChange={(e) => setGetQuantity(e.target.value)} placeholder="Recibir (cantidad)" className="px-3 py-2 border rounded" />
              <select value={bogoApplyTo} onChange={(e) => setBogoApplyTo(e.target.value)} className="px-3 py-2 border rounded">
                <option value="same">Mismo producto</option>
                <option value="cheapest">Producto más barato elegible</option>
                <option value="filtered">Producto de conjunto filtrado</option>
              </select>
            </div>
          </section>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push("/admin/cupones")}>Cancelar</Button>
          <Button variant="primary" onClick={submit}>Guardar cupón</Button>
        </div>
      </div>
    </div>
  )
}
