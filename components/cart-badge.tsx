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
    <Link href="/carrito" className={cn("relative", className)} aria-label="Ver carrito de compras">
      <ShoppingBag className="h-4 w-4" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  )
}
