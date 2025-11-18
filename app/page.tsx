import { Suspense } from "react"
import Footer from "@/components/footer"
import LoadingSkeleton from "@/components/loading-skeleton"
import { supabase } from "@/lib/supabaseClient"
import ProductCarousel from "@/components/product-carousel"
import Image from "next/image"

// Featured products component
async function FeaturedProducts() {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, price, sale_price, on_sale, image_url, category")
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
      .select("id, name, price, sale_price, on_sale, image_url, category")
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
      .from("products_with_effective_price")
      .select("id, name, price, sale_price, on_sale, image_url, category")
      .gte("created_at", sevenDaysAgoISO)
      .limit(20)
      .order("weekly_hash", { ascending: true })

    if (error || !products || products.length === 0) {
      return (
        <div className="text-center py-8">
          <a
            href="/nuevo"
            className="inline-block border border-gray-800 text-gray-800 bg-transparent px-6 py-3 rounded-none hover:bg-gray-50 transition-colors"
          >
            Ver Novedades
          </a>
        </div>
      )
    }

    return (
      <div>
        <ProductCarousel products={products} square />
        <div className="text-center mt-4">
          <a
            href="/nuevo"
            className="inline-block border border-gray-800 text-gray-800 bg-transparent px-6 py-3 rounded-none hover:bg-gray-50 transition-colors"
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

// Tendencias destacadas (lee de la tabla `trend_reports`)
async function FeaturedTrends() {
  try {
    const { data: trends, error } = await supabase
      .from("trend_reports")
      .select("id, name, image_url, product_id, position, created_at")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(4)

    if (error) {
      console.error("Error fetching trend reports:", error)
      return (
        <div className="text-center text-gray-500 py-8">
          <p>Error al cargar tendencias destacadas</p>
        </div>
      )
    }

    if (!trends || trends.length === 0) {
      return (
        <div className="text-center py-8">
          <p>No hay tendencias disponibles</p>
        </div>
      )
    }

    return (
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-extrabold text-black uppercase mb-4 tracking-tighter">TENDENCIAS DESTACADAS</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {trends.map((t: any) => (
            <a key={t.id} href={`/producto/${t.product_id}`} className="block bg-white overflow-hidden rounded-none">
              <div className="w-full h-56 md:h-64 bg-gray-100 overflow-hidden">
                {t.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.image_url} alt={t.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Imagen</div>
                )}
              </div>
              <div className="py-2 text-center font-bold text-black tracking-tighter">{t.name}</div>
            </a>
          ))}
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading trends:", error)
    return null
  }
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <main>
        {/* Hero section */}
        <section className="relative h-screen">
          {/* Background image */}
          <Image
            src="/pexels-hikaique-561656.jpg"
            alt="La L Fashion"
            fill
            className="absolute inset-0 w-full h-full object-cover"
            priority
          />
          {/* Dark overlay to ensure text contrast */}
          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-4xl mx-auto px-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">La L Fashion</h1>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/todo"
                  className="btn-white-outline-sm font-medium uppercase"
                >
                  EXPLORAR TIENDA
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Tendencias Destacadas */}
        <section className="pt-4 pb-0 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<LoadingSkeleton count={4} compact />}>
              {/* FeaturedTrends is an async server component defined above */}
              <FeaturedTrends />
            </Suspense>
          </div>
        </section>

        {/* Banner Mujer */}
        <section id="BannerMujer" className="pt-4">
          <div className="relative w-full h-screen">
            {/* Background image */}
            <Image
              src="/pexels-dantemunozphoto-16152528.jpg"
              alt="Mujer - La L Fashion"
              fill
              className="absolute inset-0 w-full h-full object-cover"
              priority
            />
            {/* Dark overlay to ensure contrast */}
            <div className="absolute inset-0 bg-black/40" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-4xl mx-auto px-4">
                <h3 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tighter tracked-strong">WOMEN</h3>
                <div className="flex justify-center">
                  <a href="/mujer" className="btn-white-outline-sm font-medium">
                    Explorar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* New products section */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-4 tracked-strong">Novedades</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Descubre nuestros productos más recientes, añadidos en los últimos 7 días
              </p>
            </div>
            <Suspense fallback={<LoadingSkeleton count={4} compact />}>
              <NewProductsPreview />
            </Suspense>
          </div>
        </section>

        {/* Banner Hombre (MAN) - posicionado a 3/4 de la altura */}
        <section id="BannerHombre" className="pt-0">
          <div className="relative w-full h-screen">
            {/* Background image */}
            <Image
              src="/pexels-lucasmonteiro-1868471.jpg"
              alt="Hombre - La L Fashion"
              fill
              className="absolute inset-0 w-full h-full object-cover"
              priority
            />
            {/* Dark overlay to ensure contrast */}
            <div className="absolute inset-0 bg-black/40" />

            <div className="absolute left-0 right-0 top-[75%]">
              <div className="text-center max-w-4xl mx-auto px-4">
                <h3 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tighter tracked-strong">MAN</h3>
                <div className="flex justify-center">
                  <a href="/hombre" className="btn-white-outline-sm font-medium">
                    Explorar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Banner Rebajas */}
        <section id="BannerRebajas" className="pt-0">
          <div className="relative w-full h-screen">
            <Image
              src="/pexels-peterfazekas-953782.jpg"
              alt="Rebajas - La L Fashion"
              fill
              className="absolute inset-0 w-full h-full object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute left-0 right-0 top-[60%] flex items-center justify-center">
              <div className="text-center px-4">
                <h2 className="font-bebas text-white text-8xl md:text-[110px] uppercase mb-2">REBAJAS</h2>
                <h3 className="font-bebas text-white text-6xl md:text-[84px] uppercase mb-4">EXCLUSIVAS</h3>
                <p className="text-white text-base md:text-lg mb-6">rebajas de black friday</p>
                <div className="flex justify-center">
                  <a href="/rebajas" className="btn-white-outline-sm font-medium">
                    Explorar
                  </a>
                </div>
              </div>
            </div>
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
