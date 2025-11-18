import { Suspense } from "react"
import Footer from "@/components/footer"
import dynamic from "next/dynamic"

const AccesoriosClient = dynamic(() => import("./AccesoriosClient"), { ssr: false })

export default function AccesoriosPage() {
  return (
    <div className="min-h-screen">
      <main className="py-8">
        <Suspense fallback={<div className="text-center py-8">Cargando...</div>}>
          <AccesoriosClient />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
