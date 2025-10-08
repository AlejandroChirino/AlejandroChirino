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
      <ShoppingBag className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-accent-orange text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  )
}
