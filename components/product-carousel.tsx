"use client"

import { memo, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCarousel } from "@/hooks/use-carousel"
import { useMobile } from "@/hooks/use-mobile"
import CarouselProductCard from "./carousel-product-card"
import type { Product } from "@/lib/types"

interface ProductCarouselProps {
  products: Product[]
  title?: string
  className?: string
  autoPlay?: boolean
}

const ProductCarousel = memo(function ProductCarousel({
  products,
  title,
  className = "",
  autoPlay = false,
}: ProductCarouselProps) {
  const isMobile = useMobile()
  const itemsPerPage = isMobile ? 4 : 4 // 2x2 en móvil, 4x1 en desktop

  const {
    currentPage,
    totalPages,
    canGoNext,
    canGoPrev,
    goToNext,
    goToPrev,
    goToPage,
    containerRef,
    isDragging,
    dragOffset,
  } = useCarousel({
    totalItems: products.length,
    itemsPerPage,
    autoPlay,
  })

  // Calcular productos visibles
  const visibleProducts = useMemo(() => {
    const startIndex = currentPage * itemsPerPage
    return products.slice(startIndex, startIndex + itemsPerPage)
  }, [products, currentPage, itemsPerPage])

  // Calcular productos parcialmente visibles (solo móvil)
  const partiallyVisibleProducts = useMemo(() => {
    if (!isMobile) return []
    const nextPageStart = (currentPage + 1) * itemsPerPage
    return products.slice(nextPageStart, nextPageStart + 2) // Mostrar 2 productos del siguiente grupo
  }, [products, currentPage, itemsPerPage, isMobile])

  if (products.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-gray-500">No hay productos disponibles</p>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {/* Título */}
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}

      {/* Contenedor del carrusel */}
      <div className="relative overflow-hidden">
        {/* Botones de navegación - Solo desktop */}
        {!isMobile && totalPages > 1 && (
          <>
            <button
              onClick={goToPrev}
              disabled={!canGoPrev}
              className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 z-10",
                "w-10 h-10 bg-white rounded-full shadow-lg",
                "flex items-center justify-center transition-all duration-200",
                "opacity-80 hover:opacity-100",
                "disabled:opacity-30 disabled:cursor-not-allowed",
                "focus:outline-none focus:ring-2 focus:ring-accent-orange",
              )}
              aria-label="Producto anterior"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>

            <button
              onClick={goToNext}
              disabled={!canGoNext}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 z-10",
                "w-10 h-10 bg-white rounded-full shadow-lg",
                "flex items-center justify-center transition-all duration-200",
                "opacity-80 hover:opacity-100",
                "disabled:opacity-30 disabled:cursor-not-allowed",
                "focus:outline-none focus:ring-2 focus:ring-accent-orange",
              )}
              aria-label="Siguiente producto"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Grid de productos */}
        <div
          ref={containerRef}
          className={cn(
            "transition-transform duration-300 ease-out",
            isDragging && "transition-none",
            isMobile ? "px-4" : "px-12",
          )}
          style={{
            transform: `translateX(${dragOffset}px)`,
          }}
        >
          {isMobile ? (
            // Layout móvil: 2x2 grid
            <div className="grid grid-cols-2 gap-3">
              {visibleProducts.map((product) => (
                <CarouselProductCard key={product.id} product={product} isMobile={isMobile} />
              ))}
            </div>
          ) : (
            // Layout desktop: 4 productos en fila
            <div className="grid grid-cols-4 gap-4">
              {visibleProducts.map((product) => (
                <CarouselProductCard key={product.id} product={product} isMobile={isMobile} />
              ))}
            </div>
          )}

          {/* Productos parcialmente visibles - Solo móvil */}
          {isMobile && partiallyVisibleProducts.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-3 opacity-50">
              {partiallyVisibleProducts.map((product) => (
                <CarouselProductCard
                  key={`partial-${product.id}`}
                  product={product}
                  isPartiallyVisible
                  isMobile={isMobile}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Indicadores de página - Solo móvil */}
      {isMobile && totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToPage(index)}
              className={cn(
                "rounded-full transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-accent-orange focus:ring-offset-2",
                index === currentPage
                  ? "w-2 h-2 bg-gray-900" // Activo: 8px, negro
                  : "w-1.5 h-1.5 bg-gray-400 hover:bg-gray-600", // Inactivo: 6px, gris
              )}
              aria-label={`Ir a la página ${index + 1}`}
              aria-current={index === currentPage ? "page" : undefined}
            />
          ))}
        </div>
      )}

      {/* Información de accesibilidad */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Página {currentPage + 1} de {totalPages}. Mostrando {visibleProducts.length} productos de {products.length}{" "}
        total.
      </div>
    </div>
  )
})

export default ProductCarousel
