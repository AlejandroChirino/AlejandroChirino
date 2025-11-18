import { Suspense } from "react"
import Footer from "@/components/footer"
import HombreClient from "./HombreClient"

export default function HombrePage() {
  return (
    <div className="min-h-screen">
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Suspense fallback={<div className="text-center py-8">Cargando...</div>}>
            <HombreClient />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  )
}

