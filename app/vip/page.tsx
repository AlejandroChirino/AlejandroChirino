import { Suspense } from "react"
import Footer from "@/components/footer"
import VipClient from "./VipClient"

export default function VipPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Suspense fallback={<div className="text-center py-8">Cargando...</div>}>
            <VipClient />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  )
}
