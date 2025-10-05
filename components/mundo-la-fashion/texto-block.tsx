import Image from "next/image"
import { Quote } from "lucide-react"
import type { MundoLaFashionItem } from "@/lib/types"

interface TextoBlockProps {
  item: MundoLaFashionItem
}

export default function TextoBlock({ item }: TextoBlockProps) {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="order-2 lg:order-1">
            <div className="mb-6">
              <Quote className="h-12 w-12 text-accent-orange mb-4" />
              <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight leading-tight">{item.titulo}</h2>
            </div>
            {item.descripcion && (
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-light">{item.descripcion}</p>
            )}

            {/* Signature */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">— La L Fashion Team</p>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2">
            {item.imagenes[0] && (
              <div className="relative aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden">
                <Image
                  src={item.imagenes[0] || "/placeholder.svg"}
                  alt={item.titulo}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
