import Header from "@/components/header"
import Footer from "@/components/footer"
import LoadingSkeleton from "@/components/loading-skeleton"

export default function RebajasLoading() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero section skeleton */}
          <div className="mb-8 text-center">
            <div className="h-10 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded-lg w-96 mx-auto animate-pulse" />
          </div>

          {/* Subcategory tabs skeleton */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 md:gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-full w-24 animate-pulse" />
              ))}
            </div>
          </div>

          {/* Products grid skeleton */}
          <LoadingSkeleton count={8} compact />
        </div>
      </main>

      <Footer />
    </div>
  )
}
