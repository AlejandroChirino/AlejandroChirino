"use client"

import { cn } from "@/lib/utils"
import { memo, useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import type { ProductCardProps } from "@/lib/types"
import { ShoppingBag } from "lucide-react"
import ProductPrice from "@/components/product-price"
import { useCart } from "@/contexts/cart-context"
import ActionSheet from "@/components/ui/action-sheet"
import ProductDiscountBadge from "@/components/product-discount-badge"
import QuickAddPreview from "@/components/quick-add-preview"

const ProductCard = memo(function ProductCard({ product, compact = false, square = false }: ProductCardProps) {
  const { id, name, price, sale_price, on_sale, image_url, category } = product

  // Normalizar y calcular descuento similar a la página de detalle
  const p = Number(price)
  const s = sale_price == null ? null : Number(sale_price)
  const hasSale = !!(on_sale && s != null && Number.isFinite(s) && s < p)
  const discountPercentage = hasSale ? Math.round(((p - (s as number)) / p) * 100) : 0

  return (
    <div className={cn("group block focus-within:outline-none focus-within:ring-2 focus-within:ring-accent-orange relative", square ? "rounded-none" : "rounded-lg")}>
      <Link
        href={`/producto/${id}`}
        className="block"
        aria-label={`Ver detalles de ${name}`}
      >
        <article className="h-full">
          <div className={cn("aspect-[3/4] bg-gray-100 overflow-hidden mb-2 md:mb-4 relative", square ? "rounded-none" : "rounded-lg")}>
            <Image
              src={image_url || "/placeholder.svg?height=400&width=300&query=product"}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes={
                compact
                  ? "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              }
              loading="lazy"
            />

            {/* Etiqueta de rebaja (reutilizable) */}
            <ProductDiscountBadge price={p} sale_price={s} on_sale={on_sale} className="absolute top-2 left-2 text-xs" />
          </div>

          <div className="space-y-1 md:space-y-2">
            <h3
              className={cn(
                "font-medium text-gray-900 line-clamp-2 group-hover:text-accent-orange transition-colors",
                compact ? "text-xs md:text-sm" : "text-sm md:text-base",
              )}
            >
              {name}
            </h3>

            <div className="flex items-center gap-2">
              <ProductPrice price={p} sale_price={s} on_sale={on_sale} compact={compact} />
            </div>

            <span className="sr-only">Categoría: {category}</span>
          </div>
        </article>
      </Link>

      {/* Botón QuickAdd separado del Link para evitar navegación accidental */}
      <QuickAddButton
        product={{ id, name, price, sale_price, on_sale, image_url, category, sizes: (product as any)?.sizes, colors: (product as any)?.colors }}
      />
    </div>
  )
})

function QuickAddButton({ product }: { product: any }) {
  const { addItem, isLoading } = useCart()
  const [open, setOpen] = useState(false)
  const [tempSize, setTempSize] = useState<string | null>(null)
  const [tempColor, setTempColor] = useState<string | null>(null)
  const [fullProduct, setFullProduct] = useState<any | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const parentLinkRef = useRef<HTMLElement | null>(null)

  const handleOpen = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // disable parent link navigation while modal is opening
    try {
      const anchor = (e.currentTarget as HTMLElement).closest("a") as HTMLElement | null
      parentLinkRef.current = anchor
      if (anchor) anchor.style.pointerEvents = "none"
    } catch (err) {
      // ignore
    }

    setLoadingDetails(true)
    try {
      const res = await fetch(`/api/products/${product.id}`)
      const json = await res.json()
      const fetched = json.product || json
      setFullProduct(fetched)
      setTempSize(fetched?.sizes && fetched.sizes.length > 0 ? fetched.sizes[0] : null)
      setTempColor(fetched?.colors && fetched.colors.length > 0 ? fetched.colors[0] : null)
      setOpen(true)
    } catch (err) {
      console.error("Error fetching product details for quick add:", err)
      if (parentLinkRef.current) parentLinkRef.current.style.pointerEvents = ""
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleAdd = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (!fullProduct) return
    try {
      await addItem(fullProduct as any, 1, tempSize || undefined, tempColor || undefined)
      setOpen(false)
      if (parentLinkRef.current) {
        parentLinkRef.current.style.pointerEvents = ""
        parentLinkRef.current = null
      }
    } catch (err) {
      console.error("Error adding from quick modal:", err)
    }
  }

  // restore pointer-events when modal closes or on unmount
  useEffect(() => {
    if (!open && parentLinkRef.current) {
      parentLinkRef.current.style.pointerEvents = ""
      parentLinkRef.current = null
    }
    return () => {
      if (parentLinkRef.current) {
        parentLinkRef.current.style.pointerEvents = ""
        parentLinkRef.current = null
      }
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClickCapture={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleOpen(e as unknown as React.MouseEvent)
        }}
        onPointerDownCapture={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onTouchStartCapture={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onMouseDownCapture={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow hover:scale-105 transition-transform"
        aria-label="Seleccionar talla y añadir al carrito"
      >
        <ShoppingBag className="h-4 w-4 text-gray-800" />
      </button>

      <ActionSheet open={open} onClose={() => setOpen(false)} title="Selecciona talla y color">
        {loadingDetails && (
          <div className="p-6 text-center">Cargando opciones...</div>
        )}
        {!loadingDetails && !fullProduct && (
          <div className="p-6 text-center">No se pudieron cargar los datos del producto.</div>
        )}
        {!loadingDetails && fullProduct && (
          <QuickAddPreview
            product={fullProduct}
            tempSize={tempSize}
            tempColor={tempColor}
            onSizeChange={(s) => setTempSize(s)}
            onColorChange={(c) => setTempColor(c)}
            onCancel={() => setOpen(false)}
            onAdd={() => handleAdd()}
          />
        )}
      </ActionSheet>
    </>
  )
}

export default ProductCard
