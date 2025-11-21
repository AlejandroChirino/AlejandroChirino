import { memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { cn, formatPrice } from "@/lib/utils"
import type { ProductCardProps } from "@/lib/types"

interface CarouselProductCardProps extends ProductCardProps {
  isPartiallyVisible?: boolean
  isMobile?: boolean
  badgeType?: "nuevo" | "top-ventas"
}

const CarouselProductCard = memo(function CarouselProductCard({
  product,
  isPartiallyVisible = false,
  isMobile = false,
  square = false,
  badgeType = "top-ventas",
}: CarouselProductCardProps) {
  const { id, name, price, image_url } = product

  return (
    <Link
      href={`/producto/${id}`}
      className={cn(
        "group block focus:outline-none focus:ring-2 focus:ring-accent-orange transition-all duration-300",
        square ? "rounded-none" : "rounded-lg",
        isPartiallyVisible && "opacity-80 scale-95",
        !isMobile && "hover:scale-105 hover:shadow-lg",
      )}
      aria-label={`Ver detalles de ${name}`}
    >
      <article className="h-full">
        <div className={cn("aspect-[3/4] bg-gray-100 overflow-hidden mb-2 md:mb-3 relative", square ? "rounded-none" : "rounded-lg")}>
          <Image
            src={image_url || "/placeholder.svg?height=400&width=300&query=product"}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
            loading="lazy"
          />
          {/* Etiqueta Destacada */}
          <span className="absolute top-2 left-2 bg-accent-orange text-white text-xs md:text-sm font-bold px-2 py-1 rounded">
            {badgeType === "nuevo" ? "Nuevo" : "TOP VENTAS"}
          </span>
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-accent-orange transition-colors text-xs md:text-sm">
            {name}
          </h3>
          <p className="text-accent-orange font-bold text-sm md:text-base">{formatPrice(price)}</p>
        </div>
        {/* Iconos de Acción Rápida */}
        {!isMobile && (
          <div className="absolute bottom-2 right-2 flex gap-2">
            <button
              className="bg-white text-gray-900 rounded-full p-2 shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-orange"
              aria-label="Añadir a Carrito"
            >
              🛒
            </button>
            <button
              className="bg-white text-gray-900 rounded-full p-2 shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-orange"
              aria-label="Vista Rápida"
            >
              👁️
            </button>
          </div>
        )}
      </article>
    </Link>
  )
})

export default CarouselProductCard
