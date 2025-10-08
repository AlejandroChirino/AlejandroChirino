"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type { MundoLaFashionItem } from "@/lib/types"

interface MoodboardBlockProps {
  item: MundoLaFashionItem
}

export default function MoodboardBlock({ item }: MoodboardBlockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Create a masonry-like layout
  const getImageClass = (index: number) => {
    const patterns = [
      "md:col-span-2 md:row-span-2", // Large
      "md:col-span-1 md:row-span-1", // Small
      "md:col-span-1 md:row-span-2", // Tall
      "md:col-span-2 md:row-span-1", // Wide
      "md:col-span-1 md:row-span-1", // Small
      "md:col-span-1 md:row-span-1", // Small
    ]
    return patterns[index % patterns.length]
  }

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">{item.titulo}</h2>
          {item.descripcion && (
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">{item.descripcion}</p>
          )}
        </div>

        {/* Moodboard Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-4">
          {item.imagenes.map((imagen, index) => (
            <div
              key={index}
              className={cn(
                "relative bg-gray-200 rounded-lg overflow-hidden cursor-pointer group",
                getImageClass(index),
              )}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Image
                src={imagen || "/placeholder.svg"}
                alt={`${item.titulo} - Moodboard ${index + 1}`}
                fill
                className={cn(
                  "object-cover transition-all duration-700",
                  hoveredIndex === index ? "scale-110" : "scale-100",
                )}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div
                className={cn(
                  "absolute inset-0 transition-all duration-300",
                  hoveredIndex === index
                    ? "bg-gradient-to-t from-black/60 via-transparent to-transparent"
                    : "bg-black/0",
                )}
              />

              {/* Hover effect */}
              <div
                className={cn(
                  "absolute bottom-4 left-4 right-4 text-white transform transition-all duration-300",
                  hoveredIndex === index ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                )}
              >
                <div className="text-sm font-medium">Inspiración #{index + 1}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
