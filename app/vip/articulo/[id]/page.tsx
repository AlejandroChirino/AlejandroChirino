import { formatDate, formatPrice } from "@/lib/utils"
// ReserveWhatsappButton is a client component; import directly so Next bundles it as client
import ReserveWhatsappButton from "@/components/reserve-whatsapp-button"
import { createServerClient } from "@/lib/supabase/server"
import Image from "next/image"
import Link from "next/link"
import { redirect, notFound } from "next/navigation"

interface Props {
  params: { id: string }
}

export default async function Page({ params }: Props) {
  const { id } = params
  const supabase = await createServerClient()

  // Buscar artículo en articulos_en_camino (usa cliente de servidor para respetar sesión)
  const { data: articulo, error } = await supabase.from("articulos_en_camino").select("*").eq("id", id).maybeSingle()

  if (error) {
    console.error("Error fetching articulo en camino:", error)
    return notFound()
  }

  if (!articulo) {
    return notFound()
  }

  // Si el artículo refiere a un producto existente, redirigimos a la página del producto
  if (articulo.product_id) {
    const { data: product } = await supabase.from("products").select("id").eq("id", articulo.product_id).maybeSingle()
    if (product) {
      return redirect(`/producto/${product.id}`)
    }
  }

  // Renderizamos la ficha del artículo en camino
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg overflow-hidden">
        <div className="relative aspect-[3/4] bg-gray-100">
          <Image
            src={articulo.image_url || "/placeholder.svg?height=600&width=400&query=preorder"}
            alt={articulo.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="p-6 text-black">
          <h1 className="text-2xl font-bold mb-2">{articulo.name}</h1>
          <p className="text-gray-700 mb-4">{articulo.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <div className="text-sm text-gray-500">Llegada estimada</div>
              <div className="font-medium">{formatDate(articulo.estimated_arrival)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Stock de preventa</div>
              <div className="font-medium">{articulo.preorder_count}/{articulo.preorder_limit}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Precio estimado</div>
              <div className="font-medium">
                {formatPrice(articulo.price)}
                <div className="text-xs text-gray-500 mt-1">El precio puede variar</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <ReserveWhatsappButton articuloId={articulo.id} articuloName={articulo.name} price={articulo.price} estimatedArrival={articulo.estimated_arrival} phoneTo="5352434599" />
            </div>
            <div>
              <Link href="/vip/area" className="text-gray-600">Volver al área VIP</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
