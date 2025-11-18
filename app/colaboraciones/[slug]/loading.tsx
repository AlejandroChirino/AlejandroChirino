// Header provisto por RootLayout
import Footer from "@/components/footer"

export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Header ya incluido en el layout raíz */}

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse space-y-8">
            {/* Breadcrumbs skeleton */}
            <div className="h-4 bg-gray-200 rounded w-1/3" />

            {/* Back button skeleton */}
            <div className="h-4 bg-gray-200 rounded w-1/4" />

            {/* Main content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-[4/5] bg-gray-200 rounded-lg" />
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-20 bg-gray-200 rounded" />
                <div className="h-12 bg-gray-200 rounded w-1/2" />
              </div>
            </div>

            {/* Products section skeleton */}
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="aspect-[3/4] bg-gray-200 rounded-lg" />
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
