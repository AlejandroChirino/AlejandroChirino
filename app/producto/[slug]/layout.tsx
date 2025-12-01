import type React from "react"
import type { Metadata } from "next"
import { supabase } from "@/lib/supabaseClient"

interface ProductLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params
    const resp = await supabase
      .from("products")
      .select("name, description, price, image_url, image_urls, category")
      .eq("id", slug)
      .eq("archived", false)
      .single()

    const product = resp.data as
      | { name?: string; description?: string | null; image_url?: string | null; image_urls?: string[] }
      | null

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
        images: product && product.image_urls && product.image_urls.length > 0 ? product.image_urls : product.image_url ? [product.image_url] : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: product.description || `Compra ${product.name} en La L Fashion`,
        images: product && product.image_urls && product.image_urls.length > 0 ? product.image_urls : product.image_url ? [product.image_url] : [],
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
