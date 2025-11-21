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
  square?: boolean
}

const ProductCarousel = memo(function ProductCarousel({
  products,
  title,
  className = "",
  square = false,
}: ProductCarouselProps) {
  const isMobile = useMobile()
  const itemsPerPage = isMobile ? 2 : 4

  const { containerRef, isDragging } = useCarousel({
    totalItems: products.length,
    itemsPerPage,
  })

  if (products.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-gray-500">No hay productos disponibles</p>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}

      <div
        ref={containerRef}
        className={cn(
          "flex overflow-x-auto snap-x snap-mandatory scroll-smooth",
          "scrollbar-hide", // Oculta la barra de scroll
          "gap-3 md:gap-4", // Espaciado entre tarjetas
          "px-4 md:px-0", // Padding horizontal en móvil
          isDragging ? "cursor-grabbing" : "cursor-grab",
        )}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className={cn(
              "snap-start flex-shrink-0",
              "w-[48%] md:w-[24%]", // Ancho de las tarjetas (2 en móvil, 4 en desktop)
            )}
          >
            <CarouselProductCard product={product} isMobile={isMobile} square={square} />
          </div>
        ))}
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Mostrando {products.length} productos en un carrusel desplazable.
      </div>
    </div>
  )
})

export default ProductCarousel
