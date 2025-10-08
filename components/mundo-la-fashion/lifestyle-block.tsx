import Image from "next/image"
import { Coffee, Camera, Music } from "lucide-react"
import type { MundoLaFashionItem } from "@/lib/types"

interface LifestyleBlockProps {
  item: MundoLaFashionItem
}

export default function LifestyleBlock({ item }: LifestyleBlockProps) {
  const icons = [Coffee, Camera, Music]

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">{item.titulo}</h2>
          {item.descripcion && (
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">{item.descripcion}</p>
          )}
        </div>

        {/* Lifestyle Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {item.imagenes.map((imagen, index) => {
            const Icon = icons[index % icons.length]
            return (
              <div key={index} className="group">
                <div className="relative aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden mb-6">
                  <Image
                    src={imagen || "/placeholder.svg"}
                    alt={`${item.titulo} - Lifestyle ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Icon overlay */}
                  <div className="absolute bottom-6 left-6">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <Icon className="h-6 w-6 text-gray-900" />
                    </div>
                  </div>
                </div>

                {/* Caption */}
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">
                    {index === 0 && "Mañana"}
                    {index === 1 && "Tarde"}
                    {index === 2 && "Noche"}
                  </h3>
                  <p className="text-gray-600">
                    {index === 0 && "Comenzar el día con estilo"}
                    {index === 1 && "Capturar momentos únicos"}
                    {index === 2 && "Vivir la noche urbana"}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
