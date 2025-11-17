"use client"

import { useState, useEffect } from "react"
import { Suspense } from "react"
// Header provisto por RootLayout
import Footer from "@/components/footer"
import ColaboracionCard from "@/components/colaboracion-card"
import LoadingSkeleton from "@/components/loading-skeleton"
import { Camera, Sparkles } from "lucide-react"
import type { ColaboracionWithProducts } from "@/lib/types"

// Componente para cargar colaboraciones
function ColaboracionesList() {
  const [colaboraciones, setColaboraciones] = useState<ColaboracionWithProducts[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchColaboraciones() {
      try {
        const response = await fetch("/api/colaboraciones?includeProducts=true")
        if (response.ok) {
          const data = await response.json()
          setColaboraciones(data)
        }
      } catch (error) {
        console.error("Error fetching colaboraciones:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchColaboraciones()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Featured skeleton */}
        <div className="bg-gray-200 rounded-lg h-96 animate-pulse" />
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (colaboraciones.length === 0) {
    return (
      <div className="text-center py-16">
        <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No hay colaboraciones disponibles</h3>
        <p className="text-gray-600">Pronto tendremos nuevas colaboraciones con influencers</p>
      </div>
    )
  }

  // Separar colaboraciones destacadas y regulares
  const featuredColaboraciones = colaboraciones.filter((c) => c.featured)
  const regularColaboraciones = colaboraciones.filter((c) => !c.featured)

  return (
    <div className="space-y-12">
      {/* Colaboraciones destacadas */}
      {featuredColaboraciones.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-6 w-6 text-accent-orange" />
            <h2 className="text-2xl font-bold">Colaboraciones Destacadas</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredColaboraciones.map((colaboracion) => (
              <ColaboracionCard key={colaboracion.id} colaboracion={colaboracion} featured />
            ))}
          </div>
        </section>
      )}

      {/* Todas las colaboraciones */}
      {regularColaboraciones.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-8">Todas las Colaboraciones</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularColaboraciones.map((colaboracion) => (
              <ColaboracionCard key={colaboracion.id} colaboracion={colaboracion} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default function ColaboracionesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header ya incluido en el layout raíz */}

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-orange to-orange-600 rounded-full mb-6">
              <Camera className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              COLABORACIONES DE MODA
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Descubre las colaboraciones exclusivas con los influencers más destacados del mundo de la moda. Cada
              colaboración cuenta una historia única a través de nuestros productos.
            </p>
          </div>

          {/* Stats bar */}
          <div className="bg-gray-50 rounded-lg p-6 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-accent-orange mb-1">15+</div>
                <div className="text-gray-600">Influencers colaboradores</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent-orange mb-1">50+</div>
                <div className="text-gray-600">Productos únicos</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent-orange mb-1">1M+</div>
                <div className="text-gray-600">Visualizaciones totales</div>
              </div>
            </div>
          </div>

          {/* Colaboraciones */}
          <Suspense fallback={<LoadingSkeleton count={6} />}>
            <ColaboracionesList />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  )
}
