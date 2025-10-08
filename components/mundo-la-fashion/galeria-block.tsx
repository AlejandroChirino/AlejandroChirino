"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Expand } from "lucide-react"
import type { MundoLaFashionItem } from "@/lib/types"

interface GaleriaBlockProps {
  item: MundoLaFashionItem
}

export default function GaleriaBlock({ item }: GaleriaBlockProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % item.imagenes.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? item.imagenes.length - 1 : prev - 1))
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">{item.titulo}</h2>
          {item.descripcion && (
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">{item.descripcion}</p>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {item.imagenes.map((imagen, index) => (
            <div
              key={index}
              className="group relative aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => {
                setCurrentIndex(index)
                setIsModalOpen(true)
              }}
            >
              <Image
                src={imagen || "/placeholder.svg"}
                alt={`${item.titulo} - Imagen ${index + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                  <Expand className="h-4 w-4 text-gray-900" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-full">
              <Image
                src={item.imagenes[currentIndex] || "/placeholder.svg"}
                alt={`${item.titulo} - Imagen ${currentIndex + 1}`}
                width={800}
                height={1000}
                className="object-contain max-h-[90vh]"
              />

              {/* Navigation */}
              {item.imagenes.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Close button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-xl"
              >
                ×
              </button>

              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {item.imagenes.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
