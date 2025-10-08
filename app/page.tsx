import { Suspense } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import LoadingSkeleton from "@/components/loading-skeleton"
import { supabase } from "@/lib/supabase"
import ProductCarousel from "@/components/product-carousel"

// Featured products component
async function FeaturedProducts() {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, price, image_url, category")
      .eq("featured", true)
      .limit(4)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching featured products:", error)
      return (
        <div className="text-center text-gray-500 py-8">
          <p>Error al cargar productos destacados</p>
        </div>
      )
    }

    if (!products || products.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8">
          <p>No hay productos destacados disponibles</p>
        </div>
      )
    }

    return <ProductCarousel products={products} title="Productos Destacados" autoPlay />
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Error al cargar productos destacados</p>
      </div>
    )
  }
}

async function AccessoriesPreview() {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, price, image_url, category")
      .eq("category", "accesorios")
      .limit(4)
      .order("created_at", { ascending: false })

    if (error || !products || products.length === 0) {
      return (
        <div className="text-center py-8">
          <a
            href="/accesorios"
            className="inline-block bg-accent-orange text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Ver Accesorios
          </a>
        </div>
      )
    }

    return (
      <div>
        <ProductCarousel products={products} />
        <div className="text-center mt-8">
          <a
            href="/accesorios"
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Ver Todos los Accesorios
          </a>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching accessories:", error)
    return null
  }
}

async function NewProductsPreview() {
  try {
    // Calcular la fecha de hace 7 días
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoISO = sevenDaysAgo.toISOString()

    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, price, image_url, category")
      .gte("created_at", sevenDaysAgoISO)
      .limit(4)
      .order("created_at", { ascending: false })

    if (error || !products || products.length === 0) {
      return (
        <div className="text-center py-8">
          <a
            href="/nuevo"
            className="inline-block bg-accent-orange text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Ver Novedades
          </a>
        </div>
      )
    }

    return (
      <div>
        <ProductCarousel products={products} />
        <div className="text-center mt-8">
          <a
            href="/nuevo"
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Ver Todas las Novedades
          </a>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching new products:", error)
    return null
  }
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main>
        {/* Hero section */}
        <section className="relative h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-4xl mx-auto px-4">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">La L Fashion</h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8">Ropa y Zapatos de Calidad</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/mujer"
                  className="inline-block bg-accent-orange text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Mujer
                </a>
                <a
                  href="/hombre"
                  className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Hombre
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* New products section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Novedades</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Descubre nuestros productos más recientes, añadidos en los últimos 7 días
              </p>
            </div>
            <Suspense fallback={<LoadingSkeleton count={4} compact />}>
              <NewProductsPreview />
            </Suspense>
          </div>
        </section>

        {/* Featured products section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Productos Destacados</h2>
            <Suspense fallback={<LoadingSkeleton count={4} compact />}>
              <FeaturedProducts />
            </Suspense>
          </div>
        </section>

        {/* Accessories section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Accesorios</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Completa tu look con nuestra selección de accesorios únicos
              </p>
            </div>
            <Suspense fallback={<LoadingSkeleton count={4} compact />}>
              <AccessoriesPreview />
            </Suspense>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
