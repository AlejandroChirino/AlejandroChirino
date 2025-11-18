import Footer from "@/components/footer"
import LoadingSkeleton from "@/components/loading-skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen">
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8 text-center">
            <div className="h-10 w-40 bg-gray-200 rounded-md mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-96 max-w-full bg-gray-200 rounded-md mx-auto animate-pulse" />
          </div>

          <LoadingSkeleton count={8} compact />
        </div>
      </main>

      <Footer />
    </div>
  )
}
