"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import CouponForm from "../../CouponForm"

export default function EditCouponPage() {
  const pathname = usePathname()
  const [coupon, setCoupon] = useState<any | null>(null)

  useEffect(() => {
    const parts = pathname?.split("/") || []
    const id = parts[parts.length - 1]
    if (!id) return
    const raw = localStorage.getItem("lafashion_coupons_v1")
    const list = raw ? JSON.parse(raw) : []
    const found = list.find((c: any) => c.id === id) || null
    setCoupon(found)
  }, [pathname])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Editar cupón</h1>
          <p className="text-sm text-gray-600">Modifica los detalles del cupón y guarda los cambios.</p>
        </div>

        {coupon ? <CouponForm initial={coupon} /> : <div className="p-6 bg-white rounded shadow">Cargando cupón...</div>}
      </div>
    </div>
  )
}
