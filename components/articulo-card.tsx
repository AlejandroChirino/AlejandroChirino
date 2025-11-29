"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { formatDate, formatPrice } from "@/lib/utils"
import ReserveWhatsappButton from "./reserve-whatsapp-button"
import type { ArticuloEnCamino } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ArticuloCardProps {
  articulo: ArticuloEnCamino
}

export default function ArticuloCard({ articulo }: ArticuloCardProps) {
  const router = useRouter()

  const handleReserve = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Navegar a checkout con query param preorder
    router.push(`/checkout?preorder=${articulo.id}`)
  }

  return (
    <div className="group block focus-within:outline-none relative mx-0 mb-0 rounded-none bg-white">
      <Link href={`/vip/articulo/${articulo.id}`} className="block" aria-label={`Ver detalles de ${articulo.name}`}>
        <article className="h-full">
          <div className={cn("aspect-[3/4] bg-gray-100 overflow-hidden mb-0.5 md:mb-1 relative rounded-none")}>
            <Image
              src={articulo.image_url || "/placeholder.svg?height=400&width=300&query=preorder"}
              alt={articulo.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              loading="lazy"
            />

            <span className="absolute top-2 left-2 bg-accent-orange text-white text-xs md:text-sm font-bold px-2 py-1">PREVENTA</span>
          </div>

          <div className="pl-4 pr-4 md:pl-6 md:pr-6 py-2 text-black">
            {/* Nombre: máximo 2 líneas */}
            <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-accent-orange transition-colors text-sm md:text-sm">{articulo.name}</h3>
          </div>
        </article>
      </Link>

      {/* Footer: llegada estimada encima y precio etiquetado debajo (precio en verde) */}
      <div className="px-4 pb-3 md:px-6 md:pb-4">
        <div className="text-gray-500 text-xs mb-1">Llegada: <span className="text-gray-800 font-medium text-sm">{formatDate(articulo.estimated_arrival)}</span></div>

        <div className="text-sm text-emerald-600 font-semibold">Precio estimado: <span className="ml-1">{formatPrice(articulo.price)}</span></div>

        {/* Botón Reservar: usa ReserveWhatsappButton para enviar mensaje por WhatsApp */}
        <div className="mt-3">
          <ReserveWhatsappButton
            articuloId={articulo.id}
            articuloName={articulo.name}
            price={articulo.price}
            estimatedArrival={articulo.estimated_arrival}
            phoneTo="5352434599"
          />
        </div>
      </div>
    </div>
  )
}
