"use client"

import React, { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import { Heart, Share2, Star, Truck, Shield, RotateCcw } from "lucide-react"
import Header from "@/components/header"
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

interface ProductPageProps {
  // En Next.js 15+, params es una Promesa en componentes cliente
  params: Promise<{ slug: string }>
}

// Componente para productos similares
function SimilarProducts({ category, currentProductId }: { category: string; currentProductId: string }) {
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

        const { data, error } = await supabase
          .from("products")
          .select("id, name, price, sale_price, on_sale, image_url, category")
          .eq("category", category)
          .neq("id", currentProductId)
          .limit(8)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching similar products:", error)
          setLoading(false)
          return
        }

        setProducts(data || [])
      } catch (error) {
        console.error("Error fetching similar products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarProducts()
  }, [category, currentProductId])

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

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-4 md:py-8">
          <div className="max-w-7xl mx-auto px-4">
            {/* Loading skeleton */}
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-6" />
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
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

  // Mock images array (in real app, this would come from product data)
  const images = [
    product.image_url || "/placeholder.svg?height=600&width=600&query=product",
    "/placeholder.svg?height=600&width=600&query=product-2",
    "/placeholder.svg?height=600&width=600&query=product-3",
  ]

  const breadcrumbItems = [{ label: product.category, href: `/${product.category}` }, { label: product.name }]

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
            <Truck className="h-4 w-4 text-green-600" />
            <span>Envío gratis en pedidos superiores a 50€</span>
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
      <Header />

      <main className="py-4 md:py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumbs: prevenir desbordes horizontales */}
          <Breadcrumbs items={breadcrumbItems} className="mb-6 max-w-full overflow-hidden" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Gallery - Mobile: full width, Desktop: 3/5 */}
            <div className="lg:col-span-3 relative">
              <ProductGallery
                images={images}
                productName={product.name}
                activeIndex={activeImageIndex}
                onImageChange={setActiveImageIndex}
              />

              {/* Floating buttons - Mobile only */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 lg:hidden">
                <button
                  onClick={() => toggleFavorite(product.id)}
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
            <div className="lg:col-span-2 space-y-6">
              {/* Title and Rating */}
              <div>
                {/* Título: manejar cadenas largas sin espacios para no estirar el layout */}
                <h1
                  className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 w-full max-w-full break-all"
                  style={{ overflowWrap: "anywhere" }}
                >
                  {product.name}
                </h1>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">(4.0) · 24 reseñas</span>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <ProductPrice price={product.price} sale_price={product.sale_price} on_sale={product.on_sale} compact={false} />
                </div>
                <p className="text-sm text-gray-600">IVA incluido</p>
              </div>

              {/* Stock Status */}
              <div className="text-sm">
                {availableStock > 0 ? (
                  <span className="text-green-600 font-medium">✓ En stock ({availableStock} disponibles)</span>
                ) : (
                  <span className="text-red-600 font-medium">Sin stock</span>
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
              <div className="space-y-3">
                {/* Add to Cart - Full width on mobile */}
                <Button
                  onClick={handleAddToCart}
                  disabled={!isValidSelection || availableStock === 0}
                  loading={addingToCart}
                  className="w-full h-12 text-base font-medium"
                  size="lg"
                >
                  {availableStock === 0 ? "Sin stock" : "Añadir a la bolsa"}
                </Button>

                {/* Desktop: Horizontal buttons */}
                <div className="hidden lg:flex gap-3">
                  <Button onClick={() => toggleFavorite(product.id)} variant="outline" className="flex-1">
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
            <SimilarProducts category={product.category} currentProductId={product.id} />
          </section>
        </div>
      </main>

      <Footer />

      {/* Toast Notifications */}
      <Toast show={showToast} message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
    </div>
  )
}
