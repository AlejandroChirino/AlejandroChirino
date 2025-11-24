"use client"

import Link from "next/link"
import Image from "next/image"
import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { formatDate, formatPrice } from "@/lib/utils"
import type { ArticuloEnCamino } from "@/lib/types"

interface CarouselArticuloCardProps {
  articulo: ArticuloEnCamino
  isMobile?: boolean
}

export default function CarouselArticuloCard({ articulo, isMobile = false }: CarouselArticuloCardProps) {
  const router = useRouter()

  const handleNavigate = useCallback(() => {
    router.push(`/vip/articulo/${articulo.id}`)
  }, [router, articulo.id])

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      router.push(`/vip/articulo/${articulo.id}`)
    }
  }, [router, articulo.id])

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={handleKey}
      className={`group block focus:outline-none transition-all duration-300 rounded-none ${!isMobile ? "hover:scale-105 hover:shadow-lg" : ""}`}
      aria-label={`Ver detalles de ${articulo.name}`}
    >
      <article className="h-full relative">
        <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-2 md:mb-3 relative rounded-none">
          <Image
            src={articulo.image_url || "/placeholder.svg?height=400&width=300&query=preorder"}
            alt={articulo.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
            loading="lazy"
          />
          <span className="absolute top-2 left-2 bg-accent-orange text-white text-xs md:text-sm font-bold px-2 py-1">
            PREVENTA
          </span>
        </div>

        <div className="space-y-1 text-black">
          <h3 className="font-medium text-gray-900 line-clamp-2 text-xs md:text-sm">{articulo.name}</h3>
          <p className="text-gray-600 text-sm md:text-sm line-clamp-2">{articulo.description}</p>

          <div className="mt-2 text-sm text-gray-600">Llegada estimada: <span className="font-medium text-gray-800">{formatDate(articulo.estimated_arrival)}</span></div>
          <p className="text-accent-orange font-bold text-sm md:text-base mt-2">{formatPrice(articulo.price)}</p>
        </div>

        {/* Reservar button posicionada abajo a la derecha similar a product carousel */}
        {!isMobile && (
          <div className="absolute bottom-2 right-2" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <Link href={`/checkout?preorder=${articulo.id}`} aria-label={`Reservar ${articulo.name}`} className="inline-flex items-center justify-center bg-emerald-600 text-white px-3 py-2 text-sm font-medium shadow-md hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-none">
              Reservar
            </Link>
          </div>
        )}
      </article>
    </div>
  )
}
