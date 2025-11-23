"use client"

import { ShoppingBag } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface CartBadgeProps {
  className?: string
}

export default function CartBadge({ className }: CartBadgeProps) {
  const { itemCount } = useCart()

  return (
    <Link href="/carrito" className={cn("relative inline-flex items-center", className)} aria-label="Ver carrito de compras">
      <span className="relative inline-flex items-center">
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-[9px] font-medium rounded-full w-3 h-3 flex items-center justify-center">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </span>
    </Link>
  )
}
