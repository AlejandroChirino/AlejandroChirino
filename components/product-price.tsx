"use client"

import React from "react"
import { formatPrice } from "@/lib/utils"

export default function ProductPrice({
  price,
  sale_price,
  on_sale,
  compact = false,
  className = "",
}: {
  price: number | string
  sale_price?: number | string | null
  on_sale?: boolean | null
  compact?: boolean
  className?: string
}) {
  const p = Number(price)
  const s = sale_price == null ? null : Number(sale_price)
  const hasSale = !!(on_sale && s != null && Number.isFinite(s) && s < p)

  if (hasSale) {
    return (
      <div className={className}>
        <p className={compact ? "m-0 text-sm font-semibold text-red-600" : "m-0 text-base md:text-lg font-semibold text-red-600"}>
          {formatPrice(s as number)}
        </p>
        <p className={compact ? "m-0 text-xs line-through text-gray-400" : "m-0 text-sm line-through text-gray-400"}>
          {formatPrice(p)}
        </p>
      </div>
    )
  }

  return (
    <p className={`m-0 ${className} ${compact ? "text-sm font-semibold text-gray-900" : "text-base md:text-lg font-semibold text-gray-900"}`}>
      {formatPrice(p)}
    </p>
  )
}
