"use client"

import { useState } from "react"
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

  const nextImage = () => {
    onImageChange((activeIndex + 1) % images.length)
  }

  const prevImage = () => {
    onImageChange(activeIndex === 0 ? images.length - 1 : activeIndex - 1)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Image */}
      <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden group">
        <Image
          src={currentImage || "/placeholder.svg"}
          alt={`${productName} - Imagen ${activeIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 60vw"
          priority
        />

        {/* Navigation arrows - Desktop */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Zoom button */}
        <button
          onClick={() => setIsZoomed(true)}
          className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Ampliar imagen"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        {/* Mobile swipe indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 md:hidden">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => onImageChange(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === activeIndex ? "bg-white" : "bg-white/50",
                )}
                aria-label={`Ver imagen ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails - Desktop */}
      {images.length > 1 && (
        <div className="hidden md:grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onImageChange(index)}
              className={cn(
                "relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors",
                index === activeIndex ? "border-accent-orange" : "border-transparent hover:border-gray-300",
              )}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${productName} - Miniatura ${index + 1}`}
                fill
                className="object-cover"
                sizes="150px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={currentImage || "/placeholder.svg"}
              alt={`${productName} - Ampliada`}
              width={800}
              height={1000}
              className="object-contain max-h-[90vh]"
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
