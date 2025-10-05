import Header from "@/components/header"
import Footer from "@/components/footer"

export default function FavoritosPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Mis Favoritos</h1>

          {/* Estado vacío */}
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

          {/* Cuando haya favoritos, mostrar grid */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProductCard
              id="1"
              name="Producto Favorito"
              price={89.99}
              image="/placeholder.svg?height=400&width=300&query=favorite product"
              category="mujer"
            />
          </div> */}
        </div>
      </main>

      <Footer />
    </div>
  )
}
