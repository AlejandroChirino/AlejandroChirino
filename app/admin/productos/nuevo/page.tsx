"use client"

import { ProductForm } from "@/components/admin/product-form"
import { useRouter } from "next/navigation"

export default function NuevoProductoPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/admin/productos")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductForm onSuccess={handleSuccess} allowMultiple />
    </div>
  )
}
