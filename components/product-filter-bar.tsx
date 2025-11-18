"use client"

import { useEffect, useState } from "react"
import ActionSheet from "@/components/ui/action-sheet"
import { SUBCATEGORIAS, type ProductCategory } from "@/lib/types"
import { ChevronDown, Filter as FilterIcon } from "lucide-react"

interface ProductFilterBarProps {
  category?: ProductCategory | "nuevo" | "rebajas" | "all"
  availableColors?: string[]
  availableSizes?: string[]
  onSortChange?: (sort: string) => void
  selectedSort?: string
  onColorsChange?: (colors: string[]) => void
  selectedColors?: string[]
  onSizeChange?: (sizes: string[]) => void
  selectedSizes?: string[]
  onClearFilters?: () => void
  // additional boolean filters may be provided
  selectedOnSale?: boolean
  selectedFeatured?: boolean
  selectedIsVip?: boolean
  selectedIsNew?: boolean
  onApplyFilters?: (filters: { subcategoria?: string | null; colors?: string[]; sizes?: string[]; sort?: string; on_sale?: boolean; featured?: boolean; is_vip?: boolean; is_new?: boolean }) => void
}

export default function ProductFilterBar({
  category,
  availableColors = [],
  availableSizes = [],
  onSortChange,
  selectedSort,
  onColorsChange,
  selectedColors = [],
  onSizeChange,
  selectedSizes = [],
  onClearFilters,
  selectedOnSale = false,
  selectedFeatured = false,
  selectedIsVip = false,
  selectedIsNew = false,
  onApplyFilters,
}: ProductFilterBarProps) {
  const [visible, setVisible] = useState(true)
  const [lastY, setLastY] = useState(0)

  // small action sheet states
  const [sheetOpen, setSheetOpen] = useState<"sort" | "colors" | "size" | null>(null)
  const [globalOpen, setGlobalOpen] = useState(false)

  // local selection inside global modal
  const [localSub, setLocalSub] = useState<string | null>(null)
  // temps for small sheets
  const [tempSort, setTempSort] = useState<string | null>(selectedSort ?? null)
  const [tempColors, setTempColors] = useState<string[]>(selectedColors ?? [])
  const [tempSizes, setTempSizes] = useState<string[]>(selectedSizes ?? [])
  // local copies for global modal (so apply/cancel within global works)
  const [localColors, setLocalColors] = useState<string[]>(selectedColors ?? [])
  const [localSizes, setLocalSizes] = useState<string[]>(selectedSizes ?? [])
  const [localSort, setLocalSort] = useState<string | null>(selectedSort ?? null)

  // boolean filters local state for global modal
  const [localOnSale, setLocalOnSale] = useState<boolean>(selectedOnSale ?? false)
  const [localFeatured, setLocalFeatured] = useState<boolean>(selectedFeatured ?? false)
  const [localIsVip, setLocalIsVip] = useState<boolean>(selectedIsVip ?? false)
  const [localIsNew, setLocalIsNew] = useState<boolean>(selectedIsNew ?? false)
  // fetched options when parent doesn't provide them
  const [fetchedColors, setFetchedColors] = useState<string[] | null>(null)
  const [fetchedSizes, setFetchedSizes] = useState<string[] | null>(null)
  const [optionsLoading, setOptionsLoading] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastY
      if (Math.abs(delta) < 8) return
      if (delta > 0) {
        // scrolling down
        setVisible(false)
      } else {
        // scrolling up
        setVisible(true)
      }
      setLastY(y)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [lastY])

  // subcategories for this category (exclude Ver todo here; global modal will include it)
  const subcats = (SUBCATEGORIAS[category as keyof typeof SUBCATEGORIAS] || []).filter((s) => s !== "Ver todo")

  // resolve available lists: prefer props from parent, fallback to fetched values
  const resolvedAvailableColors = (availableColors && availableColors.length > 0) ? availableColors : (fetchedColors ?? [])
  const resolvedAvailableSizes = (availableSizes && availableSizes.length > 0) ? availableSizes : (fetchedSizes ?? [])

  // Fallback: if parent didn't provide availableColors/availableSizes, fetch them from the API
  useEffect(() => {
    let mounted = true
    const shouldFetchColors = (!availableColors || availableColors.length === 0)
    const shouldFetchSizes = (!availableSizes || availableSizes.length === 0)
    if (!shouldFetchColors && !shouldFetchSizes) return
    async function fetchOptions() {
      try {
        setOptionsLoading(true)
        const params = new URLSearchParams()
        // Only set category when it's defined and not 'all' — 'all' means no category filter
        if (category && category !== "all") params.set("category", String(category))
        params.set("subcategoria", "all")
        if (selectedOnSale) params.set("on_sale", "true")
        if (selectedFeatured) params.set("featured", "true")
        if (selectedIsVip) params.set("is_vip", "true")
        if (selectedIsNew) params.set("is_new", "true")

        const res = await fetch(`/api/admin/options?${params.toString()}`)
        if (!mounted) return
        if (!res.ok) return
        const json = await res.json()
        if (mounted) {
          if (shouldFetchColors) setFetchedColors(json.colors || [])
          if (shouldFetchSizes) setFetchedSizes(json.sizes || [])
        }
      } catch (err) {
        // ignore fetch errors
      } finally {
        if (mounted) setOptionsLoading(false)
      }
    }
    fetchOptions()
    return () => { mounted = false }
  }, [category, selectedOnSale, selectedFeatured, selectedIsVip, selectedIsNew, availableColors, availableSizes])

  function applyGlobal() {
    setGlobalOpen(false)
    // apply global local selections
    if (onApplyFilters) onApplyFilters({
      subcategoria: localSub,
      colors: localColors,
      sizes: localSizes,
      sort: localSort ?? undefined,
      on_sale: localOnSale || undefined,
      featured: localFeatured || undefined,
      is_vip: localIsVip || undefined,
      is_new: localIsNew || undefined,
    })
    // also call specific handlers so parent props update immediately
    onColorsChange?.(localColors)
    onSizeChange?.(localSizes)
    // always notify sort change (empty string means cleared)
    onSortChange?.(localSort ?? "")
  }

  // When opening global modal, seed local values from selected props
  useEffect(() => {
    if (!globalOpen) return
    setLocalColors(selectedColors ?? [])
    setLocalSizes(selectedSizes ?? [])
    setLocalSort(selectedSort ?? null)
    setLocalOnSale(selectedOnSale ?? false)
    setLocalFeatured(selectedFeatured ?? false)
    setLocalIsVip(selectedIsVip ?? false)
    setLocalIsNew(selectedIsNew ?? false)
  }, [globalOpen, selectedColors, selectedSizes, selectedSort, selectedOnSale, selectedFeatured, selectedIsVip, selectedIsNew])

  return (
    <div className={`w-full bg-white border-b border-gray-100 transition-transform ${visible ? "translate-y-0" : "-translate-y-full"}`} style={{ position: "sticky", top: 64, zIndex: 30 }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 py-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => {
              setTempSort(selectedSort ?? null)
              setSheetOpen("sort")
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-700"
            aria-label="Ordenar"
          >
            <span className="truncate">Ordenar</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          <button
            type="button"
            onClick={() => {
              setTempColors(selectedColors ?? [])
              setSheetOpen("colors")
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-700"
            aria-label="Colores"
          >
            <span className="truncate">Colores</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          <button
            type="button"
            onClick={() => {
              setTempSizes(selectedSizes ?? [])
              setSheetOpen("size")
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-700"
            aria-label="Talla"
          >
            <span className="truncate">Talla</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          <div className="flex-1" />

          <div className="ml-2">
            <button
              type="button"
              onClick={() => setGlobalOpen(true)}
              className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-700"
              aria-label="Abrir filtros"
            >
              <FilterIcon className="w-4 h-4 text-gray-600" />
              <span className="hidden sm:inline">Filtrar</span>
            </button>
            </div>
            <div className="ml-2">
              <button
                type="button"
                onClick={() => {
                  // reset local and notify parent
                  setLocalSub(null)
                  setLocalColors([])
                  setLocalSizes([])
                  setLocalSort(null)
                  setLocalOnSale(false)
                  setLocalFeatured(false)
                  setLocalIsVip(false)
                  setLocalIsNew(false)
                  onClearFilters?.()
                }}
                className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-white border border-gray-200 text-xs text-gray-700"
                aria-label="Limpiar filtros"
              >
                Limpiar
              </button>
            </div>
        </div>
      </div>

      {/* Small action sheets for sort/colors/size - separate instances with Apply/Cancel */}
      <ActionSheet open={sheetOpen === "sort"} onClose={() => setSheetOpen(null)} title="Ordenar" mode="bottom">
        <div className="space-y-2">
          <button onClick={() => setTempSort("newest")} className={`w-full text-left px-3 py-2 ${tempSort === "newest" ? "font-semibold" : ""}`}>Novedades</button>
          <button onClick={() => setTempSort("price-asc")} className={`w-full text-left px-3 py-2 ${tempSort === "price-asc" ? "font-semibold" : ""}`}>Precio: menor a mayor</button>
          <button onClick={() => setTempSort("price-desc")} className={`w-full text-left px-3 py-2 ${tempSort === "price-desc" ? "font-semibold" : ""}`}>Precio: mayor a menor</button>
          <button onClick={() => setTempSort("name-asc")} className={`w-full text-left px-3 py-2 ${tempSort === "name-asc" ? "font-semibold" : ""}`}>Nombre: A-Z</button>

          <div className="pt-4 flex gap-2">
            <button onClick={() => { setTempSort(null) }} className="h-10 rounded-md border px-3">Limpiar</button>
            <button onClick={() => setSheetOpen(null)} className="flex-1 h-10 rounded-md border">Cancelar</button>
            <button onClick={() => { if (tempSort) onSortChange?.(tempSort); else onSortChange?.(""); setSheetOpen(null) }} className="flex-1 h-10 rounded-md bg-accent-orange text-white">Aplicar</button>
          </div>
        </div>
      </ActionSheet>

      <ActionSheet open={sheetOpen === "colors"} onClose={() => setSheetOpen(null)} title="Colores" mode="bottom">
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Selecciona uno o varios colores</p>
          <div className="flex flex-wrap gap-2">
            {resolvedAvailableColors.length === 0 && <p className="text-sm text-gray-500">No hay colores disponibles</p>}
            {resolvedAvailableColors.map((c) => {
              const active = tempColors.includes(c)
              return (
                <button key={c} onClick={() => {
                  const next = tempColors.includes(c) ? tempColors.filter(x => x !== c) : [...tempColors, c]
                  setTempColors(next)
                }} className={`px-2 py-1 rounded-full border text-xs sm:text-sm ${active ? "bg-accent-orange text-white" : "bg-white"}`}>
                  {c}
                </button>
              )
            })}
          </div>

          <div className="pt-4 flex gap-2">
            <button onClick={() => { setTempColors([]) }} className="h-10 rounded-md border px-3">Limpiar</button>
            <button onClick={() => setSheetOpen(null)} className="flex-1 h-10 rounded-md border">Cancelar</button>
            <button onClick={() => { onColorsChange?.(tempColors); setSheetOpen(null) }} className="flex-1 h-10 rounded-md bg-accent-orange text-white">Aplicar</button>
          </div>
        </div>
      </ActionSheet>

      <ActionSheet open={sheetOpen === "size"} onClose={() => setSheetOpen(null)} title="Tallas" mode="bottom">
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Selecciona una o varias tallas</p>
          <div className="flex flex-wrap gap-2">
            {resolvedAvailableSizes.length === 0 && <p className="text-sm text-gray-500">No hay tallas disponibles</p>}
            {resolvedAvailableSizes.map((s) => {
              const active = tempSizes.includes(s)
              return (
                <button key={s} onClick={() => {
                  const next = tempSizes.includes(s) ? tempSizes.filter(x => x !== s) : [...tempSizes, s]
                  setTempSizes(next)
                }} className={`px-2 py-1 rounded-full border text-xs sm:text-sm ${active ? "bg-accent-orange text-white" : "bg-white"}`}>
                  {s}
                </button>
              )
            })}
          </div>
          <div className="pt-4">
            <div className="flex gap-2">
              <button onClick={() => { setTempSizes([]) }} className="h-10 rounded-md border px-3">Limpiar</button>
              <button onClick={() => setSheetOpen(null)} className="flex-1 h-10 rounded-md border">Cancelar</button>
              <button onClick={() => { onSizeChange?.(tempSizes); setSheetOpen(null) }} className="flex-1 h-10 rounded-md bg-accent-orange text-white">Aplicar</button>
            </div>
          </div>
        </div>
      </ActionSheet>

      {/* Global modal for filters (simple implementation) */}
      <ActionSheet
        open={globalOpen}
        onClose={() => setGlobalOpen(false)}
        title="Filtros"
        mode="center"
        fullScreenOnMobile
        className="lg:max-w-4xl"
      >
        {/* Subcategorías dentro del modal global */}
        <div className="mb-4">
          <h4 className="font-medium mb-2">Subcategorías</h4>
          <div className="flex flex-wrap gap-2">
            <button key="ver-todo" onClick={() => setLocalSub(null)} className={`px-2 py-1 rounded-full border text-xs sm:text-sm ${localSub === null ? "bg-accent-orange text-white" : "bg-white"}`}>
              Ver todo
            </button>
            {subcats.map((s) => (
              <button key={s} onClick={() => setLocalSub(s)} className={`px-2 py-1 rounded-full border text-xs sm:text-sm ${localSub === s ? "bg-accent-orange text-white" : "bg-white"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Colores y tallas (secciones dentro del modal global) */}
        <div className="mb-4">
          <h4 className="font-medium mb-2">Colores</h4>
          <div className="flex flex-wrap gap-2">
            {resolvedAvailableColors.length === 0 && <p className="text-sm text-gray-500">No hay colores disponibles</p>}
            {resolvedAvailableColors.map((c) => (
              <button key={c} onClick={() => onColorsChange?.([...(selectedColors || []), c])} className={`px-2 py-1 rounded-full border text-xs sm:text-sm ${selectedColors?.includes(c) ? "bg-accent-orange text-white" : "bg-white"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium mb-2">Tallas</h4>
          <div className="flex flex-wrap gap-2">
            {resolvedAvailableSizes.length === 0 && <p className="text-sm text-gray-500">No hay tallas disponibles</p>}
            {resolvedAvailableSizes.map((s) => {
              const active = localSizes.includes(s)
              return (
                <button key={s} onClick={() => {
                  const next = localSizes.includes(s) ? localSizes.filter(x => x !== s) : [...localSizes, s]
                  setLocalSizes(next)
                }} className={`px-2 py-1 rounded-full border text-xs sm:text-sm ${active ? "bg-accent-orange text-white" : "bg-white"}`}>
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        {/* Additional boolean filters */}
        <div className="mb-4">
          <h4 className="font-medium mb-2">Más filtros</h4>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setLocalOnSale(!localOnSale)} className={`px-3 py-1 rounded-full border text-xs sm:text-sm ${localOnSale ? "bg-accent-orange text-white" : "bg-white"}`}>
              {localOnSale ? "En oferta" : "Solo en oferta"}
            </button>
            <button onClick={() => setLocalFeatured(!localFeatured)} className={`px-3 py-1 rounded-full border text-xs sm:text-sm ${localFeatured ? "bg-accent-orange text-white" : "bg-white"}`}>
              {localFeatured ? "Destacados" : "Solo destacados"}
            </button>
            <button onClick={() => setLocalIsVip(!localIsVip)} className={`px-3 py-1 rounded-full border text-xs sm:text-sm ${localIsVip ? "bg-accent-orange text-white" : "bg-white"}`}>
              {localIsVip ? "VIP" : "Solo VIP"}
            </button>
            <button onClick={() => setLocalIsNew(!localIsNew)} className={`px-3 py-1 rounded-full border text-xs sm:text-sm ${localIsNew ? "bg-accent-orange text-white" : "bg-white"}`}>
              {localIsNew ? "Novedades" : "Solo novedades"}
            </button>
          </div>
        </div>

        {/* Ordenamiento — opciones dentro del modal global */}
        <div className="mb-4">
          <h4 className="font-medium mb-2">Ordenar</h4>
          <div className="flex flex-col gap-2">
            <button onClick={() => setLocalSort("newest")} className={`w-full text-left px-3 py-2 ${localSort === "newest" ? "font-semibold" : ""}`}>Novedades</button>
            <button onClick={() => setLocalSort("price-asc")} className={`w-full text-left px-3 py-2 ${localSort === "price-asc" ? "font-semibold" : ""}`}>Precio: menor a mayor</button>
            <button onClick={() => setLocalSort("price-desc")} className={`w-full text-left px-3 py-2 ${localSort === "price-desc" ? "font-semibold" : ""}`}>Precio: mayor a menor</button>
            <button onClick={() => setLocalSort("name-asc")} className={`w-full text-left px-3 py-2 ${localSort === "name-asc" ? "font-semibold" : ""}`}>Nombre: A-Z</button>
            <div className="pt-2">
              <button onClick={() => setLocalSort(null)} className="h-9 rounded-md border px-3">Limpiar orden</button>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-between gap-2">
          <div>
            <button onClick={() => {
              // reset local modal state and notify parent
              setLocalSub(null)
              setLocalColors([])
              setLocalSizes([])
              setLocalSort(null)
              setLocalOnSale(false)
              setLocalFeatured(false)
              setLocalIsVip(false)
              setLocalIsNew(false)
              onClearFilters?.()
              setGlobalOpen(false)
            }} className="px-4 py-2 rounded-md border">Limpiar</button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setGlobalOpen(false)} className="px-4 py-2 rounded-md border">Cancelar</button>
            <button onClick={applyGlobal} className="px-4 py-2 rounded-md bg-accent-orange text-white">Aplicar</button>
          </div>
        </div>
      </ActionSheet>
    </div>
  )
}
