"use client"

import { useState, useEffect } from "react"
import {
  Crown,
  Zap,
  Gift,
  Headphones,
  Heart,
  Calendar,
  Truck,
  ShoppingBag,
  Scissors,
  Phone,
  Tag,
  RefreshCw,
} from "lucide-react"
import Image from "next/image"
import { formatPrice, formatDate } from "@/lib/utils"

export default function VipBenefits() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [showCarousel, setShowCarousel] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [articulos, setArticulos] = useState<any[]>([])
  const [loadingArticulos, setLoadingArticulos] = useState(false)

  useEffect(() => {
    if (!showCarousel) return
    let mounted = true
    ;(async () => {
      try {
        setLoadingArticulos(true)
        const res = await fetch("/api/vip/articulos-en-camino?limit=10")
        if (!res.ok) throw new Error("fetch failed")
        const data = await res.json()
        if (mounted) setArticulos(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Error loading articulos en camino:", err)
        if (mounted) setArticulos([])
      } finally {
        if (mounted) setLoadingArticulos(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [showCarousel])

  const benefits = [
    {
      category: "Exclusividad Anticipada",
      subtitle: "⚡ Lanzamientos Anticipados",
      title: "Lanzamientos Anticipados",
      description: "Sé el primero en acceder a nuevas colecciones (Ver la ropa antes que nadie).",
      icon: Zap,
    },
    {
      category: "Exclusividad Anticipada",
      subtitle: "📅 Preventa Prioritaria",
      title: "Preventa Prioritaria",
      description: "Reserva productos antes de su lanzamiento oficial.",
      icon: Calendar,
    },
    {
      category: "Prioridad Máxima",
      subtitle: "🚚 Prioridad en Logística",
      title: "Prioridad en Logística",
      description:
        "Tu pedido es el primero en ser entregado en la ruta de envío si el repartidor tiene múltiples domicilios pendientes.",
      icon: Truck,
    },
    {
      category: "Prioridad Máxima",
      subtitle: "🚪 Prioridad en Tienda Física",
      title: "Prioridad en Tienda Física",
      description:
        "Acceso prioritario en la tienda: si hay una cola, serás priorizado inmediatamente para la atención en caja o con un asesor.",
      icon: ShoppingBag,
    },
    {
      category: "Servicio y Lujo",
      subtitle: "👔 Asesoría de Estilo Exclusiva",
      title: "Asesoría de Estilo Exclusiva",
      description:
        "Acceso a una cita virtual con un estilista de LA FASHION. Incluye una primera alteración (ajuste de sastrería) gratuita o con descuento en artículos seleccionados.",
      icon: Scissors,
    },
    {
      category: "Servicio y Lujo",
      subtitle: "📞 Atención Personalizada",
      title: "Atención Personalizada",
      description: "Soporte directo y dedicado por WhatsApp las 24 horas.",
      icon: Phone,
    },
    {
      category: "Recompensas y Regalos",
      subtitle: "🎁 Recompensas Exclusivas",
      title: "Recompensas Exclusivas",
      description: "Un crédito de tienda de ($3500) para el mes de tu cumpleaños o un obsequio sorpresa incluido en tu próximo pedido.",
      icon: Gift,
    },
    {
      category: "Recompensas y Regalos",
      subtitle: "💰 Descuentos Especiales",
      title: "Descuentos Especiales",
      description: "Ofertas exclusivas y promociones personalizadas.",
      icon: Tag,
    },
    {
      category: "Flexibilidad Premium",
      subtitle: "🔄 Garantía de Satisfacción Extendida",
      title: "Garantía de Satisfacción Extendida",
      description: "Plazo de devolución de 3 dias.",
      icon: RefreshCw,
    },
  ]

  return (
    <div className="bg-black text-white rounded-2xl p-8 my-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-transparent rounded-full mb-4">
          <Crown className="h-8 w-8 text-green-400" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Beneficios Exclusivos VIP</h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Disfruta de una experiencia de compra única con acceso a productos exclusivos, descuentos especiales y
          atención personalizada.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon
          const isOpen = openIndex === index
          return (
            <div key={index} className="bg-neutral-900/40 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full">
                  <Icon className="h-6 w-6 text-green-400" />
                </div>
                <div className="flex-1 text-left">
                  {/** Mostrar la categoría como título principal (ej: "Exclusividad Anticipada") */}
                  <h3 className="text-white mt-1 text-lg font-semibold">
                    {benefit.category.replace(" / ", " ")}
                  </h3>
                  {/** Subtítulo más liviano debajo (ej: "Lanzamientos Anticipados") */}
                  <div className="text-gray-300 text-sm font-light mt-1">{benefit.subtitle}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="text-green-400 font-extralight text-sm"
                >
                  {isOpen ? "ocultar" : "conocer más"}
                </button>
              </div>

              {isOpen && (
                <div className="mt-3 text-gray-200 text-sm leading-relaxed">
                  {benefit.description}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Botón principal: Acceder al área VIP (más grande, sin borde) */}
      <div className="text-center mt-8">
        <a
          href="/vip/area"
          className="text-green-400 font-light text-base px-6 py-3 rounded-md bg-white/2 hover:bg-white/4 transition inline-block"
        >
          Acceder al área VIP
        </a>
      </div>

      {/* Botón de contacto (más pequeño) */}
      <div className="text-center mt-4">
        <a
          href="https://wa.me/1234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 px-3 py-2 rounded-md text-sm transition-colors"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
          </svg>
          <span className="sr-only">Contacto VIP WhatsApp</span>
          <span>Contacto VIP</span>
        </a>
      </div>

      {/* Modal / Carrusel */}
      {showCarousel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-5xl mx-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-white text-2xl font-semibold">Área VIP — Lanzamientos & Preventa</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCarousel(false)}
                  className="text-gray-300 text-sm px-3 py-1 rounded hover:bg-white/5"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="mt-4">
              {loadingArticulos ? (
                <div className="text-center py-12 text-gray-400">Cargando artículos...</div>
              ) : articulos.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No hay artículos en camino</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  <div className="col-span-1 flex flex-col items-center gap-4">
                    <button
                      onClick={() => setCarouselIndex((i) => (i - 1 + articulos.length) % articulos.length)}
                      className="text-green-400 px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
                    >
                      Anterior
                    </button>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    {/** Slide principal */}
                    {articulos[carouselIndex] && (
                      <div className="bg-white rounded-lg overflow-hidden text-black">
                        <div className="relative aspect-[3/4] bg-gray-100">
                          <Image
                            src={articulos[carouselIndex].image_url || "/placeholder.svg?height=400&width=300&query=preorder"}
                            alt={articulos[carouselIndex].name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-accent-orange text-white px-2 py-1 rounded text-xs font-medium">
                            PREVENTA
                          </div>
                        </div>

                        <div className="p-4">
                          <h4 className="font-semibold text-lg mb-2">{articulos[carouselIndex].name}</h4>
                          <p className="text-sm text-gray-700 mb-3 line-clamp-3">{articulos[carouselIndex].description}</p>

                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-gray-600">Llegada estimada</div>
                              <div className="text-base font-medium">{formatDate(articulos[carouselIndex].estimated_arrival)}</div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm text-gray-600">Precio</div>
                              <div className="text-xl font-bold text-accent-orange">{formatPrice(articulos[carouselIndex].price)}</div>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end">
                            <button className="bg-accent-orange text-white px-4 py-2 rounded">Reservar</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-span-1 flex flex-col items-center gap-4">
                    <button
                      onClick={() => setCarouselIndex((i) => (i + 1) % articulos.length)}
                      className="text-green-400 px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-400">{articulos.length > 0 ? `${carouselIndex + 1} / ${articulos.length}` : ""}</div>
          </div>
        </div>
      )}
    </div>
  )
}
