"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Calendar, Users, Clock } from "lucide-react"
import { formatPrice, formatDate } from "@/lib/utils"
import Button from "@/components/ui/button"
import LoadingSkeleton from "@/components/loading-skeleton"
import type { ArticuloEnCamino } from "@/lib/types"

interface ArticuloEnCaminoCardProps {
  articulo: ArticuloEnCamino
}

function ArticuloEnCaminoCard({ articulo }: ArticuloEnCaminoCardProps) {
  const availableSpots = articulo.preorder_limit - articulo.preorder_count
  const progressPercentage = (articulo.preorder_count / articulo.preorder_limit) * 100

  const handlePreorder = () => {
    // TODO: Implementar lógica de preventa
    console.log("Preorder:", articulo.id)
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-[3/4] bg-gray-100">
        <Image
          src={articulo.image_url || "/placeholder.svg?height=400&width=300&query=preorder product"}
          alt={articulo.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <div className="absolute top-2 left-2 bg-accent-orange text-white px-2 py-1 rounded text-xs font-medium">
          PREVENTA
        </div>
        {availableSpots <= 5 && availableSpots > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
            ¡Últimas {availableSpots}!
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{articulo.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{articulo.description}</p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Llegada estimada: {formatDate(articulo.estimated_arrival)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>
              {articulo.preorder_count}/{articulo.preorder_limit} reservados
            </span>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-accent-orange h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-accent-orange">{formatPrice(articulo.price)}</span>
          <Button
            onClick={handlePreorder}
            disabled={availableSpots === 0}
            size="sm"
            className={availableSpots === 0 ? "opacity-50 cursor-not-allowed" : ""}
          >
            {availableSpots === 0 ? "Agotado" : "Reservar"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ArticulosEnCamino() {
  const [articulos, setArticulos] = useState<ArticuloEnCamino[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchArticulos() {
      try {
        const response = await fetch("/api/vip/articulos-en-camino")
        if (response.ok) {
          const data = await response.json()
          setArticulos(data)
        }
      } catch (error) {
        console.error("Error fetching articulos en camino:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticulos()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="h-8 w-64 bg-gray-200 rounded mx-auto mb-2 animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 rounded mx-auto animate-pulse" />
        </div>
        <LoadingSkeleton count={3} compact />
      </div>
    )
  }

  if (articulos.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No hay artículos en camino</h3>
        <p className="text-gray-600">Pronto tendremos nuevos productos en preventa</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Artículos en Camino</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Reserva los próximos lanzamientos antes que nadie. Productos exclusivos con entrega garantizada.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articulos.map((articulo) => (
          <ArticuloEnCaminoCard key={articulo.id} articulo={articulo} />
        ))}
      </div>
    </div>
  )
}
