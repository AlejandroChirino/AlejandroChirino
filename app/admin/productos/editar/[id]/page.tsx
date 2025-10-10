"use client"

import React from "react"
import { ProductForm } from "@/components/admin/product-form"
import { useRouter } from "next/navigation"

interface EditProductPageProps {
  // En Next.js 15+, params es una Promesa en componentes cliente
  params: Promise<{ id: string }>
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const resolvedParams = React.use(params) as { id: string }
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/admin/productos")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductForm productId={resolvedParams.id} onSuccess={handleSuccess} />
    </div>
  )
}
