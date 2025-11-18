"use client"

import { useState, useEffect } from "react"
import { Suspense } from "react"
// Header provisto por RootLayout
import Footer from "@/components/footer"
import ContentRenderer from "@/components/mundo-la-fashion/content-renderer"
import { Sparkles, Filter } from "lucide-react"
import type { MundoLaFashionItem } from "@/lib/types"

// Loading component
function ContentSkeleton() {
  return (
    <div className="space-y-16">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="text-center mb-12">
            <div className="h-12 w-64 bg-gray-200 rounded mx-auto mb-4" />
            <div className="h-6 w-96 bg-gray-200 rounded mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="aspect-[4/5] bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Main content component
function MundoContent() {
  const [items, setItems] = useState<MundoLaFashionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    async function fetchContent() {
      try {
        const params = new URLSearchParams()
        if (filter !== "all") {
          params.append("tipo_contenido", filter)
        }

        const response = await fetch(`/api/mundo-la-fashion?${params}`)
        if (response.ok) {
          const data = await response.json()
          setItems(data)
        }
      } catch (error) {
        console.error("Error fetching mundo la fashion content:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [filter])

  const filterOptions = [
    { value: "all", label: "Todo" },
    { value: "galeria", label: "Galerías" },
    { value: "manifiesto", label: "Manifiestos" },
    { value: "moodboard", label: "Moodboards" },
    { value: "lifestyle", label: "Lifestyle" },
    { value: "texto", label: "Textos" },
  ]

  if (loading) {
    return <ContentSkeleton />
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Contenido en desarrollo</h3>
        <p className="text-gray-600">Pronto tendremos contenido editorial increíble</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {/* Filter bar */}
      <div className="sticky top-28 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 overflow-x-auto">
            <Filter className="h-5 w-5 text-gray-500 flex-shrink-0" />
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === option.value ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content blocks */}
      {items.map((item, index) => (
        <div key={item.id} className={index > 0 ? "border-t border-gray-100" : ""}>
          <ContentRenderer item={item} />
        </div>
      ))}
    </div>
  )
}

export default function MundoLaFashionPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header ya incluido en el layout raíz */}

      <main>
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920&query=urban fashion background')] bg-cover bg-center opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80" />
          </div>

          <div className="relative text-center max-w-5xl mx-auto px-4">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-accent-orange to-orange-600 rounded-full mb-8">
                <span className="text-3xl">⚡</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter">
              EL MUNDO DE
              <br />
              <span className="bg-gradient-to-r from-accent-orange to-orange-400 bg-clip-text text-transparent">
                LA L FASHION
              </span>
            </h1>

            <p className="text-xl md:text-2xl font-light leading-relaxed max-w-3xl mx-auto mb-8">
              Sumérgete en nuestro universo creativo. Donde la moda se encuentra con el arte, la cultura urbana y la
              expresión personal.
            </p>

            <div className="flex justify-center">
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-white to-transparent" />
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
            </div>
          </div>
        </section>

        {/* Main content */}
        <Suspense fallback={<ContentSkeleton />}>
          <MundoContent />
        </Suspense>

        {/* Call to action */}
        <section className="py-20 px-4 bg-black text-white text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black mb-6">ÚNETE AL MOVIMIENTO</h2>
            <p className="text-xl mb-8 font-light">
              Sigue nuestras redes sociales para más contenido exclusivo y behind the scenes
            </p>
            <div className="flex justify-center gap-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full font-medium hover:scale-105 transition-transform"
              >
                Instagram
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-white text-black rounded-full font-medium hover:scale-105 transition-transform"
              >
                TikTok
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
