"use client"

import React, { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import { Heart, Share2, Star, Truck, Shield, RotateCcw } from "lucide-react"
// Header provisto por RootLayout
import Footer from "@/components/footer"
import Breadcrumbs from "@/components/breadcrumbs"
import ProductGallery from "@/components/product-gallery"
import VariantSelector from "@/components/variant-selector"
import ProductAccordion from "@/components/product-accordion"
import Button from "@/components/ui/button"
import Toast from "@/components/ui/toast"
import { useProduct } from "@/hooks/use-product"
import { useFavorites } from "@/hooks/use-favorites"
// Importar el contexto del carrito
import { useCart } from "@/contexts/cart-context"
import { formatPrice } from "@/lib/utils"
import ProductPrice from "@/components/product-price"
import ProductCarousel from "@/components/product-carousel"
import ProductDiscountBadge from "@/components/product-discount-badge"
import { supabase } from "@/lib/supabaseClient"
import LoadingSkeleton from "@/components/loading-skeleton"
import { slugFromLabel } from "@/lib/subcategoryUtils"

interface ProductPageProps {
  // En Next.js 15+, params es una Promesa en componentes cliente
  params: Promise<{ slug: string }>
}

// Componente para productos similares
function SimilarProducts({ product }: { product: any }) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSimilarProducts() {
      try {
        setLoading(true)

        if (!supabase) {
          console.warn("Supabase not configured, skipping similar products")
          setLoading(false)
          return
        }

        // Helper to stringify errors (includes non-enumerable props)
        const formatError = (err: any) => {
          try {
            return JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
          } catch (e) {
            try {
              return String(err)
            } catch (e2) {
              return "(unserializable error)"
            }
          }
        }

        // Try the view that includes effective_price, fallback to `products` if it fails
        let candidates: any[] = []
        try {
          const res = await supabase
            .from("products_with_effective_price")
            .select("id, name, price, sale_price, on_sale, image_url, category, subcategoria, sizes, colors, stock, description, featured, effective_price, created_at")
            .eq("category", product.category)
            .neq("id", product.id)
            .gte("stock", 1)
            .limit(100)

          if (res.error) throw res.error
          candidates = res.data || []
        } catch (e) {
          console.error("products_with_effective_price query failed, falling back to products table. error:", formatError(e))
          try {
            const res2 = await supabase
              .from("products")
              .select("id, name, price, sale_price, on_sale, image_url, category, subcategoria, sizes, colors, stock, description, featured, created_at")
              .eq("category", product.category)
              .eq("archived", false)
              .neq("id", product.id)
              .gte("stock", 1)
              .limit(100)

            if (res2.error) {
              console.error("Fallback products query also failed:", formatError(res2.error))
              setLoading(false)
              return
            }
            candidates = res2.data || []
          } catch (e2) {
            console.error("Unexpected error during fallback products query:", formatError(e2))
            setLoading(false)
            return
          }
        }

        // Scoring function: subcategoria, colors, sizes, name/description similarity, recency, featured
        const tokenize = (text: string | null) => {
          if (!text) return []
          return text
            .toLowerCase()
            .replace(/[^a-z0-9áéíóúñ\s]/g, " ")
            .split(/\s+/)
            .filter(Boolean)
        }

        const baseText = `${product.name || ""} ${product.description || ""}`
        const baseTokens = new Set(tokenize(baseText))

        const scored = candidates.map((c) => {
          let score = 0

          // subcategory exact match (strong)
          if (product.subcategoria && c.subcategoria && product.subcategoria === c.subcategoria) score += 6

          // color and size overlaps
          const prodColors = (product.colors || []).map((x: string) => (x || "").toLowerCase())
          const candColors = (c.colors || []).map((x: string) => (x || "").toLowerCase())
          const colorOverlap = prodColors.filter((v: string) => candColors.includes(v)).length
          score += colorOverlap * 2

          const prodSizes = (product.sizes || []).map((x: string) => (x || "").toLowerCase())
          const candSizes = (c.sizes || []).map((x: string) => (x || "").toLowerCase())
          const sizeOverlap = prodSizes.filter((v: string) => candSizes.includes(v)).length
          score += sizeOverlap * 2

          // name/description token overlap
          const candTokens = new Set((`${c.name || ""} ${c.description || ""}`).toLowerCase().replace(/[^a-z0-9áéíóúñ\s]/g, " ").split(/\s+/).filter(Boolean))
          let common = 0
          for (const t of baseTokens) if (candTokens.has(t)) common++
          score += Math.min(common, 6)

          // recency boost (products added within 30 days get small boost)
          try {
            const now = Date.now()
            const created = new Date(c.created_at).getTime()
            const days = Math.max(0, (now - created) / (1000 * 60 * 60 * 24))
            if (days <= 7) score += 2
            else if (days <= 30) score += 1
          } catch (e) {
            // ignore
          }

          if (c.featured) score += 1

          // small random tie-breaker to vary results
          const tie = Math.random() * 0.001

          return { product: c, score: score + tie }
        })

        scored.sort((a, b) => b.score - a.score)

        const top = scored.slice(0, 10).map((s) => s.product)

        setProducts(top)
      } catch (error) {
        console.error("Error fetching similar products:", formatError(error))
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarProducts()
  }, [product])

  if (loading) {
    return <LoadingSkeleton count={4} compact />
  }

  if (products.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No hay productos similares disponibles</p>
      </div>
    )
  }

  return <ProductCarousel products={products} title="Productos similares" />
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = React.use(params) as { slug: string }
  const {
    product,
    loading,
    error,
    selectedSize,
    selectedColor,
    activeImageIndex,
    setSelectedSize,
    setSelectedColor,
    setActiveImageIndex,
    isValidSelection,
    availableStock,
  } = useProduct(slug)

  const { isFavorite, toggleFavorite } = useFavorites()
  // Reemplazar el hook useCart existente con el nuevo
  const { addItem, isItemInCart, isLoading: addingToCart } = useCart()

  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "error">("success")

  // Wrapper to call toggleFavorite and show a visual toast for feedback
  const handleToggleFavorite = async () => {
    try {
      console.log("handleToggleFavorite: starting", { productId: product.id })
      const currently = isFavorite(product.id)
      // Call the hook and wait
      await toggleFavorite(product.id)
      console.log("handleToggleFavorite: toggleFavorite completed", { productId: product.id })

      // Re-sync favorites from server to ensure client reflects DB state
      try {
        const userRes = await supabase.auth.getUser()
        const userId = userRes?.data?.user?.id
        if (userId) {
          const res = await fetch(`/api/favorites?userId=${encodeURIComponent(userId)}`)
          const data = await res.json()
          console.log("handleToggleFavorite: re-fetched favorites", { data })
        } else {
          console.log("handleToggleFavorite: no user session available to re-fetch favorites")
        }
      } catch (e) {
        console.warn("handleToggleFavorite: failed to re-fetch favorites", e)
      }

      setToastMessage(!currently ? "Añadido a favoritos" : "Eliminado de favoritos")
      setToastType("success")
      setShowToast(true)
    } catch (e) {
      console.error("Error toggling favorite from UI:", e)
      setToastMessage("Error actualizando favoritos")
      setToastType("error")
      setShowToast(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Header ya incluido en el layout raíz */}
        <main className="py-4 md:py-8">
          <div className="max-w-7xl mx-auto px-4">
            {/* Loading skeleton */}
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-6" />
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-x-8 gap-y-2">
                <div className="lg:col-span-3">
                  <div className="aspect-[3/4] bg-gray-200 rounded-lg" />
                </div>
                <div className="lg:col-span-2 space-y-4">
                  <div className="h-8 bg-gray-200 rounded" />
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    notFound()
  }

  // Use image_urls array when available, fallback to single image_url and placeholders
  const images = product.image_urls && product.image_urls.length > 0
    ? product.image_urls
    : [
        product.image_url || "/placeholder.svg?height=600&width=600&query=product",
        "/placeholder.svg?height=600&width=600&query=product-2",
        "/placeholder.svg?height=600&width=600&query=product-3",
      ]

  const breadcrumbItems = (() => {
    const items: { label: string; href?: string }[] = []
    // Category
    items.push({ label: product.category, href: `/${product.category}` })
    // Subcategory (when available) -> link to category/subcategory
    if (product.subcategoria) {
      try {
        const slug = slugFromLabel(product.category as any, product.subcategoria)
        items.push({ label: product.subcategoria, href: `/${product.category}/${slug}` })
      } catch (e) {
        // Fallback: push label without href
        items.push({ label: product.subcategoria })
      }
    }
    // Current product (no href)
    items.push({ label: product.name })
    return items
  })()

  // Reemplazar la función handleAddToCart con la nueva implementación
  const handleAddToCart = async () => {
    if (!isValidSelection) {
      setToastMessage("Por favor selecciona todas las opciones requeridas")
      setToastType("error")
      setShowToast(true)
      return
    }

    await addItem(product, 1, selectedSize || undefined, selectedColor || undefined)
  }

  const handleShare = async () => {
    // Asegurar ejecución solo en cliente
    if (typeof navigator !== "undefined" && typeof window !== "undefined") {
      if (typeof (navigator as any).share === "function") {
        try {
          await (navigator as any).share({
            title: product.name,
            text: `Mira este producto: ${product.name}`,
            url: window.location.href,
          })
          return
        } catch (error) {
          console.log("Error sharing:", error)
        }
      }
      // Fallback to clipboard si está disponible
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        try {
          await navigator.clipboard.writeText(window.location.href)
          setToastMessage("Enlace copiado al portapapeles")
          setToastType("success")
          setShowToast(true)
        } catch (error) {
          console.log("Error copying to clipboard:", error)
        }
      }
    }
  }

  const accordionItems = [
    {
      id: "details",
      title: "Detalles del producto",
      content: (
        <div className="space-y-2">
          <p>{product.description || "Descripción no disponible"}</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Material de alta calidad</li>
            <li>Diseño moderno y versátil</li>
            <li>Fácil cuidado y mantenimiento</li>
          </ul>
        </div>
      ),
    },
    {
      id: "sizing",
      title: "Guía de tallas",
      content: (
        <div className="space-y-2">
          <p>Consulta nuestra guía de tallas para encontrar el ajuste perfecto.</p>
          <div className="text-sm">
            <p>
              <strong>S:</strong> 36-38
            </p>
            <p>
              <strong>M:</strong> 40-42
            </p>
            <p>
              <strong>L:</strong> 44-46
            </p>
            <p>
              <strong>XL:</strong> 48-50
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "shipping",
      title: "Envío y devoluciones",
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-[var(--brand-green)]" />
            <span>Envío gratis en pedidos superiores a $50</span>
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-blue-600" />
            <span>Devoluciones gratuitas hasta 30 días</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-600" />
            <span>Compra 100% segura</span>
          </div>
        </div>
      ),
    },
  ]

  // Calcular descuento real usando los campos de producto
  const hasDiscount = !!(product.on_sale && product.sale_price != null && product.sale_price < product.price)
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - (product.sale_price || 0)) / product.price) * 100)
    : 0
  const displayPrice = hasDiscount && product.sale_price ? product.sale_price : product.price
  const originalPrice = hasDiscount && product.sale_price ? product.price : undefined

  return (
    // Evitar scroll horizontal global en la página de detalle
    <div className="min-h-screen overflow-x-hidden">
      {/* Header ya incluido en el layout raíz */}

      <main className="py-2 md:py-4">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumbs: prevenir desbordes horizontales */}
          <Breadcrumbs items={breadcrumbItems} className="mb-2 max-w-full overflow-hidden" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-x-8 gap-y-2">
            {/* Gallery - Mobile: full width, Desktop: 3/5 */}
            <div className="lg:col-span-3 relative">
              <ProductGallery
                images={images}
                productName={product.name}
                activeIndex={activeImageIndex}
                onImageChange={setActiveImageIndex}
              />

              {/* Título y rating: título a la izquierda (truncado), estrellas a la derecha */}
              <div className="mt-0 mb-0 flex items-start justify-between gap-3">
                <h1
                  className="flex-1 text-sm md:text-base font-semibold text-gray-900 truncate mb-0"
                  style={{ overflowWrap: "anywhere" }}
                  title={product.name}
                >
                  {product.name}
                </h1>

                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < (product.rating ?? 4) ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <div className="text-[10px] leading-none text-gray-600 mt-1">{(product.rating ?? 4).toFixed(1)} · {product.reviews_count ?? 24} reseñas</div>
                </div>
              </div>

              {/* Floating buttons - Mobile only */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 lg:hidden">
                <button
                  onClick={() => handleToggleFavorite()}
                  className={`p-2 rounded-full shadow-lg transition-colors ${
                    isFavorite(product.id) ? "bg-red-500 text-white" : "bg-white text-gray-600 hover:text-red-500"
                  }`}
                  aria-label={isFavorite(product.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                >
                  <Heart className={`h-5 w-5 ${isFavorite(product.id) ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 bg-white text-gray-600 hover:text-gray-900 rounded-full shadow-lg transition-colors"
                  aria-label="Compartir producto"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              {/* Discount badge */}
              <ProductDiscountBadge
                price={product.price}
                sale_price={product.sale_price}
                on_sale={product.on_sale}
                className="absolute top-4 left-4"
              />
            </div>

            {/* Product Info - Mobile: full width, Desktop: 2/5 */}
            <div className="lg:col-span-2 space-y-2">

              {/* Price */}
              <div className="space-y-0 -mt-4">
                <div className="flex items-center gap-3">
                  <ProductPrice price={product.price} sale_price={product.sale_price} on_sale={product.on_sale} compact={false} className="mt-0" />
                </div>
              </div>

              {/* Stock Status */}
              <div className="text-xs mb-2">
                {availableStock > 0 ? (
                  <span className="text-[var(--brand-green)] text-xs font-medium">✓ En stock ({availableStock} disponibles)</span>
                ) : (
                  <span className="text-red-600 text-xs font-medium">Sin stock</span>
                )}
              </div>

              {/* Variant Selector */}
              <VariantSelector
                sizes={product.sizes}
                colors={product.colors}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                onSizeChange={setSelectedSize}
                onColorChange={setSelectedColor}
                availableStock={availableStock}
              />

              {/* Action Buttons */}
              <div className="space-y-2">
                {/* Add to Cart - Full width on mobile */}
                <Button
                  onClick={handleAddToCart}
                  disabled={!isValidSelection || availableStock === 0}
                  loading={addingToCart}
                  className="w-full h-12 text-base font-medium mt-2 mb-2 bg-[#00E676] rounded-full hover:shadow-md hover:brightness-105"
                  size="lg"
                >
                  {availableStock === 0 ? "Sin stock" : "Añadir a la bolsa"}
                </Button>

                {/* Desktop: Horizontal buttons */}
                <div className="hidden lg:flex gap-3">
                  <Button onClick={() => handleToggleFavorite()} variant="outline" className="flex-1">
                    <Heart className={`h-4 w-4 mr-2 ${isFavorite(product.id) ? "fill-current text-red-500" : ""}`} />
                    {isFavorite(product.id) ? "En favoritos" : "Favoritos"}
                  </Button>
                  <Button onClick={handleShare} variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </Button>
                </div>
              </div>

              {/* Accordion */}
              <ProductAccordion items={accordionItems} />
            </div>
          </div>

          {/* Similar Products Section */}
            <section className="mt-16">
              <SimilarProducts product={product} />
            </section>
        </div>
      </main>

      <Footer />

      {/* Toast Notifications */}
      <Toast show={showToast} message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
    </div>
  )
}
