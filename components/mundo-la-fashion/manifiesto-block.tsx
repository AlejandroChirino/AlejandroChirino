import Image from "next/image"
import type { MundoLaFashionItem } from "@/lib/types"

interface ManifiestoBlockProps {
  item: MundoLaFashionItem
}

export default function ManifiestoBlock({ item }: ManifiestoBlockProps) {
  return (
    <section className="py-20 px-4 bg-black text-white relative overflow-hidden">
      {/* Background image */}
      {item.imagenes[0] && (
        <div className="absolute inset-0">
          <Image
            src={item.imagenes[0] || "/placeholder.svg"}
            alt={item.titulo}
            fill
            className="object-cover opacity-30"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
        </div>
      )}

      <div className="relative max-w-4xl mx-auto text-center">
        <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter">{item.titulo}</h2>
        {item.descripcion && (
          <p className="text-xl md:text-3xl leading-relaxed font-light tracking-wide">{item.descripcion}</p>
        )}

        {/* Decorative elements */}
        <div className="mt-12 flex justify-center">
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-white to-transparent" />
        </div>
      </div>
    </section>
  )
}
