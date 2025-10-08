import { memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { cn, formatPrice } from "@/lib/utils"
import type { ProductCardProps } from "@/lib/types"

interface CarouselProductCardProps extends ProductCardProps {
  isPartiallyVisible?: boolean
  isMobile?: boolean
}

const CarouselProductCard = memo(function CarouselProductCard({
  product,
  isPartiallyVisible = false,
  isMobile = false,
}: CarouselProductCardProps) {
  const { id, name, price, image_url } = product

  return (
    <Link
      href={`/producto/${id}`}
      className={cn(
        "group block focus:outline-none focus:ring-2 focus:ring-accent-orange rounded-lg transition-all duration-300",
        isPartiallyVisible && "opacity-80 scale-95",
        !isMobile && "hover:scale-105 hover:shadow-lg",
      )}
      aria-label={`Ver detalles de ${name}`}
    >
      <article className="h-full">
        <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-2 md:mb-3 relative">
          <Image
            src={image_url || "/placeholder.svg?height=400&width=300&query=product"}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
            loading="lazy"
          />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-accent-orange transition-colors text-xs md:text-sm">
            {name}
          </h3>
          <p className="text-accent-orange font-bold text-sm md:text-base">{formatPrice(price)}</p>
        </div>
      </article>
    </Link>
  )
})

export default CarouselProductCard
