"use client"

import CouponForm from "../CouponForm"

export default function NewCouponPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Crear cupón</h1>
          <p className="text-sm text-gray-600">Rellena las secciones a continuación para crear la promoción.</p>
        </div>

        <CouponForm />
      </div>
    </div>
  )
}
