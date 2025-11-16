"use client"

import React from "react"
import { formatPrice } from "@/lib/utils"

export default function ProductDiscountBadge({
  price,
  sale_price,
  on_sale,
  className = "",
}: {
  price: number | string
  sale_price?: number | string | null
  on_sale?: boolean | null
  className?: string
}) {
  const p = Number(price)
  const s = sale_price == null ? null : Number(sale_price)
  const has = !!(on_sale && s != null && Number.isFinite(s) && s < p)
  if (!has) return null

  const discount = Math.round(((p - (s as number)) / p) * 100)

  return (
    <div className={`${className} bg-red-500 text-white px-2 py-1 rounded text-sm font-medium`}>
      -{discount}%
    </div>
  )
}
