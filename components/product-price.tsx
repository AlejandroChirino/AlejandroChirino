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
        <p className={compact ? "text-sm font-bold text-red-600" : "text-base md:text-lg font-bold text-red-600"}>
          {formatPrice(s as number)}
        </p>
        <p className={compact ? "text-xs line-through text-[var(--brand-green)]" : "text-sm line-through text-[var(--brand-green)]"}>
          {formatPrice(p)}
        </p>
      </div>
    )
  }

  return (
    <p className={`${className} ${compact ? "text-sm font-bold text-accent-orange" : "text-base md:text-lg font-bold text-accent-orange"}`}>
      {formatPrice(p)}
    </p>
  )
}
