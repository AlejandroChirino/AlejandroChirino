"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  images: string[]
  productName: string
  activeIndex: number
  onImageChange: (index: number) => void
  className?: string
}

export default function ProductGallery({
  images,
  productName,
  activeIndex,
  onImageChange,
  className = "",
}: ProductGalleryProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const currentImage = images[activeIndex] || "/placeholder.svg?height=600&width=600&query=product"

  const mobileTrackRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    try {
      console.debug("[ProductGallery] images:", images)
    } catch (e) {}
  }, [images])

  const scrollToIndex = (i: number) => {
    const track = mobileTrackRef.current
    if (!track) return
    const child = track.children[i] as HTMLElement | undefined
    if (child) child.scrollIntoView({ behavior: "smooth", inline: "center" })
    onImageChange(i)
  }

  const nextImage = () => {
    onImageChange((activeIndex + 1) % images.length)
  }

  const prevImage = () => {
    onImageChange(activeIndex === 0 ? images.length - 1 : activeIndex - 1)
  }

  return (
    <div className={cn("space-y-2 w-full px-0", className)}>
      {/* Mobile: edge-to-edge horizontal carousel with peek */}
      <div className="md:hidden relative left-1/2 -translate-x-1/2 w-screen">
        <div
          ref={mobileTrackRef}
          className="flex items-start overflow-x-auto snap-x snap-mandatory px-0 gap-0 touch-pan-x scrollbar-hidden"
        >
          {images.map((img, index) => (
            <div
              key={index}
              className={`relative w-screen aspect-[3/4] flex-shrink-0 snap-center overflow-hidden ${
                index !== images.length - 1 ? "border-r border-gray-200" : ""
              }`}
              aria-hidden={index !== activeIndex}
            >
              <img
                src={img || "/placeholder.svg"}
                alt={`${productName} - Imagen ${index + 1}`}
                className="w-full h-full object-cover block"
                onClick={() => setIsZoomed(true)}
              />
            </div>
          ))}
        </div>

        {/* Pagination dots (bottom-left) */}
        <div className="absolute left-4 bottom-2">
          <div className="flex items-center space-x-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                className={cn(
                  "rounded-full transition-colors",
                  i === activeIndex ? "w-2 h-2 bg-gray-300" : "w-1.5 h-1.5 bg-gray-200"
                )}
                aria-label={`Ver imagen ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: single image with arrows and thumbnails */}
      <div className="hidden md:block">
          <div className="relative aspect-[3/4] bg-gray-100 rounded-none overflow-hidden group">
          <Image
            src={currentImage || "/placeholder.svg?height=600&width=600&query=product"}
            alt={`${productName} - Imagen ${activeIndex + 1}`}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          <button
            onClick={() => setIsZoomed(true)}
            className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Ampliar imagen"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        {/* Thumbnails - Desktop */}
        {images.length > 1 && (
          <div className="mt-2 grid grid-cols-4 gap-1">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => onImageChange(index)}
                className={cn(
                    "relative aspect-square bg-gray-100 rounded-none overflow-hidden border-2 transition-colors",
                    index === activeIndex ? "border-accent-orange" : "border-transparent hover:border-gray-300",
                  )}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${productName} - Miniatura ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={currentImage || "/placeholder.svg"}
              alt={`${productName} - Ampliada`}
              className="object-contain max-h-[90vh]"
              style={{ maxWidth: "800px", maxHeight: "1000px" }}
            />
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 rounded-full p-2 text-white"
              aria-label="Cerrar zoom"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
