import Header from "@/components/header"
import Footer from "@/components/footer"
import LoadingSkeleton from "@/components/loading-skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero skeleton */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 animate-pulse" />
            <div className="h-12 w-64 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-96 max-w-full bg-gray-200 rounded mx-auto animate-pulse" />
          </div>

          {/* Benefits skeleton */}
          <div className="bg-gray-200 rounded-2xl h-64 mb-16 animate-pulse" />

          {/* Products skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-gray-200 rounded-lg h-64 animate-pulse" />
            </div>
            <div className="lg:col-span-3">
              <LoadingSkeleton count={6} compact />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
