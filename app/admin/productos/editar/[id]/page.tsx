"use client"

import { ProductForm } from "@/components/admin/product-form"
import { useRouter } from "next/navigation"

interface EditProductPageProps {
  params: { id: string }
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/admin/productos")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductForm productId={params.id} onSuccess={handleSuccess} />
    </div>
  )
}
