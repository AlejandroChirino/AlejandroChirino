"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, Users, ExternalLink } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Breadcrumbs from "@/components/breadcrumbs"
import ProductCard from "@/components/product-card"
import ColaboracionCarousel from "@/components/colaboracion-carousel"
import LoadingSkeleton from "@/components/loading-skeleton"
import Button from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import type { Colaboracion, Product } from "@/lib/types"

interface ColaboracionPageProps {
  params: { slug: string }
}

export default function ColaboracionPage({ params }: ColaboracionPageProps) {
  const [colaboracion, setColaboracion] = useState<Colaboracion | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch colaboracion details
        const colaboracionResponse = await fetch(`/api/colaboraciones/${params.slug}`)
        if (colaboracionResponse.status === 404) {
          notFound()
        }
        if (colaboracionResponse.ok) {
          const colaboracionData = await colaboracionResponse.json()
          setColaboracion(colaboracionData)
        }

        // Fetch products
        const productsResponse = await fetch(`/api/colaboraciones/${params.slug}/productos`)
        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          setProducts(productsData)
        }
      } catch (error) {
        console.error("Error fetching colaboracion data:", error)
      } finally {
        setLoading(false)
        setProductsLoading(false)
      }
    }

    fetchData()
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="animate-pulse space-y-8">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="aspect-[4/5] bg-gray-200 rounded-lg" />
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-20 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!colaboracion) {
    notFound()
  }

  const breadcrumbItems = [{ label: "colaboraciones", href: "/colaboraciones" }, { label: colaboracion.nombre }]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} className="mb-8" />

          {/* Back button */}
          <Link
            href="/colaboraciones"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a colaboraciones
          </Link>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Gallery */}
            <div>
              <ColaboracionCarousel images={colaboracion.imagenes} title={colaboracion.nombre} />
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{colaboracion.nombre}</h1>
                <p className="text-lg text-gray-600 leading-relaxed">{colaboracion.descripcion}</p>
              </div>

              {/* Meta info */}
              <div className="space-y-3 py-6 border-y border-gray-200">
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="h-5 w-5" />
                  <span>Publicado el {formatDate(colaboracion.created_at)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Users className="h-5 w-5" />
                  <span>{products.length} productos en esta colaboración</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-green-600 font-medium">Colaboración activa</span>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-4">
                <p className="text-gray-600">
                  Descubre todos los productos seleccionados especialmente para esta colaboración.
                </p>
                <Button
                  onClick={() => {
                    document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" })
                  }}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  Ver productos
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>

              {/* Social sharing */}
              <div className="pt-6">
                <p className="text-sm text-gray-500 mb-3">Compartir esta colaboración:</p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Facebook
                  </button>
                  <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm">
                    Instagram
                  </button>
                  <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm">
                    Twitter
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products section */}
          <section id="productos">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Productos de la Colaboración</h2>
                <p className="text-gray-600">
                  {products.length} producto{products.length !== 1 ? "s" : ""} seleccionado
                  {products.length !== 1 ? "s" : ""} especialmente
                </p>
              </div>
            </div>

            {productsLoading ? (
              <LoadingSkeleton count={8} compact />
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No hay productos asociados</h3>
                <p className="text-gray-600 mb-6">Esta colaboración aún no tiene productos vinculados</p>
                <Link href="/colaboraciones">
                  <Button variant="outline">Ver otras colaboraciones</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} compact />
                ))}
              </div>
            )}
          </section>

          {/* Related collaborations */}
          <section className="mt-16 pt-16 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-8">Otras Colaboraciones</h2>
            <div className="text-center py-8">
              <Link href="/colaboraciones">
                <Button variant="outline" size="lg">
                  Ver todas las colaboraciones
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
