import { cn } from "@/lib/utils"
import Link from "next/link"
import { ExternalLink, Users } from "lucide-react"
import ColaboracionCarousel from "./colaboracion-carousel"
import Button from "@/components/ui/button"
import type { ColaboracionWithProducts } from "@/lib/types"

interface ColaboracionCardProps {
  colaboracion: ColaboracionWithProducts
  featured?: boolean
}

export default function ColaboracionCard({ colaboracion, featured = false }: ColaboracionCardProps) {
  const { nombre, descripcion, imagenes, slug, product_count } = colaboracion

  return (
    <article
      className={cn(
        "bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300",
        featured && "md:col-span-2 lg:col-span-2",
      )}
    >
      <div className={cn("grid gap-6 p-6", featured ? "md:grid-cols-2" : "")}>
        {/* Carousel */}
        <div className={cn(featured ? "order-1 md:order-1" : "")}>
          <ColaboracionCarousel images={imagenes} title={nombre} />
        </div>

        {/* Content */}
        <div className={cn("space-y-4", featured ? "order-2 md:order-2 flex flex-col justify-center" : "")}>
          <div>
            <h3 className={cn("font-bold text-gray-900 mb-2", featured ? "text-2xl md:text-3xl" : "text-xl")}>
              {nombre}
            </h3>
            <p className={cn("text-gray-600 leading-relaxed", featured ? "text-lg" : "text-sm")}>{descripcion}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{product_count} productos</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Activa</span>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <Link href={`/colaboraciones/${slug}`}>
              <Button className={cn("group", featured ? "w-full md:w-auto" : "w-full")} size={featured ? "lg" : "md"}>
                Ver productos
                <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
