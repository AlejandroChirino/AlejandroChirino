import type React from "react"
import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"

interface ProductLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

type ProductMeta = {
  name?: string
  description?: string
  image_url?: string
  category?: string
  price?: number
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const { data } = await supabase
      .from("products")
      .select("name, description, price, image_url, category")
      .eq("id", slug)
      .single()
    const product = data as ProductMeta | null

    if (!product) {
      return {
        title: "Producto no encontrado - La L Fashion",
        description: "El producto que buscas no está disponible.",
      }
    }

    return {
      title: `${product.name} - La L Fashion`,
      description:
        product.description || `Compra ${product.name} en La L Fashion. Ropa y zapatos de calidad al mejor precio.`,
      openGraph: {
        title: product.name,
        description: product.description || `Compra ${product.name} en La L Fashion`,
        images: product.image_url ? [product.image_url] : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: product.description || `Compra ${product.name} en La L Fashion`,
        images: product.image_url ? [product.image_url] : [],
      },
    }
  } catch (error) {
    return {
      title: "Producto - La L Fashion",
      description: "Descubre nuestros productos de moda.",
    }
  }
}

export default function ProductLayout({ children }: ProductLayoutProps) {
  return children
}
