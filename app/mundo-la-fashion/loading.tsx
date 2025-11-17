// Header provisto por RootLayout
import Footer from "@/components/footer"

export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Header ya incluido en el layout raíz */}

      <main>
        {/* Hero skeleton */}
        <section className="h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center animate-pulse">
            <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-8" />
            <div className="h-16 w-96 bg-gray-700 rounded mx-auto mb-6" />
            <div className="h-6 w-[600px] bg-gray-700 rounded mx-auto" />
          </div>
        </section>

        {/* Content skeleton */}
        <div className="py-16 px-4">
          <div className="max-w-7xl mx-auto space-y-16">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="text-center mb-12">
                  <div className="h-12 w-64 bg-gray-200 rounded mx-auto mb-4" />
                  <div className="h-6 w-96 bg-gray-200 rounded mx-auto" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="aspect-[4/5] bg-gray-200 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
