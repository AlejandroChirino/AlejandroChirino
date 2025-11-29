"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"
import { useCarousel } from "@/hooks/use-carousel"
import { useMobile } from "@/hooks/use-mobile"
import CarouselArticuloCard from "./carousel-articulo-card"
import type { ArticuloEnCamino } from "@/lib/types"

interface ArticulosCarouselProps {
  articulos: ArticuloEnCamino[]
  title?: string
  className?: string
}

const ArticulosCarousel = memo(function ArticulosCarousel({ articulos, title, className = "" }: ArticulosCarouselProps) {
  const isMobile = useMobile()
  const itemsPerPage = isMobile ? 2 : 4

  const { containerRef, isDragging } = useCarousel({
    totalItems: articulos.length,
    itemsPerPage,
  })

  if (articulos.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-gray-500">No hay artículos en camino</p>
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
          "scrollbar-hide",
          "gap-3 md:gap-4",
          "px-4 md:px-0",
          isDragging ? "cursor-grabbing" : "cursor-grab",
        )}
      >
        {articulos.map((articulo) => (
          <div key={articulo.id} className={cn("snap-start flex-shrink-0 w-[48%] md:w-[24%]")}> 
            <CarouselArticuloCard articulo={articulo} isMobile={isMobile} />
          </div>
        ))}
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Mostrando {articulos.length} artículos en un carrusel desplazable.
      </div>
    </div>
  )
})

export default ArticulosCarousel
