import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import { createServerClient } from "@/lib/supabase/server"

export default async function FavoritosPage() {
  const supabase = await createServerClient()
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id

  let favorites: any[] = []
  if (userId) {
    const { data, error } = await supabase
      .from("favorites")
      .select(
        `
        id,
        created_at,
        products (
          id,
          name,
          description,
          price,
          sale_price,
          on_sale,
          image_url,
          category
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching favorites:", error)
    } else if (Array.isArray(data)) {
      favorites = data
    }
  }

  return (
    <div className="min-h-screen">
      <Header initialUser={userData?.user ?? null} />

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Mis Favoritos</h1>

          {!userId ? (
            <div className="text-center py-16">
              <p className="text-gray-700">Debes iniciar sesión para ver tus favoritos en todos tus dispositivos.</p>
              <a
                href="/cuenta"
                className="inline-block mt-4 bg-accent-orange text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Iniciar sesión
              </a>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💝</div>
              <h2 className="text-xl font-semibold mb-2">No tienes favoritos aún</h2>
              <p className="text-gray-600 mb-6">Guarda los productos que te gusten para encontrarlos fácilmente</p>
              <a
                href="/"
                className="inline-block bg-accent-orange text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Explorar Productos
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {favorites.map((f) => (
                <ProductCard key={f.id} product={f.products} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
