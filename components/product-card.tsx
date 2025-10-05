import { cn } from "@/lib/utils"
import { memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import type { ProductCardProps } from "@/lib/types"

const ProductCard = memo(function ProductCard({ product, compact = false }: ProductCardProps) {
  const { id, name, price, sale_price, on_sale, image_url, category } = product

  // Calcular porcentaje de descuento
  const discountPercentage = sale_price && on_sale ? Math.round(((price - sale_price) / price) * 100) : 0

  return (
    <Link
      href={`/producto/${id}`}
      className="group block focus:outline-none focus:ring-2 focus:ring-accent-orange rounded-lg"
      aria-label={`Ver detalles de ${name}`}
    >
      <article className="h-full">
        <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-2 md:mb-4 relative">
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

          {/* Etiqueta de rebaja */}
          {on_sale && discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              -{discountPercentage}%
            </div>
          )}
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
            {/* Precio con rebaja */}
            {on_sale && sale_price ? (
              <>
                <p className={cn("text-red-600 font-bold", compact ? "text-sm md:text-base" : "text-base md:text-lg")}>
                  {formatPrice(sale_price)}
                </p>
                <p
                  className={cn("text-gray-500 line-through", compact ? "text-xs md:text-sm" : "text-sm md:text-base")}
                >
                  {formatPrice(price)}
                </p>
              </>
            ) : (
              <p
                className={cn(
                  "text-accent-orange font-bold",
                  compact ? "text-sm md:text-base" : "text-base md:text-lg",
                )}
              >
                {formatPrice(price)}
              </p>
            )}
          </div>

          <span className="sr-only">Categoría: {category}</span>
        </div>
      </article>
    </Link>
  )
})

export default ProductCard
